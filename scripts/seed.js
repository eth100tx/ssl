/**
 * SSL Inc. Database Seed Script
 *
 * Seeds the database with sample data for development/demo purposes.
 * Run this AFTER running schema.sql
 *
 * Usage:
 *   DATABASE_URL="mysql://user:pass@host:port/db" node scripts/seed.js
 *
 * Or set DATABASE_URL in your environment/.env file
 */

const mysql = require('mysql2/promise');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  console.error('Usage: DATABASE_URL="mysql://user:pass@host:port/db" node scripts/seed.js');
  process.exit(1);
}

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('🌱 Seeding SSL Inc. database...\n');

    // ============================================
    // CUSTOMERS
    // ============================================
    console.log('1. Adding customers...');
    const customers = [
      ['Springfield Convention Center', 'Springfield Convention Center', 'Jennifer Adams', '555-1000', '100 Convention Way', 'Springfield', 'IL', '62701', null, 'Large venue, regular client'],
      ['First Methodist Church', 'First Methodist Church', 'Pastor David Brown', '555-1001', '200 Church St', 'Springfield', 'IL', '62702', null, 'Weekly services, holiday events'],
      ['Lincoln High School', 'Lincoln High School', 'Principal Karen White', '555-1002', '300 Education Blvd', 'Springfield', 'IL', '62703', null, 'School events, graduations, sports'],
      ['Riverfront Amphitheater', 'Riverfront Amphitheater', 'Mike Torres', '555-1003', '400 River Rd', 'Springfield', 'IL', '62704', null, 'Outdoor concerts, festivals'],
      ['Capital City Corporate Events', 'Capital City Corporate', 'Susan Miller', '555-1004', '500 Business Park Dr', 'Springfield', 'IL', '62705', null, 'Corporate meetings, conferences'],
      ['Springfield Wedding Venue', 'The Grand Ballroom', 'Emily Chen', '555-1005', '600 Elegance Ave', 'Springfield', 'IL', '62706', null, 'Weddings, receptions, galas'],
      ['Rock Island Brewery', 'Rock Island Brewery', 'Jake Peterson', '555-1006', '700 Craft Beer Lane', 'Springfield', 'IL', '62707', null, 'Live music venue, brewery events'],
      ['Memorial Hospital Foundation', 'Memorial Hospital', 'Dr. Sarah Johnson', '555-1007', '800 Health Center Dr', 'Springfield', 'IL', '62708', null, 'Charity galas, fundraisers'],
      ['Downtown Theatre Company', 'Downtown Theatre', 'Robert Williams', '555-1008', '900 Main St', 'Springfield', 'IL', '62709', null, 'Theatre productions, concerts'],
      ['State Fair Events', 'Illinois State Fair', 'Linda Martinez', '555-1009', '1000 Fairgrounds Rd', 'Springfield', 'IL', '62710', null, 'Annual fair, large outdoor events'],
    ];

    for (const c of customers) {
      await connection.execute(
        `INSERT INTO customers (name, company, contact_name, phone, address, city, state, zip, fax, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        c
      );
    }
    console.log(`   ✓ Added ${customers.length} customers`);

    // ============================================
    // EMPLOYEES
    // ============================================
    console.log('\n2. Adding employees...');
    const employees = [
      // Core team
      ['Tom Smith', 'president', '555-0100', '555-PAGE-01', '1 Owner Lane', 'Springfield', 'IL', '62700', 'tom@sslinc.com', 'Business Operations, Event Coordination, Client Relations', 300.00, 'active', 'Owner of SSL Inc.'],
      ['Martha Jones', 'secretary', '555-0101', '555-PAGE-02', '2 Admin Way', 'Springfield', 'IL', '62700', 'martha@sslinc.com', 'Administration, Scheduling, Billing', 100.00, 'active', 'Secretary / Purchasing / Accounting'],
      ['Burt Reynolds', 'technician', '555-0102', '555-PAGE-03', '3 Tech Dr', 'Springfield', 'IL', '62700', 'burt@sslinc.com', 'Audio Engineering, Sound Mixing, System Design', 140.00, 'active', 'Lead Audio Technician'],
      ['Ernie Banks', 'technician', '555-0103', '555-PAGE-04', '4 AV Blvd', 'Springfield', 'IL', '62700', 'ernie@sslinc.com', 'Video Production, Projection, Live Streaming', 140.00, 'active', 'Video Specialist'],

      // Contract workers
      ['Mike Rodriguez', 'contract', '555-2001', '555-BEEP-01', '101 Tech Lane', 'Springfield', 'IL', '62701', 'mike.rodriguez@email.com', 'Audio Engineering, Live Sound, Stage Management', 200.00, 'active', 'Experienced live sound engineer, 10+ years'],
      ['Sarah Chen', 'contract', '555-2002', '555-BEEP-02', '202 Media Ave', 'Springfield', 'IL', '62702', 'sarah.chen@email.com', 'Video Production, Camera Operation, Live Streaming', 180.00, 'active', 'Video specialist, broadcast background'],
      ['James Wilson', 'contract', '555-2003', null, '303 Light St', 'Springfield', 'IL', '62703', 'james.wilson@email.com', 'Lighting Design, DMX Programming, Moving Heads', 220.00, 'active', 'Lighting designer, theatrical experience'],
      ['Maria Garcia', 'contract', '555-2004', '555-BEEP-04', '404 Sound Blvd', 'Springfield', 'IL', '62704', 'maria.garcia@email.com', 'Audio Engineering, Wireless Systems, RF Coordination', 200.00, 'active', 'RF specialist, large event experience'],
      ['Kevin Thompson', 'contract', '555-2005', null, '505 Stage Way', 'Springfield', 'IL', '62705', 'kevin.thompson@email.com', 'Rigging, Truss Assembly, Stage Setup', 160.00, 'active', 'Certified rigger, safety focused'],
      ['Lisa Park', 'contract', '555-2006', '555-BEEP-06', '606 AV Court', 'Springfield', 'IL', '62706', 'lisa.park@email.com', 'Video Engineering, Projection Mapping, LED Walls', 240.00, 'active', 'Large format video specialist'],
      ['David Brown', 'contract', '555-2007', null, '707 Event Drive', 'Springfield', 'IL', '62707', 'david.brown@email.com', 'General Tech, Equipment Transport, Setup/Strike', 120.00, 'active', 'Reliable stagehand, CDL licensed'],
      ['Amanda Foster', 'contract', '555-2008', '555-BEEP-08', '808 Production Pl', 'Springfield', 'IL', '62708', 'amanda.foster@email.com', 'Stage Management, Show Calling, Production Coordination', 200.00, 'active', 'Stage manager, corporate event specialist'],
      ['Ethan Hennenhoefer', 'contract', '555-9999', '555-EXEC-01', '1 Innovation Drive', 'Springfield', 'IL', '62700', 'ethan@consultant.com', 'Strategic Consulting, Systems Architecture, Technical Direction, Executive Advisory', 4000.00, 'active', 'Elite consultant, industry expert'],
    ];

    for (const e of employees) {
      await connection.execute(
        `INSERT INTO employees (name, role, phone, beeper, address, city, state, zip, email, skills, hourly_rate, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        e
      );
    }
    console.log(`   ✓ Added ${employees.length} employees`);

    // ============================================
    // EQUIPMENT
    // ============================================
    console.log('\n3. Adding equipment...');
    const equipment = [
      // Audio
      ['SSL-AUD-001', 'JBL VTX V25-II Line Array (per side)', 'audio', 15000.00, 500.00, 'Main PA system for large venues', '2x V25-II per side, flying hardware included', 'available', null],
      ['SSL-AUD-002', 'JBL VTX S28 Subwoofer', 'audio', 8000.00, 200.00, 'Dual 18" subwoofer', '2000W continuous, cardioid capable', 'available', null],
      ['SSL-AUD-003', 'Yamaha CL5 Digital Console', 'audio', 35000.00, 800.00, '72-channel digital mixer', 'Dante networking, iPad control', 'available', null],
      ['SSL-AUD-004', 'Shure ULXD4Q Wireless System', 'audio', 4500.00, 150.00, 'Quad wireless receiver', '4 channels, diversity antenna', 'available', null],
      ['SSL-AUD-005', 'Shure SM58 Microphone', 'audio', 100.00, 15.00, 'Dynamic vocal microphone', 'Industry standard handheld', 'available', null],
      ['SSL-AUD-006', 'Sennheiser e935 Microphone', 'audio', 180.00, 25.00, 'Dynamic vocal microphone', 'Cardioid, excellent feedback rejection', 'available', null],
      ['SSL-AUD-007', 'DI Box (Radial J48)', 'audio', 200.00, 10.00, 'Active direct box', 'Phantom powered, -15dB pad', 'available', null],
      ['SSL-AUD-008', 'QSC K12.2 Powered Speaker', 'audio', 800.00, 75.00, '12" powered speaker', '2000W, DSP, versatile', 'available', null],
      ['SSL-AUD-009', 'Behringer X32 Rack', 'audio', 1500.00, 150.00, '40-input digital mixer', 'Compact rack mount, WiFi control', 'available', null],
      ['SSL-AUD-010', 'In-Ear Monitor System (Shure PSM300)', 'audio', 600.00, 50.00, 'Personal monitor system', 'Stereo, SE215 earphones included', 'available', null],

      // Video
      ['SSL-VID-001', 'Panasonic PT-RZ120 Projector', 'video', 12000.00, 400.00, '12,000 lumen laser projector', 'WUXGA, lens shift, 24/7 operation', 'available', null],
      ['SSL-VID-002', 'Da-Lite 16x9 Screen (12ft)', 'video', 2000.00, 100.00, 'Fast-fold projection screen', 'Front/rear surface, dress kit', 'available', null],
      ['SSL-VID-003', 'Blackmagic ATEM Mini Extreme', 'video', 1000.00, 75.00, '8-input video switcher', 'HDMI, streaming, SuperSource', 'available', null],
      ['SSL-VID-004', 'PTZ Camera (Sony SRG-X400)', 'video', 3500.00, 150.00, '4K PTZ camera', 'NDI, 40x zoom, ceiling mount', 'available', null],
      ['SSL-VID-005', 'LED Video Wall Panel (per panel)', 'video', 2500.00, 100.00, '2.9mm pixel pitch LED', '500x500mm panel, indoor', 'available', null],
      ['SSL-VID-006', 'Confidence Monitor 24"', 'video', 400.00, 40.00, 'Stage confidence monitor', 'HDMI input, speaker stand mount', 'available', null],

      // Lighting
      ['SSL-LGT-001', 'Martin MAC Aura XB', 'lighting', 5000.00, 150.00, 'LED wash moving head', 'RGBW, zoom, aura effect', 'available', null],
      ['SSL-LGT-002', 'Chauvet Rogue R2 Spot', 'lighting', 3000.00, 100.00, 'LED spot moving head', 'Gobo, prism, 240W LED', 'available', null],
      ['SSL-LGT-003', 'ETC ColorSource PAR', 'lighting', 500.00, 30.00, 'LED PAR fixture', 'RGBL, deep colors, quiet', 'available', null],
      ['SSL-LGT-004', 'Chauvet COLORado Batten 72X', 'lighting', 800.00, 50.00, 'LED strip/wash', 'RGBWA, pixel control', 'available', null],
      ['SSL-LGT-005', 'Uplighting Package (10 fixtures)', 'lighting', 2000.00, 150.00, 'Wireless LED uplights', 'Battery powered, app control', 'available', null],
      ['SSL-LGT-006', 'MA Lighting grandMA3 onPC', 'lighting', 500.00, 100.00, 'Lighting control software', 'With command wing', 'available', null],
      ['SSL-LGT-007', 'Haze Machine (MDG Me1)', 'lighting', 3000.00, 75.00, 'Oil-based hazer', 'Low fluid consumption, quiet', 'available', null],
      ['SSL-LGT-008', 'Follow Spot (Robert Juliat)', 'lighting', 8000.00, 200.00, '1200W follow spot', 'Long throw, iris, color', 'available', null],

      // Other
      ['SSL-OTH-001', 'Truss Section 10ft (box)', 'other', 400.00, 25.00, '12" box truss', 'Aluminum, 1000lb capacity', 'available', null],
      ['SSL-OTH-002', 'Chain Hoist 1-ton', 'other', 2000.00, 75.00, 'Electric chain motor', 'CM Lodestar, 60fpm', 'available', null],
      ['SSL-OTH-003', 'Pipe & Drape (per 10ft section)', 'other', 150.00, 20.00, 'Black velour drape', '10ft tall, flame retardant', 'available', null],
      ['SSL-OTH-004', 'Cable Ramp (5 channel)', 'other', 300.00, 15.00, 'Yellow Jacket cable ramp', '5 channels, ADA compliant', 'available', null],
      ['SSL-OTH-005', 'Power Distribution (Cam-lok)', 'other', 800.00, 50.00, '200A power distro', 'Cam-lok to Edison/L6-20', 'available', null],
    ];

    for (const e of equipment) {
      await connection.execute(
        `INSERT INTO equipment (serial_number, name, category, sale_price, rental_rate, description, specifications, status, maintenance_due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        e
      );
    }
    console.log(`   ✓ Added ${equipment.length} equipment items`);

    // ============================================
    // ORDERS (2025 calendar year)
    // ============================================
    console.log('\n4. Adding orders...');

    // Get customer IDs
    const [customerRows] = await connection.query('SELECT id, name FROM customers');
    const customerMap = {};
    for (const c of customerRows) {
      customerMap[c.name] = c.id;
    }

    // Get employee IDs
    const [employeeRows] = await connection.query('SELECT id, name, role FROM employees');

    const orders = [
      // COMPLETED (past events)
      { customer: 'Springfield Convention Center', num: 'SSL-2025-001', type: 'invoice', status: 'completed', date: '2025-01-15', addr: '100 Convention Way', city: 'Springfield', state: 'IL', zip: '62701', comments: 'Annual Business Expo - Full AV support', rental: 5540, operator: 2100, total: 7640 },
      { customer: 'First Methodist Church', num: 'SSL-2025-002', type: 'invoice', status: 'completed', date: '2025-04-20', addr: '200 Church St', city: 'Springfield', state: 'IL', zip: '62702', comments: 'Easter Sunday Service', rental: 750, operator: 330, total: 1080 },
      { customer: 'Lincoln High School', num: 'SSL-2025-003', type: 'invoice', status: 'completed', date: '2025-05-24', addr: '300 Education Blvd', city: 'Springfield', state: 'IL', zip: '62703', comments: 'Class of 2025 Graduation Ceremony', rental: 1000, operator: 520, total: 1520 },
      { customer: 'Riverfront Amphitheater', num: 'SSL-2025-004', type: 'invoice', status: 'completed', date: '2025-07-04', addr: '400 River Rd', city: 'Springfield', state: 'IL', zip: '62704', comments: '4th of July Festival - Main Stage', rental: 18200, operator: 6300, total: 24500 },
      { customer: 'Rock Island Brewery', num: 'SSL-2025-005', type: 'invoice', status: 'completed', date: '2025-08-15', addr: '700 Craft Beer Lane', city: 'Springfield', state: 'IL', zip: '62707', comments: 'Summer Concert Series - Blues Night', rental: 700, operator: 330, total: 1030 },
      { customer: 'Memorial Hospital Foundation', num: 'SSL-2025-006', type: 'invoice', status: 'completed', date: '2025-09-20', addr: '800 Health Center Dr', city: 'Springfield', state: 'IL', zip: '62708', comments: 'Annual Charity Gala', rental: 1650, operator: 480, total: 2130 },
      { customer: 'Springfield Wedding Venue', num: 'SSL-2025-007', type: 'invoice', status: 'completed', date: '2025-10-12', addr: '600 Elegance Ave', city: 'Springfield', state: 'IL', zip: '62706', comments: 'Anderson-Martinez Wedding Reception', rental: 1200, operator: 550, total: 1750 },
      { customer: 'Capital City Corporate Events', num: 'SSL-2025-008', type: 'invoice', status: 'completed', date: '2025-11-05', addr: '500 Business Park Dr', city: 'Springfield', state: 'IL', zip: '62705', comments: 'Q3 All-Hands Meeting - Hybrid event', rental: 1350, operator: 1350, total: 2700 },

      // ACCEPTED (upcoming confirmed)
      { customer: 'First Methodist Church', num: 'SSL-2025-009', type: 'order', status: 'accepted', date: '2025-11-27', addr: '200 Church St', city: 'Springfield', state: 'IL', zip: '62702', comments: 'Thanksgiving Service - Special musical program', rental: 900, operator: 275, total: 1175 },
      { customer: 'Springfield Convention Center', num: 'SSL-2025-010', type: 'order', status: 'accepted', date: '2025-12-06', addr: '100 Convention Way', city: 'Springfield', state: 'IL', zip: '62701', comments: 'Holiday Craft Fair - 2 stages + vendor PA', rental: 3700, operator: 990, total: 4690 },
      { customer: 'Rock Island Brewery', num: 'SSL-2025-011', type: 'order', status: 'accepted', date: '2025-12-13', addr: '700 Craft Beer Lane', city: 'Springfield', state: 'IL', zip: '62707', comments: 'Holiday Party - Live Band + DJ', rental: 1000, operator: 440, total: 1440 },
      { customer: 'Memorial Hospital Foundation', num: 'SSL-2025-012', type: 'order', status: 'accepted', date: '2025-12-20', addr: '800 Health Center Dr', city: 'Springfield', state: 'IL', zip: '62708', comments: 'Holiday Donor Appreciation Event', rental: 1450, operator: 360, total: 1810 },
      { customer: 'First Methodist Church', num: 'SSL-2025-013', type: 'order', status: 'accepted', date: '2025-12-24', addr: '200 Church St', city: 'Springfield', state: 'IL', zip: '62702', comments: 'Christmas Eve Candlelight Service', rental: 1200, operator: 720, total: 1920 },
      { customer: 'Springfield Convention Center', num: 'SSL-2025-014', type: 'order', status: 'accepted', date: '2025-12-31', addr: '100 Convention Way', city: 'Springfield', state: 'IL', zip: '62701', comments: 'New Year\'s Eve Gala - Premium production', rental: 6700, operator: 2820, total: 9520 },

      // PROPOSALS (pending)
      { customer: 'Lincoln High School', num: 'SSL-2025-015', type: 'proposal', status: 'sent', date: '2026-01-18', addr: '300 Education Blvd', city: 'Springfield', state: 'IL', zip: '62703', comments: 'Winter Formal Dance', rental: 975, operator: 330, total: 1305 },
      { customer: 'Capital City Corporate Events', num: 'SSL-2025-016', type: 'proposal', status: 'sent', date: '2026-02-15', addr: '500 Business Park Dr', city: 'Springfield', state: 'IL', zip: '62705', comments: 'Annual Sales Kickoff - 500 attendees', rental: 9000, operator: 5100, total: 14100 },
      { customer: 'Riverfront Amphitheater', num: 'SSL-2025-017', type: 'proposal', status: 'draft', date: '2026-05-23', addr: '400 River Rd', city: 'Springfield', state: 'IL', zip: '62704', comments: 'Summer Concert Series 2026 - Season Package', rental: 37000, operator: 26400, total: 63400 },
    ];

    for (const o of orders) {
      const customerId = customerMap[o.customer];
      if (!customerId) {
        console.log(`   ⚠ Customer not found: ${o.customer}`);
        continue;
      }

      const [result] = await connection.execute(
        `INSERT INTO orders (customer_id, order_number, type, status, event_date, event_address, event_city, event_state, event_zip, comments, sales_total, rental_total, operator_total, total_cost)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
        [customerId, o.num, o.type, o.status, o.date, o.addr, o.city, o.state, o.zip, o.comments, o.rental, o.operator, o.total]
      );

      // Assign workers to accepted/completed orders
      if ((o.status === 'accepted' || o.status === 'completed') && employeeRows.length > 0) {
        const numWorkers = Math.min(employeeRows.length, Math.floor(Math.random() * 3) + 1);
        const shuffled = [...employeeRows].sort(() => 0.5 - Math.random());
        for (const worker of shuffled.slice(0, numWorkers)) {
          await connection.execute(
            `INSERT INTO order_workers (order_id, employee_id, role, notes) VALUES (?, ?, ?, ?)`,
            [result.insertId, worker.id, worker.role === 'technician' ? 'Tech' : worker.role === 'contract' ? 'Support' : 'Lead', null]
          );
        }
      }
    }
    console.log(`   ✓ Added ${orders.length} orders`);

    // ============================================
    // SUMMARY
    // ============================================
    const [custCount] = await connection.query('SELECT COUNT(*) as c FROM customers');
    const [empCount] = await connection.query('SELECT COUNT(*) as c FROM employees');
    const [eqCount] = await connection.query('SELECT COUNT(*) as c FROM equipment');
    const [ordCount] = await connection.query('SELECT COUNT(*) as c FROM orders');
    const [revenue] = await connection.query('SELECT SUM(total_cost) as r FROM orders WHERE status = "completed"');

    console.log('\n========================================');
    console.log('✅ Seed completed successfully!');
    console.log('========================================');
    console.log(`   Customers: ${custCount[0].c}`);
    console.log(`   Employees: ${empCount[0].c}`);
    console.log(`   Equipment: ${eqCount[0].c}`);
    console.log(`   Orders: ${ordCount[0].c}`);
    console.log(`   Completed Revenue: $${Number(revenue[0].r || 0).toLocaleString()}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
