// src/routes/pedidosRoutes.js

const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController'); // ¡Importa el controlador!

// Define tus rutas asociando el método HTTP y la ruta con las funciones del controlador
router.post('/', pedidosController.createPedido);
router.get('/', pedidosController.getAllPedidos);
router.get('/:id', pedidosController.getPedidoById);
router.put('/:id', pedidosController.updatePedido);
router.delete('/:id', pedidosController.deletePedido); // Si tienes esta ruta

module.exports = router; // ¡Exporta el router!