# Project Status - SSL Inc. (Showtime Sound & Lighting)

## Current State: MVP Complete

### Infrastructure Status

| Component | Status | Details |
|-----------|--------|---------|
| Railway Project | Active | `ssl` |
| MySQL Database | Running | Railway hosted |
| Next.js App (Railway) | Deployed | https://ssl-production.up.railway.app |
| GitHub Repo | Connected | git@github.com:eth100tx/ssl.git |
| Local Dev Server | Working | http://localhost:3000 |

### Database

- **Host**: Railway MySQL (see Railway dashboard for credentials)
- **Database**: `railway`
- **Tables**: customers, equipment, orders, order_items, reservations

### Services in Railway

1. **ssl** - Next.js web app (deployed from GitHub)
2. **MySQL** - Database service

### Local Development

To run locally with remote database:

```bash
# Get DATABASE_URL from Railway dashboard or environment variables
export DATABASE_URL="<your-database-url>"
npm run dev
```

App runs at http://localhost:3000

### Deployment

- Auto-deploys on push to `main` branch on GitHub
- Railway watches the connected GitHub repo

---

## MVP Features Implemented

### Customer Management
- CRUD operations for customers
- Search functionality
- Contact information tracking

### Equipment Inventory
- Track equipment with serial numbers
- Categories: Audio, Video, Lighting, Other
- Status tracking: Available, Reserved, Out, Maintenance
- Sale price and rental rate management

### Orders / Proposals / Invoices
- Create proposals, orders, and invoices
- Line items for sales, rentals, and operator support
- Status workflow: Draft → Sent → Accepted → Completed
- Event location tracking
- Automatic total calculations

### Equipment Reservations
- Calendar view for all reservations
- Equipment availability tracking
- Status management: Reserved, Out, Returned, Cancelled

### Dashboard
- Overview statistics
- Recent orders
- Equipment status summary
- Upcoming reservations

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Database**: MySQL (Railway)
- **Deployment**: Railway (auto-deploy from GitHub)

---

## Quick Commands

```bash
# Start local dev server
npm run dev

# Build for production
npm run build

# Run database migrations
node scripts/migrate.js

# Seed mock data
node scripts/seed-data.js

# Check Railway status
railway status

# View logs
railway logs --service ssl
```

---

## Files Reference

### Core Application
- `app/page.tsx` - Dashboard
- `app/customers/page.tsx` - Customer management
- `app/equipment/page.tsx` - Equipment inventory
- `app/orders/page.tsx` - Orders list
- `app/orders/[id]/page.tsx` - Order detail/edit
- `app/calendar/page.tsx` - Reservation calendar

### API Routes
- `app/api/customers/` - Customer CRUD
- `app/api/equipment/` - Equipment CRUD
- `app/api/orders/` - Orders CRUD with line items
- `app/api/reservations/` - Reservation CRUD

### Components
- `components/Layout.tsx` - Main layout with navigation
- `components/Modal.tsx` - Reusable modal component

### Database
- `lib/db.ts` - Database connection utility
- `lib/types.ts` - TypeScript type definitions
- `scripts/ssl-schema.sql` - Database schema
- `scripts/migrate.js` - Migration runner
- `scripts/seed-data.js` - Mock data seeder

### Documentation
- `project.prd` - Product requirements document
- `docs/showtime_case.pdf` - Original case study
