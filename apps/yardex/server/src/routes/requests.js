const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Submit a request on a listing
router.post('/', requireAuth, async (req, res) => {
  const { listing_id, quantity_needed, requested_from, requested_until, offered_price, message } = req.body;
  if (!listing_id || !quantity_needed || !requested_from || !requested_until) {
    return res.status(400).json({ error: 'Verplichte velden ontbreken' });
  }
  try {
    const listing = await db.query(
      'SELECT company_id, status, capacity FROM listings WHERE id=$1',
      [listing_id]
    );
    if (listing.rows.length === 0) return res.status(404).json({ error: 'Listing niet gevonden' });
    if (listing.rows[0].status !== 'active') return res.status(409).json({ error: 'Listing niet meer beschikbaar' });
    if (listing.rows[0].company_id === req.company.id) {
      return res.status(400).json({ error: 'Je kan je eigen listing niet aanvragen' });
    }

    const result = await db.query(
      `INSERT INTO requests (id, listing_id, requesting_company_id, quantity_needed, requested_from, requested_until, offered_price, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [uuidv4(), listing_id, req.company.id, quantity_needed, requested_from, requested_until, offered_price || null, message || null]
    );

    // Notify the listing owner (anonymously)
    await db.query(
      `INSERT INTO notifications (id, company_id, type, title, body, related_listing_id, related_request_id)
       VALUES (uuid_generate_v4(), $1, 'new_request', 'Nieuwe aanvraag ontvangen',
         $2, $3, $4)`,
      [
        listing.rows[0].company_id,
        `Een terminal vraagt ${quantity_needed} eenheden aan voor jouw listing.`,
        listing_id,
        result.rows[0].id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Aanvraag indienen mislukt' });
  }
});

// Get requests on own listings
router.get('/received', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, l.type, l.zone, l.unit, c.alias AS requester_alias
       FROM requests r
       JOIN listings l ON l.id = r.listing_id
       JOIN companies c ON c.id = r.requesting_company_id
       WHERE l.company_id = $1
       ORDER BY r.created_at DESC`,
      [req.company.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Fout' });
  }
});

// Get own sent requests
router.get('/sent', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, l.type, l.zone, l.unit, c.alias AS provider_alias
       FROM requests r
       JOIN listings l ON l.id = r.listing_id
       JOIN companies c ON c.id = l.company_id
       WHERE r.requesting_company_id = $1
       ORDER BY r.created_at DESC`,
      [req.company.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Fout' });
  }
});

// Accept a request → creates a deal
router.post('/:id/accept', requireAuth, async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const reqResult = await client.query(
      `SELECT r.*, l.company_id AS provider_id, l.available_from, l.available_until
       FROM requests r JOIN listings l ON l.id = r.listing_id
       WHERE r.id=$1 AND l.company_id=$2 AND r.status='pending'`,
      [req.params.id, req.company.id]
    );
    if (reqResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Aanvraag niet gevonden' });
    }
    const request = reqResult.rows[0];

    const agreedPrice = req.body.final_price || request.offered_price;

    // Create deal
    const deal = await client.query(
      `INSERT INTO deals (id, listing_id, request_id, provider_company_id, requester_company_id,
         agreed_quantity, agreed_price, period_from, period_until)
       VALUES (uuid_generate_v4(),$1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        request.listing_id, request.id, req.company.id, request.requesting_company_id,
        request.quantity_needed, agreedPrice,
        request.requested_from, request.requested_until
      ]
    );

    // Update statuses
    await client.query("UPDATE requests SET status='accepted' WHERE id=$1", [request.id]);
    await client.query("UPDATE requests SET status='rejected' WHERE listing_id=$1 AND id!=$2 AND status='pending'", [request.listing_id, request.id]);
    await client.query("UPDATE listings SET status='reserved', updated_at=NOW() WHERE id=$1", [request.listing_id]);

    // Notify requester
    await client.query(
      `INSERT INTO notifications (id, company_id, type, title, body, related_listing_id, related_request_id)
       VALUES (uuid_generate_v4(),$1,'request_accepted','Aanvraag goedgekeurd!',
         $2,$3,$4)`,
      [
        request.requesting_company_id,
        `Jouw aanvraag werd geaccepteerd. Prijs: €${agreedPrice} per eenheid.`,
        request.listing_id, request.id
      ]
    );

    await client.query('COMMIT');
    res.json(deal.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Acceptatie mislukt' });
  } finally {
    client.release();
  }
});

// Reject a request
router.post('/:id/reject', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE requests SET status='rejected'
       WHERE id=$1 AND status='pending'
       AND listing_id IN (SELECT id FROM listings WHERE company_id=$2)
       RETURNING id, requesting_company_id, listing_id`,
      [req.params.id, req.company.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aanvraag niet gevonden' });

    await db.query(
      `INSERT INTO notifications (id, company_id, type, title, body, related_listing_id)
       VALUES (uuid_generate_v4(),$1,'request_rejected','Aanvraag afgewezen',
         'Jouw aanvraag werd helaas afgewezen.',$2)`,
      [result.rows[0].requesting_company_id, result.rows[0].listing_id]
    );

    res.json({ message: 'Aanvraag afgewezen' });
  } catch (err) {
    res.status(500).json({ error: 'Fout' });
  }
});

module.exports = router;
