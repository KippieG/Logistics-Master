const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { signToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, alias, zone } = req.body;
  if (!email || !password || !alias) {
    return res.status(400).json({ error: 'Email, wachtwoord en alias zijn verplicht' });
  }
  try {
    const existing = await db.query(
      'SELECT id FROM companies WHERE email = $1 OR alias = $2',
      [email.toLowerCase(), alias]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email of alias al in gebruik' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO companies (id, alias, email, password_hash, zone, verified)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id, alias, zone`,
      [uuidv4(), alias, email.toLowerCase(), hash, zone || null]
    );
    const company = result.rows[0];
    res.status(201).json({ token: signToken(company), company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registratie mislukt' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email en wachtwoord verplicht' });
  }
  try {
    const result = await db.query(
      'SELECT id, alias, zone, password_hash FROM companies WHERE email = $1',
      [email.toLowerCase()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Ongeldig email of wachtwoord' });
    }
    const company = result.rows[0];
    const valid = await bcrypt.compare(password, company.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Ongeldig email of wachtwoord' });
    }
    res.json({ token: signToken(company), company: { id: company.id, alias: company.alias, zone: company.zone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Inloggen mislukt' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ company: req.company });
});

module.exports = router;
