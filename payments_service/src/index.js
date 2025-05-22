const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const pagosController = require('./controllers/pagosController');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(pagosController);

app.listen(3005, () => {
    console.log('Microservicio de pagos corriendo en el puerto 3005');
});
