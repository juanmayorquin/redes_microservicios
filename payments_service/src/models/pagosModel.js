const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    port: 3307,          // <— aquí el puerto correcto de tu MySQL
    user: 'root',
    password: '',
    database: 'pagosMS',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  

// Verifica si el cliente existe
async function clienteExiste(cliente_id) {
    const [result] = await db.query('SELECT id FROM clientes WHERE id = ?', [cliente_id]);
    return result.length > 0;
}

// Guarda el método de pago en formato JSON
async function guardarMetodoPago(cliente_id, tipo, detalle) {
    const [result] = await db.query(
        'INSERT INTO metodos_pago (cliente_id, tipo, detalle) VALUES (?, ?, ?)',
        [cliente_id, tipo, JSON.stringify(detalle)]
    );
    return result;
}

// Obtener métodos de pago por cliente
async function obtenerMetodosPago(cliente_id) {
    const [result] = await db.query(
        'SELECT id, tipo, detalle FROM metodos_pago WHERE cliente_id = ?',
        [cliente_id]
    );


    return result.map(entry => {
    let parsedDetalle;
    try {
        if (typeof entry.detalle === 'string') {
            parsedDetalle = JSON.parse(entry.detalle);
        } else {
            parsedDetalle = entry.detalle; // ya es objeto
        }
    } catch (e) {
        console.error("Error al parsear JSON en 'detalle':", entry.detalle, e);
        throw new Error("Error al convertir el campo 'detalle'");
    }

    return {
        id: entry.id, // 👈 esto es lo que falta
        tipo: entry.tipo,
        detalle: parsedDetalle
    };
});

}

// Verifica si el método de pago pertenece al cliente
async function metodoPerteneceAlCliente(metodo_id, cliente_id) {
    const [result] = await db.query(
        'SELECT id FROM metodos_pago WHERE id = ? AND cliente_id = ?',
        [metodo_id, cliente_id]
    );
    return result.length > 0;
}

// Elimina un método de pago por ID
async function eliminarMetodoPago(metodo_id) {
    const [result] = await db.query(
        'DELETE FROM metodos_pago WHERE id = ?',
        [metodo_id]
    );
    return result;
}



module.exports = {
    metodoPerteneceAlCliente,
    eliminarMetodoPago,
    clienteExiste,
    guardarMetodoPago,
    obtenerMetodosPago
};

