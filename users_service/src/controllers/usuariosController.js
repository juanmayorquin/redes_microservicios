const express = require('express');
const router = express.Router();
const usuariosModel = require('../models/usuariosModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'mi_clave_secreta_muy_segura';


router.post('/registro', async (req, res) => {
    console.log(req.body);  // <-- VERIFICAR QUÉ LLEGA
    const { nombre, email, password, rol = 'cliente' } = req.body; // Añade rol como opcional
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan datos' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Email inválido' });
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    if (rol !== 'cliente' && rol !== 'administrador') return res.status(400).json({ error: 'Rol inválido' });

    try {
        const existingUser = await usuariosModel.traerUsuarioPorEmail(email);
        if (existingUser) return res.status(409).json({ error: 'El email ya está registrado' });

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await usuariosModel.crearUsuario(nombre, email, passwordHash, rol); // Pasa el rol
        if (result.affectedRows) {
            const usuario = { id: result.insertId, nombre, email, rol };
            res.status(201).json(usuario);
        } else {
            res.status(500).json({ error: 'Error al registrar usuario' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });

    try {
        const usuario = await usuariosModel.traerUsuarioPorEmail(email);
        if (!usuario || usuario.estado === false) return res.status(401).json({ error: 'Credenciales inválidas' });
        if (!(await bcrypt.compare(password, usuario.passwordHash))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, rol: usuario.rol }); // Devuelve el rol junto con el token
    } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
}
});
router.get('/perfil', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const usuario = await usuariosModel.traerUsuarioPorId(decoded.id);
    delete usuario.passwordHash;
    res.json(usuario);
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

router.put('/perfil', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { nombre, email, password } = req.body;
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
    const result = await usuariosModel.actualizarUsuario(decoded.id, nombre, email, passwordHash);
    if (result.affectedRows) res.send('Perfil actualizado');
    else res.status(500).json({ error: 'Error al actualizar' });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

router.delete('/perfil', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const result = await usuariosModel.desactivarUsuario(decoded.id);
    if (result.affectedRows) res.send('Cuenta desactivada');
    else res.status(500).json({ error: 'Error al desactivar' });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
});
// Middleware para verificar que el usuario es administrador
const esAdministrador = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded.rol !== 'administrador') {
            return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
        }
        req.user = decoded; // Guardamos los datos del usuario para usarlos después
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// GET: Listar todos los usuarios
router.get('/', esAdministrador, async (req, res) => {
    try {
        const usuarios = await usuariosModel.listarUsuarios();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: 'Error al listar usuarios' });
    }
});

// PUT: Actualizar un usuario
router.put('/:id', esAdministrador, async (req, res) => {
    const { id } = req.params;
    const { nombre, email, rol, estado } = req.body;

    if (!nombre && !email && !rol && !estado) {
        return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    if (rol && rol !== 'cliente' && rol !== 'administrador') {
        return res.status(400).json({ error: 'Rol inválido' });
    }

    if (estado && estado !== 'activo' && estado !== 'deshabilitado') {
        return res.status(400).json({ error: 'Estado inválido' });
    }

    try {
        const usuario = await usuariosModel.traerUsuarioPorId(id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        if (email && email !== usuario.email) {
            const existingUser = await usuariosModel.traerUsuarioPorEmail(email);
            if (existingUser) return res.status(409).json({ error: 'El email ya está registrado' });
        }

        const result = await usuariosModel.actualizarUsuarioAdmin(id, nombre, email, rol, estado);
        if (result.affectedRows) {
            res.send('Usuario actualizado');
        } else {
            res.status(500).json({ error: 'Error al actualizar usuario' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// DELETE: Eliminar un usuario
router.delete('/:id', esAdministrador, async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await usuariosModel.traerUsuarioPorId(id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const result = await usuariosModel.eliminarUsuario(id);
        if (result.affectedRows) {
            res.send('Usuario eliminado');
        } else {
            res.status(500).json({ error: 'Error al eliminar usuario' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
module.exports = router;
