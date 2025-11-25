# SSL Inc. System Architecture Guide

This document provides a comprehensive overview of the SSL Inc. system for AI assistants and developers working on future enhancements.

## Business Context

SSL Inc. (Showtime Sound & Lighting) is a sound and lighting rental/sales company. The system manages:
- Customer relationships
- Equipment inventory (audio, video, lighting gear)
- Orders (proposals → orders → invoices)
- Equipment reservations for events

See `docs/showtime_case.pdf` for the original business case study.

---

## Database Schema

### Tables Overview

```
customers ──────────────────────────────────────
│ id (PK)                                      │
│ name, company, contact_name                  │
│ phone, fax, address, city, state, zip        │
│ notes, created_at, updated_at                │
└──────────────────────────────────────────────┘
         │
         │ customer_id (FK)
         ▼
orders ─────────────────────────────────────────
│ id (PK), order_number (unique)               │
│ customer_id (FK → customers)                 │
│ type: 'proposal' | 'order' | 'invoice'       │
│ status: 'draft'|'sent'|'accepted'|'completed'│
│ event_date, event_address, event_city...     │
│ payment_method, payment_terms, comments      │
│ sales_total, rental_total, operator_total    │
│ total_cost, created_at, updated_at           │
└──────────────────────────────────────────────┘
         │
         │ order_id (FK)
         ▼
order_items ────────────────────────────────────
│ id (PK), order_id (FK → orders)              │
│ equipment_id (FK → equipment, nullable)      │
│ item_type: 'sale' | 'rental' | 'operator'    │
│ description, quantity, unit_price            │
│ rental_start, rental_end, hours              │
│ total, created_at                            │
└──────────────────────────────────────────────┘

equipment ──────────────────────────────────────
│ id (PK), serial_number (unique)              │
│ name, category: 'audio'|'video'|'lighting'   │
│ sale_price, rental_rate                      │
│ description, specifications                   │
│ status: 'available'|'reserved'|'out'|'maint' │
│ maintenance_due_date, created_at, updated_at │
└──────────────────────────────────────────────┘
         │
         │ equipment_id (FK)
         ▼
reservations ───────────────────────────────────
│ id (PK), equipment_id (FK → equipment)       │
│ order_id (FK → orders, nullable)             │
│ customer_name, event_date                    │
│ time_out, time_due_in                        │
│ status: 'reserved'|'out'|'returned'|'cancel' │
│ condition_notes, created_at, updated_at      │
└──────────────────────────────────────────────┘
```

### Key Relationships

1. **Customer → Orders**: One customer can have many orders
2. **Order → Order Items**: One order has many line items
3. **Equipment → Order Items**: Equipment can appear in multiple order items
4. **Equipment → Reservations**: One equipment can have many reservations (different dates)

---

## API Routes

### Customers (`/api/customers`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all, optional `?search=` |
| GET | `/api/customers/[id]` | Get single customer |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/[id]` | Update customer |
| DELETE | `/api/customers/[id]` | Delete customer |

### Equipment (`/api/equipment`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/equipment` | List all, optional `?category=&status=&search=` |
| GET | `/api/equipment/[id]` | Get single item |
| POST | `/api/equipment` | Create equipment |
| PUT | `/api/equipment/[id]` | Update equipment |
| DELETE | `/api/equipment/[id]` | Delete equipment |

### Orders (`/api/orders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all, optional `?type=&status=` |
| GET | `/api/orders/[id]` | Get order with items and customer info |
| POST | `/api/orders` | Create order (generates order_number) |
| PUT | `/api/orders/[id]` | Update order |
| DELETE | `/api/orders/[id]` | Delete order and items |

### Order Items (`/api/orders/[id]/items`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/[id]/items` | Add line item, recalculates totals |
| DELETE | `/api/orders/[id]/items/[itemId]` | Remove item, recalculates totals |

### Reservations (`/api/reservations`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reservations` | List by date range `?start=&end=` |
| GET | `/api/reservations/[id]` | Get single reservation |
| POST | `/api/reservations` | Create reservation |
| PUT | `/api/reservations/[id]` | Update reservation |
| DELETE | `/api/reservations/[id]` | Delete reservation |

---

## Frontend Pages

### Dashboard (`/`)
- Stats cards: Total customers, equipment, orders, reservations
- Recent orders list
- Equipment by status
- Upcoming reservations

### Customers (`/customers`)
- Searchable table
- Add/Edit modal
- Delete with confirmation

### Equipment (`/equipment`)
- Category filter cards (clickable)
- Status filter dropdown
- Search by name/serial
- Add/Edit modal with all fields

### Orders (`/orders`)
- Type cards showing counts and totals
- Status filter
- Links to detail page

### Order Detail (`/orders/[id]`)
- Order info form (customer, type, status, dates)
- Event location section
- Line items table with add/remove
- Summary sidebar with totals
- Customer info sidebar

### Calendar (`/calendar`)
- Month navigation
- Day grid with reservation chips
- Color-coded by status
- Click day to add reservation
- Click reservation to edit

---

## Design System

### CSS Variables (globals.css)

