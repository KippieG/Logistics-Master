-- YardEx demo seed — development & testing only
-- Password for ALL demo accounts: Zeebrugge2026!
-- Hash: bcrypt cost 10

BEGIN;

INSERT INTO companies (id, alias, email, password_hash, zone, verified) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Terminal Alfa',    'alfa@demo.yardex.port',    '$2a$10$fJT4fwG7R71eCWLocLT3QOOqKONsAEyWNbM.IKToy6B06EqL2VU3G', 'Albert II-dok Noord',  true),
  ('11111111-0000-0000-0000-000000000002', 'Terminal Beta',    'beta@demo.yardex.port',    '$2a$10$fJT4fwG7R71eCWLocLT3QOOqKONsAEyWNbM.IKToy6B06EqL2VU3G', 'Albert II-dok Zuid',   true),
  ('11111111-0000-0000-0000-000000000003', 'Terminal Gamma',   'gamma@demo.yardex.port',   '$2a$10$fJT4fwG7R71eCWLocLT3QOOqKONsAEyWNbM.IKToy6B06EqL2VU3G', 'Wielingendok',         true),
  ('11111111-0000-0000-0000-000000000004', 'Terminal Delta',   'delta@demo.yardex.port',   '$2a$10$fJT4fwG7R71eCWLocLT3QOOqKONsAEyWNbM.IKToy6B06EqL2VU3G', 'Zuidelijk Insteekdok', true),
  ('11111111-0000-0000-0000-000000000005', 'Terminal Epsilon', 'epsilon@demo.yardex.port', '$2a$10$fJT4fwG7R71eCWLocLT3QOOqKONsAEyWNbM.IKToy6B06EqL2VU3G', 'Brittaniadok',         true)
ON CONFLICT (email) DO NOTHING;

-- Demo listings posted by Terminal Alfa
INSERT INTO listings (id, company_id, type, capacity, unit, zone, available_from, available_until, price_per_unit, description, status) VALUES
  (
    'aaaa0001-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000001',
    'yard', 3500, 'm²', 'Albert II-dok Noord',
    NOW() + INTERVAL '3 days', NOW() + INTERVAL '45 days',
    3.20,
    'Overdekte opslagruimte, 6 m hoogte, beveiligd terrein, 24/7 toegang met badge.',
    'active'
  ),
  (
    'aaaa0001-0000-0000-0000-000000000002',
    '11111111-0000-0000-0000-000000000001',
    'slot_truck', 60, 'slots', 'Albert II-dok Noord',
    NOW() + INTERVAL '1 day', NOW() + INTERVAL '14 days',
    55.00,
    'Koelwagen-aansluiting beschikbaar, capaciteit vrijgekomen door verschoven seizoenspiek.',
    'active'
  )
ON CONFLICT DO NOTHING;

-- Demo listing posted by Terminal Beta
INSERT INTO listings (id, company_id, type, capacity, unit, zone, available_from, available_until, price_per_unit, description, status) VALUES
  (
    'bbbb0002-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000002',
    'slot_vessel', 2, 'berths', 'Albert II-dok Zuid',
    NOW() + INTERVAL '7 days', NOW() + INTERVAL '10 days',
    NULL,
    'Overloop berths beschikbaar tijdens onderhoudsstop — open voor onderhandeling.',
    'active'
  )
ON CONFLICT DO NOTHING;

-- Demo listing posted by Terminal Gamma
INSERT INTO listings (id, company_id, type, capacity, unit, zone, available_from, available_until, price_per_unit, description, status) VALUES
  (
    'cccc0003-0000-0000-0000-000000000001',
    '11111111-0000-0000-0000-000000000003',
    'yard', 1200, 'm²', 'Wielingendok',
    NOW() + INTERVAL '5 days', NOW() + INTERVAL '30 days',
    4.50,
    'Buitenterrein, vrij van obstakels, geschikt voor container-opslag.',
    'active'
  )
ON CONFLICT DO NOTHING;

-- Notifications: inform Beta, Gamma, Delta, Epsilon about Alfa's listings
INSERT INTO notifications (id, company_id, type, title, body, related_listing_id)
SELECT
  uuid_generate_v4(),
  c.id,
  'new_listing',
  'Nieuwe terreinruimte beschikbaar — Albert II-dok Noord',
  '3500 m² beschikbaar vanaf ' || TO_CHAR(NOW() + INTERVAL '3 days', 'DD/MM/YYYY'),
  'aaaa0001-0000-0000-0000-000000000001'
FROM companies c
WHERE c.id NOT IN ('11111111-0000-0000-0000-000000000001')
  AND c.verified = true
ON CONFLICT DO NOTHING;

COMMIT;
