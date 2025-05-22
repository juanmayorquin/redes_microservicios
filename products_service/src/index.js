const express = require('express');
const app = express();
const productosRouter = require('./controllers/productosRouter');

app.use(express.json());

app.use('/api/products', productosRouter);

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
