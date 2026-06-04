const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all active listings (anonymized - company_id is hidden, alias shown)
router.get('/', requireAuth, async (req, res) => {
  const { type, zone, from, until } = req.query;
  let query = `
    SELECT
      l.id,
      l.type,
      l.capacity,
      l.unit,
      l.zone,
      l.available_from,
      l.available_until,
      l.price_per_unit,
      l.currency,
      l.description,
      l.status,
      l.created_at,
      c.alias AS provider_alias,
      (l.company_id = $1) AS is_own
    FROM listings l
    JOIN companies c ON c.id = l.company_id
    WHERE l.status = 'active'
  `;
  const params = [req.company.id];
  let idx = 2;

  if (type) { query += ` AND l.type = $${idx++}`; params.push(type); }
  if (zone) { query += ` AND l.zone ILIKE $${idx++}`; params.push(`%${zone}%`); }
  if (from) { query += ` AND l.available_until >= $${idx++}`; params.push(from); }
  if (until) { query += ` AND l.available_from <= $${idx++}`; params.push(until); }

  query += ' ORDER BY l.created_at DESC';

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fout bij ophalen listings' });
  }
});

// Get single listing
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.*, c.alias AS provider_alias, (l.company_id = $2) AS is_own
       FROM listings l JOIN companies c ON c.id = l.company_id
       WHERE l.id = $1`,
      [req.params.id, req.company.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Niet gevonden' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Fout' });
  }
});

// Create a new listing
router.post('/', requireAuth, async (req, res) => {
  const { type, capacity, unit, zone, available_from, available_until, price_per_unit, description } = req.body;
  if (!type || !capacity || !unit || !zone || !available_from || !available_until) {
    return res.status(400).json({ error: 'Verplichte velden ontbreken' });
  }
  try {
    const result = await db.query(
      `INSERT INTO listings (id, company_id, type, capacity, unit, zone, available_from, available_until, price_per_unit, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [uuidv4(), req.company.id, type, capacity, unit, zone, available_from, available_until, price_per_unit || null, description || null]
    );

    // Notify matching companies (basic: notify all for MVP)
    await notifyPotentialBuyers(req.company.id, result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Listing aanmaken mislukt' });
  }
});

// Cancel own listing
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE listings SET status='cancelled', updated_at=NOW()
       WHERE id=$1 AND company_id=$2 AND status='active' RETURNING id`,
      [req.params.id, req.company.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Listing niet gevonden of al afgesloten' });
    res.json({ message: 'Listing geannuleerd' });
  } catch (err) {
    res.status(500).json({ error: 'Annuleren mislukt' });
  }
});

// Get own listings
router.get('/my/listings', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.*,
        (SELECT COUNT(*) FROM requests r WHERE r.listing_id = l.id AND r.status='pending') AS pending_requests
       FROM listings l WHERE l.company_id=$1 ORDER BY l.created_at DESC`,
      [req.company.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Fout' });
  }
});

async function notifyPotentialBuyers(providerCompanyId, listing) {
  try {
    const companies = await db.query(
      'SELECT id FROM companies WHERE id != $1 AND verified = true',
      [providerCompanyId]
    );
    const inserts = companies.rows.map(c => db.query(
      `INSERT INTO notifications (id, company_id, type, title, body, related_listing_id)
       VALUES (uuid_generate_v4(), $1, 'new_listing', $2, $3, $4)`,
      [
        c.id,
        `Nieuwe ${listing.type === 'yard' ? 'terrein' : 'slot'} beschikbaar — ${listing.zone}`,
        `${listing.capacity} ${listing.unit} beschikbaar vanaf ${new Date(listing.available_from).toLocaleDateString('nl-BE')}`,
        listing.id
      ]
    ));
    await Promise.all(inserts);
  } catch (err) {
    console.error('Notificatie fout:', err);
  }
}

module.exports = router;
