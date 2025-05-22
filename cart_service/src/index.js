const express = require('express');
const mongoose = require('mongoose'); // Importa Mongoose
const morgan = require('morgan'); // Para logs de solicitudes (opcional, pero recomendado)

const cartController = require('./controllers/cartController'); // Importa tu cartController

const app = express();

// Middlewares
app.use(morgan('dev')); // Logger de solicitudes HTTP
app.use(express.json()); // Para parsear cuerpos de solicitud JSON

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carritos_db'; // Usa tu URI de MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Rutas del Carrito
app.use('/api/cart', cartController); // Monta tu cartController con el prefijo /api/cart

// Ruta de prueba simple para el microservicio de carrito
app.get('/', (req, res) => {
  res.send('Microservicio de Carrito funcionando. Visita /api/cart para las rutas del carrito.');
});

// Definir el puerto
const PORT = 3003; // Usamos un puerto diferente (ej. 3003) para el microservicio de carrito

app.listen(PORT, () => {
  console.log(`Microservicio de Carrito ejecutándose en http://localhost:${PORT}`);
});