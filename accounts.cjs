require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'users',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function createUser(username, email, password) {
    // Check if username or email already exists
    const checkSql = 'SELECT id FROM usertable WHERE username = ? OR email = ?';
    const [rows] = await pool.query(checkSql, [username, email]);
    if (rows.length > 0) {
        throw new Error('Username or email already exists');
    }
    const password_hash = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO usertable (username, email, password_hash) VALUES (?, ?, ?)';
    const [result] = await pool.query(sql, [username, email, password_hash]);
    return result.insertId;
}

async function getUserByUsername(username) {
  const sql = 'SELECT * FROM usertable WHERE username = ?';
  const [rows] = await pool.query(sql, [username]);
  return rows[0];
}

async function getUserById(id) {
  const sql = 'SELECT id, username, email, created_at, updated_at FROM usertable WHERE id = ?';
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
}

async function updateUser(id, email, password) {
  const password_hash = password ? await bcrypt.hash(password, 10) : null;
  let sql, params;
  if (password_hash) {
    sql = 'UPDATE usertable SET email = ?, password_hash = ? WHERE id = ?';
    params = [email, password_hash, id];
  } else {
    sql = 'UPDATE usertable SET email = ? WHERE id = ?';
    params = [email, id];
  }
  const [result] = await pool.query(sql, params);
  return result.affectedRows;
}

async function deleteUser(id) {
  const sql = 'DELETE FROM usertable WHERE id = ?';
  const [result] = await pool.query(sql, [id]);
  return result.affectedRows;
}

module.exports = {
  pool,
  createUser,
  getUserByUsername,
  getUserById,
  updateUser,
  deleteUser,
};