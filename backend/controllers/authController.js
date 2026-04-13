const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../config/db');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const [result] = await db.query(
    'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
    [name, email, phone || null, hashedPassword]
  );

  const token = generateToken(result.insertId);

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: { id: result.insertId, name, email, phone }
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user.id);

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide your email' });
  }

  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) {
    return res.status(400).json({ message: 'No account with that email found' });
  }

  const token = crypto.randomBytes(20).toString('hex');
  const expiry = new Date(Date.now() + 3600000);

  await db.query(
    'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
    [token, expiry, email]
  );

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  const resetUrl = `http://localhost:5173/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`
  });

  res.json({ message: 'Password reset email sent' });
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }

  const [rows] = await db.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
    [token]
  );

  if (rows.length === 0) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await db.query(
    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
    [hashedPassword, rows[0].id]
  );

  res.json({ message: 'Password reset successful' });
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, forgotPassword, resetPassword, getMe };
