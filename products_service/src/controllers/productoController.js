const Producto = require('../models/productoModel');

const productosController = {
  // Listar todos los productos
  listarProductos: async (req, res) => {
    try {
      const productos = await Producto.getAll();
      res.json(productos);
    } catch (error) {
      console.error('Error al listar productos:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },

  // Obtener detalle de un producto por id
  obtenerProductoPorId: async (req, res) => {
    try {
      const id = req.params.id;
      const producto = await Producto.getById(id);
      if (!producto) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }
      res.json(producto);
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },

  // Crear un producto nuevo (solo admin)
  crearProducto: async (req, res) => {
    try {
      const productoData = req.body;
      // Aquí podrías validar los datos antes de crear (RF17)
      const nuevoProducto = await Producto.create(productoData);
      res.status(201).json(nuevoProducto);
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },

  // Actualizar producto por id (solo admin)
  actualizarProducto: async (req, res) => {
    try {
      const id = req.params.id;
      const productoData = req.body;

      const productoExistente = await Producto.getById(id);
      if (!productoExistente) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }

      await Producto.update(id, productoData);
      res.json({ mensaje: 'Producto actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },

  // Eliminar producto por id (solo admin)
  eliminarProducto: async (req, res) => {
    try {
      const id = req.params.id;
      const productoExistente = await Producto.getById(id);
      if (!productoExistente) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }
      await Producto.delete(id);
      res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  }
};

module.exports = productosController;