```css
/* Backgrounds */
--color-bg-primary: #0a0a0b;     /* Main background */
--color-bg-secondary: #111113;   /* Card backgrounds */
--color-bg-tertiary: #1a1a1d;    /* Hover states */
--color-bg-card: #141416;        /* Card surfaces */

/* Accents */
--color-accent: #f5a623;         /* Primary amber */
--color-accent-bright: #ffc95c;  /* Hover state */
--color-accent-dim: #b37a17;     /* Subdued */
--color-secondary: #00d4ff;      /* Cyan accent */

/* Status Colors */
--color-success: #10b981;        /* Green */
--color-warning: #f59e0b;        /* Orange */
--color-danger: #ef4444;         /* Red */
--color-info: #3b82f6;           /* Blue */

/* Text */
--color-text-primary: #fafafa;   /* Main text */
--color-text-secondary: #a1a1aa; /* Subdued text */
--color-text-muted: #52525b;     /* Disabled/hints */

/* Borders */
--color-border: #27272a;         /* Default */
--color-border-light: #3f3f46;   /* Emphasized */
```

### Component Classes

```css
/* Cards */
.card          /* Base card styling */
.card-glow     /* Hover glow effect */

/* Buttons */
.btn           /* Base button */
.btn-primary   /* Amber gradient */
.btn-secondary /* Dark with border */
.btn-ghost     /* Transparent */
.btn-danger    /* Red outline */

/* Forms */
.input         /* Text inputs, textareas */
.select        /* Dropdowns (add to .input) */

/* Status Badges */
.badge         /* Base badge */
.badge-success /* Green */
.badge-warning /* Orange */
.badge-danger  /* Red */
.badge-info    /* Blue */
.badge-neutral /* Gray */
.badge-accent  /* Amber */

/* Tables */
.table         /* Styled table */

/* Animations */
.animate-fade-in    /* Opacity fade */
.animate-slide-up   /* Slide from bottom */
.animate-scale-in   /* Scale entrance */
.skeleton           /* Loading shimmer */
.stagger-1 to .stagger-6  /* Animation delays */
```

### Typography

- **Headlines**: Bebas Neue (uppercase, tracking)
- **Body**: DM Sans (clean sans-serif)

Headlines automatically apply to h1, h2, h3 and `.headline` class.

---

## TypeScript Types (lib/types.ts)

```typescript
// Enums
type EquipmentCategory = 'audio' | 'video' | 'lighting' | 'other';
type EquipmentStatus = 'available' | 'reserved' | 'out' | 'maintenance';
type OrderType = 'proposal' | 'order' | 'invoice';
type OrderStatus = 'draft' | 'sent' | 'accepted' | 'completed' | 'cancelled';
type OrderItemType = 'sale' | 'rental' | 'operator';
type ReservationStatus = 'reserved' | 'out' | 'returned' | 'cancelled';

// Main interfaces
interface Customer { id, name, company?, contact_name?, phone?, ... }
interface Equipment { id, serial_number?, name, category, status, ... }
interface Order { id, order_number, customer_id, type, status, ... }
interface OrderItem { id, order_id, equipment_id?, item_type, ... }
interface Reservation { id, equipment_id, order_id?, status, ... }
```

---

## Common Patterns

### API Route Pattern

```typescript
// app/api/[resource]/route.ts
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const [rows] = await pool.query('SELECT * FROM table');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### Page Component Pattern

```typescript
// app/[page]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';

export default function PageName() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/endpoint');
    setData(await res.json());
    setLoading(false);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header with title and add button */}
        {/* Filters/search */}
        {/* Data table or cards */}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="...">
        {/* Form content */}
      </Modal>
    </Layout>
  );
}
```

### Database Number Handling

MySQL DECIMAL fields come as strings. Always convert:

```typescript
// Correct
const total = Number(order.total_cost) || 0;

// Incorrect (may cause NaN)
const total = order.total_cost || 0;
```

---

## Development Notes

### Running Locally

```bash
export DATABASE_URL="mysql://..."
npm run dev
```

### Database Connection

The `lib/db.ts` uses mysql2 connection pooling:

```typescript
import mysql from 'mysql2/promise';
export const pool = mysql.createPool(process.env.DATABASE_URL!);
```

### Order Number Generation

Orders auto-generate numbers like `ORD-2024-00001`:

```typescript
const year = new Date().getFullYear();
// Query for max number this year, increment
```

### Order Total Calculation

When adding/removing line items, totals are recalculated:

```sql
UPDATE orders SET
  sales_total = (SELECT SUM(total) FROM order_items WHERE item_type='sale'),
  rental_total = (SELECT SUM(total) FROM order_items WHERE item_type='rental'),
  operator_total = (SELECT SUM(total) FROM order_items WHERE item_type='operator'),
  total_cost = sales_total + rental_total + operator_total
WHERE id = ?
```

---

## Future Enhancement Ideas

1. **Authentication** - Add user login/roles
2. **PDF Export** - Generate invoices/proposals as PDF
3. **Email Integration** - Send proposals to customers
4. **Inventory Tracking** - Quantity per equipment type
5. **Reporting** - Revenue reports, equipment utilization
6. **Mobile App** - React Native companion
7. **Barcode Scanning** - Equipment check-in/out
8. **Customer Portal** - Self-service booking

---

## File Quick Reference

| Need to... | Look in... |
|------------|------------|
| Change theme colors | `app/globals.css` |
| Add navigation item | `components/Layout.tsx` |
| Modify database schema | `scripts/ssl-schema.sql` |
| Add TypeScript type | `lib/types.ts` |
| Create API endpoint | `app/api/[resource]/route.ts` |
| Add new page | `app/[pagename]/page.tsx` |
