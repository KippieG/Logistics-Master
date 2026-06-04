-- Yard & Slot Sharer - Zeebrugge MVP
-- Anonymous capacity marketplace for port terminals

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE listing_type AS ENUM ('yard', 'slot_truck', 'slot_vessel');
CREATE TYPE listing_status AS ENUM ('active', 'reserved', 'completed', 'cancelled');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');
CREATE TYPE deal_status AS ENUM ('confirmed', 'in_progress', 'completed', 'disputed');

-- Terminals: real identity kept hidden from other users
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alias VARCHAR(50) NOT NULL UNIQUE,        -- "Terminal Alfa", "Terminal Beta", ...
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    zone VARCHAR(100),                         -- e.g. "Albert II-dok", "Wielingendok"
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Capacity listings posted anonymously
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id),
    type listing_type NOT NULL,
    capacity NUMERIC(10,2) NOT NULL,           -- m² for yard, count for slots
    unit VARCHAR(20) NOT NULL,                 -- 'm²', 'TEU', 'slots', 'days'
    zone VARCHAR(100) NOT NULL,                -- broad zone, no exact address
    available_from TIMESTAMPTZ NOT NULL,
    available_until TIMESTAMPTZ NOT NULL,
    price_per_unit NUMERIC(10,2),              -- NULL = open to negotiation
    currency VARCHAR(3) DEFAULT 'EUR',
    description TEXT,
    status listing_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking requests from anonymous buyers
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id),
    requesting_company_id UUID NOT NULL REFERENCES companies(id),
    quantity_needed NUMERIC(10,2) NOT NULL,
    requested_from TIMESTAMPTZ NOT NULL,
    requested_until TIMESTAMPTZ NOT NULL,
    offered_price NUMERIC(10,2),
    message TEXT,
    status request_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Confirmed deals - identity revealed internally for operations
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id),
    request_id UUID NOT NULL REFERENCES requests(id),
    provider_company_id UUID NOT NULL REFERENCES companies(id),
    requester_company_id UUID NOT NULL REFERENCES companies(id),
    agreed_quantity NUMERIC(10,2) NOT NULL,
    agreed_price NUMERIC(10,2) NOT NULL,
    period_from TIMESTAMPTZ NOT NULL,
    period_until TIMESTAMPTZ NOT NULL,
    status deal_status DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- In-app notifications (no email for MVP)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    read BOOLEAN DEFAULT false,
    related_listing_id UUID REFERENCES listings(id),
    related_request_id UUID REFERENCES requests(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_available_from ON listings(available_from);
CREATE INDEX idx_requests_listing ON requests(listing_id);
CREATE INDEX idx_requests_company ON requests(requesting_company_id);
CREATE INDEX idx_notifications_company ON notifications(company_id, read);

-- Seed anonymous aliases (10 Zeebrugge terminals)
INSERT INTO companies (alias, email, password_hash, zone, verified) VALUES
('Terminal Alfa', 'demo-alfa@yss.local', '$2a$10$placeholder', 'Albert II-dok Noord', true),
('Terminal Beta', 'demo-beta@yss.local', '$2a$10$placeholder', 'Albert II-dok Zuid', true),
('Terminal Gamma', 'demo-gamma@yss.local', '$2a$10$placeholder', 'Wielingendok', true),
('Terminal Delta', 'demo-delta@yss.local', '$2a$10$placeholder', 'Zuidelijk Insteekdok', true),
('Terminal Epsilon', 'demo-epsilon@yss.local', '$2a$10$placeholder', 'LNG-terminal', true);
