const mysql = require("mysql2/promise");

// Conexión directa a la base de datos del microservicio de productos
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'productosMS'
});

const Producto = {
  getAll: async () => {
    const [rows] = await connection.query('SELECT * FROM productos');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await connection.query('SELECT * FROM productos WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (producto) => {
    const { nombre, descripcion, precio, categoria, stock, imagenURL } = producto;
    const [result] = await connection.query(
      'INSERT INTO productos (nombre, descripcion, precio, categoria, stock, imagenURL) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, categoria, stock, imagenURL]
    );
    return { id: result.insertId, ...producto };
  },

  update: async (id, producto) => {
    const { nombre, descripcion, precio, categoria, stock, imagenURL } = producto;
    await connection.query(
      'UPDATE productos SET nombre=?, descripcion=?, precio=?, categoria=?, stock=?, imagenURL=? WHERE id=?',
      [nombre, descripcion, precio, categoria, stock, imagenURL, id]
    );
  },

  delete: async (id) => {
    await connection.query('DELETE FROM productos WHERE id = ?', [id]);
  },
};

module.exports = Producto;
