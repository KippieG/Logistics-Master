# Database Schema — Port of Zeebrugge

## container_movements
| Column | Type | Description |
|--------|------|-------------|
| container_id | VARCHAR(15) | Unique ID (CNTR-XXXXXXX) |
| arrival_date | DATE | Arrival at terminal |
| departure_date | DATE | Departure from terminal |
| shipper | VARCHAR(100) | Cargo owner |
| shipping_agent | VARCHAR(100) | Freight forwarder |
| container_type | VARCHAR(20) | 20ft/40ft/HC/Reefer |
| cargo_type | VARCHAR(50) | Commodity |
| delay_reason | VARCHAR(100) | Root cause if dwell > 5d |
| doc_processing_hrs | DECIMAL(4,1) | Hours B/L to pre-clearance |
| demurrage_cost_eur | DECIMAL(10,2) | Cost for days > 5d threshold |

## shipping_agents
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| agent_name | VARCHAR(100) | Agent company name |
| edi_capable | BOOLEAN | EDI integration available |

## container_delays
| Column | Type | Description |
|--------|------|-------------|
| container_id | VARCHAR(15) | FK to container_movements |
| dwell_days | INTEGER | Total days on terminal |
| delay_reason | VARCHAR(100) | Primary delay category |
| doc_processing_hours | DECIMAL(4,1) | Documentation processing time |
