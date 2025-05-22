const express = require('express');
const usuariosController = require('./controllers/usuariosController');
const morgan = require('morgan');

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use('/api/users', usuariosController);

app.listen(3001, () => {
  console.log('Microservicio de Usuarios en puerto 3001');
});