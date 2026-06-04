const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM notifications WHERE company_id=$1 ORDER BY created_at DESC LIMIT 50`,
      [req.company.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Fout' });
  }
});

router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT COUNT(*) FROM notifications WHERE company_id=$1 AND read=false',
      [req.company.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Fout' });
  }
});

router.post('/mark-read', requireAuth, async (req, res) => {
  const { ids } = req.body;
  try {
    if (ids && ids.length > 0) {
      await db.query(
        'UPDATE notifications SET read=true WHERE company_id=$1 AND id=ANY($2)',
        [req.company.id, ids]
      );
    } else {
      await db.query('UPDATE notifications SET read=true WHERE company_id=$1', [req.company.id]);
    }
    res.json({ message: 'Gelezen' });
  } catch (err) {
    res.status(500).json({ error: 'Fout' });
  }
});

module.exports = router;
