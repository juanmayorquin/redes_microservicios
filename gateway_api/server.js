const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000; // Puerto para la API Gateway

const services = [
    {
        route: '/usuarios',
        target: 'http://localhost:3001', // Puerto para el servicio de usuarios
    },
    {
        route: '/productos',
        target: 'http://localhost:3002', // Puerto para el servicio de productos
    },
    {
        route: '/carrito',
        target: 'http://localhost:3003', // Puerto para el servicio de carrito
    },
    {
        route: '/pedidos',
        target: 'http://localhost:3004', // Puerto para el servicio de pedidos
    },
    {
        route: '/pagos',
        target: 'http://localhost:3005', // Puerto para el servicio de pagos
    },
];

// Configurar un proxy para cada microservicio
services.forEach(({ route, target }) => {
    app.use(route, createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: (path, req) => {
            // Elimina el prefijo de la ruta antes de reenviar
            // Ejemplo: /usuarios/login -> /login
            return path.replace(route, '');
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[Gateway] Redirigiendo ${req.method} ${req.path} a ${target}${proxyReq.path}`);
        },
        onError: (err, req, res) => {
            console.error('[Gateway] Error en el proxy:', err);
            res.status(500).send('Error interno del servidor al contactar el microservicio.');
        }
    }));
});

app.get('/', (req, res) => {
    res.send('API Gateway funcionando. Rutas disponibles: /usuarios, /productos, /carrito, /pedidos, /pagos');
});

app.listen(PORT, () => {
    console.log(`API Gateway escuchando en el puerto ${PORT}`);
    console.log('Microservicios configurados (puertos por defecto, verificar y ajustar):');
    services.forEach(service => {
        console.log(`  Ruta: ${service.route} -> Destino: ${service.target}`);
    });
});