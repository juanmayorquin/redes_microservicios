// src/index.js
const express = require('express');
const morgan = require('morgan');
const pedidosRoutes = require('./routes/pedidosRoutes'); // Asegúrate de que la ruta sea correcta

const app = express();

app.use(morgan('dev'));
app.use(express.json());

// Aquí se monta el router en /api
app.use('/api/pedidos', pedidosRoutes);

app.get('/', (req, res) => {
    res.send('Servidor corriendo');
});

app.listen(3004, () => {
    console.log('backPedidos ejecutandose en el puerto 3004');
});
