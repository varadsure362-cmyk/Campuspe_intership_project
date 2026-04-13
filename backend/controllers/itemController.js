const db = require('../config/db');

const getItems = async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json({ items: rows });
};

const getItem = async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM items WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: 'Item not found' });
  }

  res.json({ item: rows[0] });
};

const createItem = async (req, res) => {
  const { title, description, status } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const [result] = await db.query(
    'INSERT INTO items (user_id, title, description, status) VALUES (?, ?, ?, ?)',
    [req.user.id, title, description || null, status || 'active']
  );

  const [newItem] = await db.query('SELECT * FROM items WHERE id = ?', [result.insertId]);

  res.status(201).json({ message: 'Item created', item: newItem[0] });
};

const updateItem = async (req, res) => {
  const { title, description, status } = req.body;

  const [existing] = await db.query(
    'SELECT * FROM items WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );

  if (existing.length === 0) {
    return res.status(404).json({ message: 'Item not found' });
  }

  await db.query(
    'UPDATE items SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?',
    [
      title || existing[0].title,
      description !== undefined ? description : existing[0].description,
      status || existing[0].status,
      req.params.id,
      req.user.id
    ]
  );

  const [updated] = await db.query('SELECT * FROM items WHERE id = ?', [req.params.id]);

  res.json({ message: 'Item updated', item: updated[0] });
};

const deleteItem = async (req, res) => {
  const [existing] = await db.query(
    'SELECT * FROM items WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );

  if (existing.length === 0) {
    return res.status(404).json({ message: 'Item not found' });
  }

  await db.query('DELETE FROM items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

  res.json({ message: 'Item deleted' });
};

const getStats = async (req, res) => {
  const [total] = await db.query(
    'SELECT COUNT(*) as count FROM items WHERE user_id = ?',
    [req.user.id]
  );
  const [active] = await db.query(
    'SELECT COUNT(*) as count FROM items WHERE user_id = ? AND status = ?',
    [req.user.id, 'active']
  );
  const [pending] = await db.query(
    'SELECT COUNT(*) as count FROM items WHERE user_id = ? AND status = ?',
    [req.user.id, 'pending']
  );
  const [completed] = await db.query(
    'SELECT COUNT(*) as count FROM items WHERE user_id = ? AND status = ?',
    [req.user.id, 'completed']
  );

  res.json({
    total: total[0].count,
    active: active[0].count,
    pending: pending[0].count,
    completed: completed[0].count
  });
};

module.exports = { getItems, getItem, createItem, updateItem, deleteItem, getStats };
