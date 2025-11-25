# SSL Inc. - Showtime Sound & Lighting

A business management system for Showtime Sound & Lighting Inc., built with Next.js 14 and MySQL.

## Overview

SSL Inc. is a complete business management solution for a sound and lighting rental/sales company. It handles customer management, equipment inventory, orders/proposals/invoices, and equipment reservations with a calendar view.

## Features

- **Dashboard** - Overview of business metrics, recent orders, and equipment status
- **Customer Management** - Full CRUD with search functionality
- **Equipment Inventory** - Track audio, video, lighting, and other equipment
- **Orders/Proposals/Invoices** - Complete order workflow with line items
- **Equipment Calendar** - Visual reservation tracking and availability

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MySQL (Railway hosted)
- **Styling**: Tailwind CSS with custom dark theme
- **Deployment**: Railway (auto-deploy from GitHub)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Access to Railway database (or local MySQL)

### Installation

```bash
# Clone the repository
git clone git@github.com:eth100tx/ssl.git
cd ssl

# Install dependencies
npm install

# Set up environment variables
export DATABASE_URL="<your-database-url>"

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Database Setup

```bash
# Run migrations
node scripts/migrate.js

# Seed mock data (optional)
node scripts/seed-data.js
```

## Project Structure

```
ssl/
├── app/
│   ├── api/                    # API routes
│   │   ├── customers/          # Customer CRUD
│   │   ├── equipment/          # Equipment CRUD
│   │   ├── orders/             # Orders with line items
│   │   └── reservations/       # Reservation CRUD
│   ├── customers/              # Customer management page
│   ├── equipment/              # Equipment inventory page
│   ├── orders/                 # Orders list and detail pages
│   ├── calendar/               # Reservation calendar
│   ├── globals.css             # Theme and styling
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Dashboard
├── components/
│   ├── Layout.tsx              # Main layout with navigation
│   └── Modal.tsx               # Reusable modal component
├── lib/
│   ├── db.ts                   # Database connection
│   └── types.ts                # TypeScript types
├── scripts/
│   ├── ssl-schema.sql          # Database schema
│   ├── migrate.js              # Migration runner
│   └── seed-data.js            # Mock data seeder
├── docs/
│   ├── showtime_case.pdf       # Original case study
│   └── SYSTEM.md               # System architecture guide
└── status.md                   # Project status
```

## Deployment

The app auto-deploys to Railway when pushing to the `main` branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Production URL: https://ssl-production.up.railway.app

## Design System

The app uses a custom dark industrial theme inspired by stage lighting:

- **Background**: Near-black (#0a0a0b)
- **Accent**: Electric amber (#f5a623)
- **Secondary**: Cool cyan (#00d4ff)
- **Typography**: Bebas Neue (headlines), DM Sans (body)

See `docs/SYSTEM.md` for detailed architecture documentation.

## License

Private project for SSL Inc.
