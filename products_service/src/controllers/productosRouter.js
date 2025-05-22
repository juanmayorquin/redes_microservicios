const express = require('express');
const router = express.Router();
const productosController = require('./productoController');

router.get('/', productosController.listarProductos);
router.get('/:id', productosController.obtenerProductoPorId);
router.post('/', productosController.crearProducto);
router.put('/:id', productosController.actualizarProducto);
router.delete('/:id', productosController.eliminarProducto);

module.exports = router;
