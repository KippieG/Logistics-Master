-- YardEx v2: contactgegevens die onthuld worden na een bevestigde deal

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS company_real_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS vat_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Deals: notities voor operationele coördinatie
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS provider_notes TEXT,
  ADD COLUMN IF NOT EXISTS requester_notes TEXT;
