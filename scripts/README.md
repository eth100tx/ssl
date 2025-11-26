# SSL Inc. Database Scripts

Scripts for initializing and managing the SSL Inc. database.

## Quick Start (Fresh Setup)

1. **Create a MySQL database** (Railway, local MySQL, etc.)

2. **Set your DATABASE_URL environment variable:**
   ```bash
   export DATABASE_URL="mysql://user:password@host:port/database"
   ```

3. **Run the schema to create tables:**
   ```bash
   # Option A: Import SQL directly (if you have mysql client)
   mysql -h host -P port -u user -p database < scripts/schema.sql

   # Option B: Use a Node.js script
   node scripts/setup-db.js
   ```

4. **Seed with sample data:**
   ```bash
   node scripts/seed.js
   ```

## Files

| File | Description |
|------|-------------|
| `schema.sql` | Complete database schema - creates all tables from scratch |
| `seed.js` | Seeds database with sample customers, employees, equipment, and 2025 orders |
| `setup-db.js` | Node.js script to run schema.sql (alternative to mysql CLI) |

## Database Schema

### Tables

- **customers** - Client information (venues, companies, individuals)
- **employees** - Staff and contract workers with skills, rates, beeper numbers
- **equipment** - Inventory with serial numbers, rental rates, categories
- **orders** - Proposals, orders, and invoices
- **order_items** - Line items (sales, rentals, operator time)
- **order_workers** - Worker assignments to orders
- **reservations** - Equipment reservations
- **employee_schedules** - Work schedules and time tracking

### Entity Relationships

```
customers ─┬─< orders ─┬─< order_items ──< equipment
           │           └─< order_workers ──< employees
           │
employees ─┴─< employee_schedules
           └─< order_workers

equipment ─< reservations
```

## Sample Data Overview

The seed script creates:

- **10 customers** - Convention centers, churches, schools, venues
- **13 employees** - 4 core staff + 9 contract workers
- **29 equipment items** - Audio, video, lighting, and rigging gear
- **17 orders** - Mix of completed 2025 events, upcoming bookings, and proposals

### 2025 Order Timeline

| Status | Count | Description |
|--------|-------|-------------|
| Completed | 8 | Past events (Jan-Nov 2025) |
| Accepted | 6 | Confirmed upcoming (Nov-Dec 2025) |
| Proposals | 3 | Pending quotes (2026) |

## Resetting the Database

To completely reset and reseed:

```bash
# This will DROP all tables and recreate them
node scripts/setup-db.js

# Then reseed
node scripts/seed.js
```

⚠️ **Warning:** This deletes ALL existing data!
