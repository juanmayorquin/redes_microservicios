// src/controllers/pedidosController.js

const db = require('../db'); // Asegúrate que esta ruta sea correcta a tu conexión de DB

exports.getAllPedidos = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM pedidos');
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener pedidos:', err);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
};

exports.createPedido = async (req, res) => {
    const { usuario_id, items } = req.body;
    // ... toda la lógica que ya tienes para crear pedido ...
    const total = items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0);

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [pedidoResult] = await conn.execute(
            `INSERT INTO pedidos (usuario_id, total) VALUES (?, ?)`,
            [usuario_id, total]
        );

        const pedidoId = pedidoResult.insertId;

        const itemInserts = items.map(item =>
            conn.execute(
                `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)`,
                [pedidoId, item.producto_id, item.cantidad, item.precio_unitario]
            )
        );

        await Promise.all(itemInserts);
        await conn.commit();

        res.status(201).json({ mensaje: 'Pedido creado', pedidoId });
    } catch (err) {
        await conn.rollback();
        console.error('Error al crear el pedido:', err);
        res.status(500).json({ error: 'Error al crear el pedido' });
    } finally {
        conn.release();
    }
};

exports.getPedidoById = async (req, res) => {
    const pedidoId = req.params.id;
    try {
        const [[pedido]] = await db.execute('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

        const [items] = await db.execute('SELECT * FROM pedido_items WHERE pedido_id = ?', [pedidoId]);

        res.json({ pedido, items });
    } catch (err) {
        console.error('Error al obtener detalle del pedido:', err);
        res.status(500).json({ error: 'Error al obtener detalle del pedido' });
    }
};

exports.updatePedido = async (req, res) => {
    const pedidoId = req.params.id;
    const { estado } = req.body;

    if (!['pendiente', 'enviado', 'entregado'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
    }

    try {
        const [result] = await db.execute('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, pedidoId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

        res.json({ mensaje: 'Estado actualizado' });
    } catch (err) {
        console.error('Error al actualizar estado del pedido:', err);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

// Si tienes una función de eliminar
exports.deletePedido = async (req, res) => {
    const pedidoId = req.params.id;
    try {
        const [result] = await db.execute('DELETE FROM pedidos WHERE id = ?', [pedidoId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        res.json({ message: 'Pedido eliminado exitosamente' });
    } catch (err) {
        console.error('Error al eliminar pedido:', err);
        res.status(500).json({ error: 'Error al eliminar pedido' });
    }
};