const mysql = require("mysql2/promise");

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Deja vacío si no configuraste contraseña en XAMPP
  database: 'usuariosMS'
});

async function traerUsuarioPorEmail(email) {
  const [result] = await connection.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return result[0];
}

async function traerUsuarioPorId(id) {
  const [result] = await connection.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  return result[0];
}

async function crearUsuario(nombre, email, passwordHash, rol = 'cliente') {
    const [result] = await connection.query(
        'INSERT INTO usuarios (nombre, email, passwordHash, rol) VALUES (?, ?, ?, ?)',
        [nombre, email, passwordHash, rol]
    );
    return result;
}

async function listarUsuarios() {
    const [result] = await connection.query('SELECT id, nombre, email, rol, estado, fechaCreacion FROM usuarios');
    return result;
}

async function actualizarUsuarioAdmin(id, nombre, email, rol, estado) {
    const updates = [];
    const values = [];
    if (nombre) { updates.push('nombre = ?'); values.push(nombre); }
    if (email) { updates.push('email = ?'); values.push(email); }
    if (rol) { updates.push('rol = ?'); values.push(rol); }
    if (estado) {
        const estadoBool = estado === 'activo' ? 1 : 0;
        updates.push('estado = ?'); 
        values.push(estadoBool);
    }
    if (updates.length === 0) return { affectedRows: 0 };
    values.push(id);
    const [result] = await connection.query(
        `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
        values
    );
    return result;
}

async function eliminarUsuario(id) {
    const [result] = await connection.query('DELETE FROM usuarios WHERE id = ?', [id]);
    return result;
}

// Asegúrate de exportar las nuevas funciones
module.exports = {
    traerUsuarioPorEmail,
    traerUsuarioPorId,
    crearUsuario,
    actualizarUsuarioAdmin, // Nueva función
    listarUsuarios,        // Nueva función
    eliminarUsuario        // Nueva función
};