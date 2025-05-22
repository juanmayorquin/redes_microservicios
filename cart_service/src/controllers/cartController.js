const express = require('express'); // <-- ¡Necesitas esta línea!
const { Router } = express;         // <-- ¡Y esta línea para obtener Router de express!

const Cart = require('../models/cartModels'); // Asegúrate que la ruta a cartModels sea correcta
const router = Router();
const axios = require('axios');

// Nueva ruta para probar conexión al servicio de usuarios
router.get('/user/:id', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.USERS_SERVICE_URL}/${req.params.id}`);
    res.status(200).json({ message: 'Usuario encontrado', user: response.data });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo conectar al servicio de usuarios', details: error.message });
  }
});

// POST: Agregar producto al carrito o incrementar cantidad
router.post('/', async (req, res) => {
  const { userId, productId, name, price, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, name, price, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

// PUT: Modificar cantidad de un artículo
router.put('/item/:productId', async (req, res) => {
  const { userId, quantity } = req.body;
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al modificar cantidad' });
  }
});

// PUT: Eliminar un artículo del carrito
router.put('/item/:productId/remove', async (req, res) => {
  const { userId } = req.body;
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    cart.items = cart.items.filter(item => item.productId !== productId);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Ruta para testear conexión con MongoDB
router.get('/test-db', async (req, res) => {
  try {
    // Crear un documento temporal
    const testDoc = new Cart({
      userId: 'test-user',
      items: [{ productId: 'test-product', name: 'Test Producto', price: 10, quantity: 1 }]
    });

    // Guardar el documento
    await testDoc.save();

    // Buscar todos los carritos de 'test-user'
    const carts = await Cart.find({ userId: 'test-user' });

    // Responder con los documentos encontrados
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: 'Error al probar conexión con MongoDB', details: error.message });
  }
});

// GET: Obtener estado del carrito
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});

// DELETE: Eliminar carrito completo
router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await Cart.deleteOne({ userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.status(200).json({ message: 'Carrito eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el carrito' });
  }
});

module.exports = router;

