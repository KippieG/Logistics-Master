const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT d.*,
        l.type, l.zone, l.unit,
        p.alias AS provider_alias,
        r.alias AS requester_alias,
        (d.provider_company_id = $1) AS is_provider
       FROM deals d
       JOIN listings l ON l.id = d.listing_id
       JOIN companies p ON p.id = d.provider_company_id
       JOIN companies r ON r.id = d.requester_company_id
       WHERE d.provider_company_id=$1 OR d.requester_company_id=$1
       ORDER BY d.created_at DESC`,
      [req.company.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Fout' });
  }
});

router.patch('/:id/complete', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE deals SET status='completed'
       WHERE id=$1 AND (provider_company_id=$2 OR requester_company_id=$2) AND status='in_progress'
       RETURNING id`,
      [req.params.id, req.company.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Deal niet gevonden' });

    await db.query(
      "UPDATE listings SET status='completed', updated_at=NOW() WHERE id=(SELECT listing_id FROM deals WHERE id=$1)",
      [req.params.id]
    );

    res.json({ message: 'Deal afgerond' });
  } catch (err) {
    res.status(500).json({ error: 'Fout' });
  }
});

module.exports = router;
