const { Router } = require('express');
const router = Router();
const pagosModel = require('../models/pagosModel');

// Validación mejorada de métodos de pago
function validarMetodoPago(tipo, datos) {
  switch (tipo) {
    case 'tarjeta':
      // 1) Formato número y expiración
      if (!/^\d{16}$/.test(datos.numero)) return false;
      if (!/^\d{2}\/\d{2}$/.test(datos.expiracion)) return false;

      // 2) Extraer mes y año
      const [mesStr, anioStr] = datos.expiracion.split('/');
      const mes = parseInt(mesStr, 10);
      const anio = 2000 + parseInt(anioStr, 10); // convierte "25" → 2025

      // 3) Mes válido
      if (mes < 1 || mes > 12) return false;

      // 4) Comparar con hoy
      const hoy = new Date();
      // Último día del mes de expiración: new Date(año, mes, 0)
      const ultimaFecha = new Date(anio, mes, 0);

      if (ultimaFecha < hoy) {
        // tarjeta expirada
        return false;
      }
      return true;

    case 'pse':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo);

    case 'nequi':
      return /^3\d{9}$/.test(datos.numero);

    default:
      return false;
  }
}


router.post('/payments', async (req, res) => {
    const { cliente_id, tipo, detalle, guardar } = req.body;

    if (!cliente_id || !tipo || !detalle) {
        return res.status(400).send("Faltan datos obligatorios.");
    }

    // Verificar si el cliente existe en la base de datos
    const existe = await pagosModel.clienteExiste(cliente_id);
    if (!existe) {
        return res.status(404).send("Cliente no encontrado.");
    }

    // Validar el método de pago
    if (!validarMetodoPago(tipo, detalle)) {
        return res.status(400).send("Método de pago no válido.");
    }

    try {
        if (guardar) {
            await pagosModel.guardarMetodoPago(cliente_id, tipo, detalle);
        }
        res.send("Pago exitoso.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al procesar el pago.");
    }
});

router.get('/payments/:cliente_id', async (req, res) => {
    const { cliente_id } = req.params;

    const existe = await pagosModel.clienteExiste(cliente_id);
    if (!existe) {
        return res.status(404).send("Cliente no encontrado.");
    }

    try {
        const metodos = await pagosModel.obtenerMetodosPago(cliente_id);
        res.json(metodos);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al obtener métodos de pago.");
    }
});

router.delete('/payments/:metodo_id', async (req, res) => {
    const { metodo_id } = req.params;
    const { cliente_id } = req.body;  // En producción esto vendría del token autenticado

    if (!cliente_id) {
        return res.status(400).send("Se requiere cliente_id.");
    }

    // Verificar si el método de pago pertenece al cliente
    const autorizado = await pagosModel.metodoPerteneceAlCliente(metodo_id, cliente_id);
    if (!autorizado) {
        return res.status(403).send("No autorizado para eliminar este método de pago.");
    }

    try {
        await pagosModel.eliminarMetodoPago(metodo_id);
        res.status(200).send("Método de pago eliminado.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al eliminar el método de pago.");
    }
});



module.exports = router;
