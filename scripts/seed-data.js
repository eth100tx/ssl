const mysql = require('mysql2/promise');

async function seedData() {
  const connection = await mysql.createConnection(
    process.env.DATABASE_URL || process.env.MYSQL_URL
  );

  try {
    console.log('Seeding mock data...\n');

    // Clear existing data (in order due to foreign keys)
    console.log('Clearing existing data...');
    await connection.query('DELETE FROM order_items');
    await connection.query('DELETE FROM reservations');
    await connection.query('DELETE FROM orders');
    await connection.query('DELETE FROM equipment');
    await connection.query('DELETE FROM customers');

    // Insert Customers
    console.log('Adding customers...');
    const customers = [
      ['First Baptist Church', 'First Baptist Church', 'Pastor John Williams', '555-0101', '123 Main Street', 'Springfield', 'IL', '62701', '555-0102', 'Long-term client, weekly services'],
      ['City Convention Center', 'Springfield Convention Center', 'Sarah Martinez', '555-0201', '500 Convention Blvd', 'Springfield', 'IL', '62702', '555-0202', 'Large events, needs full setup'],
      ['Springfield Lions Club', 'Lions Club International', 'Mike Thompson', '555-0301', '789 Oak Avenue', 'Springfield', 'IL', '62703', null, 'Monthly meetings, occasional fundraisers'],
      ['Riverside Community Church', 'Riverside Community Church', 'Rev. Emily Davis', '555-0401', '456 River Road', 'Riverside', 'IL', '62704', '555-0402', 'Sunday services and special events'],
      ['Downtown Event Hall', 'Downtown Events LLC', 'Jennifer Lee', '555-0501', '100 Center Street', 'Springfield', 'IL', '62701', '555-0502', 'Weddings, corporate events'],
      ['Springfield High School', 'Springfield School District', 'Principal Robert Brown', '555-0601', '200 Education Lane', 'Springfield', 'IL', '62705', '555-0602', 'Graduations, sports events, theater'],
      ['Rotary Club of Springfield', 'Rotary International', 'David Wilson', '555-0701', '321 Service Drive', 'Springfield', 'IL', '62701', null, 'Weekly luncheons, annual gala'],
      ['Grace Methodist Church', 'Grace Methodist Church', 'Pastor Susan Clark', '555-0801', '555 Faith Street', 'Springfield', 'IL', '62706', '555-0802', 'Weekly services, choir performances'],
      ['Corporate Solutions Inc', 'Corporate Solutions Inc', 'Amanda Foster', '555-0901', '1000 Business Park', 'Springfield', 'IL', '62707', '555-0902', 'Quarterly meetings, training sessions'],
      ['Springfield Arts Council', 'Springfield Arts Council', 'Michael Chen', '555-1001', '750 Arts Boulevard', 'Springfield', 'IL', '62701', '555-1002', 'Theater productions, concerts'],
    ];

    for (const c of customers) {
      await connection.query(
        `INSERT INTO customers (name, company, contact_name, phone, address, city, state, zip, fax, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        c
      );
    }
    console.log(`  Added ${customers.length} customers`);

    // Insert Equipment
    console.log('Adding equipment...');
    const equipment = [
      // Audio Equipment
      ['SND-001', 'Yamaha TF3 Digital Mixer', 'audio', 8500.00, 350.00, '24-channel digital mixing console', '24 inputs, 48kHz, built-in effects', 'available', null],
      ['SND-002', 'QSC K12.2 Speaker (Pair)', 'audio', 2400.00, 150.00, '12" powered speakers, 2000W each', '132dB peak SPL, DSP', 'available', null],
      ['SND-003', 'QSC KS118 Subwoofer', 'audio', 2200.00, 125.00, '18" powered subwoofer', '3600W, 129dB SPL', 'available', null],
      ['SND-004', 'Shure SM58 Microphone', 'audio', 100.00, 25.00, 'Dynamic vocal microphone', 'Cardioid, 50Hz-15kHz', 'available', null],
      ['SND-005', 'Shure SM58 Microphone', 'audio', 100.00, 25.00, 'Dynamic vocal microphone', 'Cardioid, 50Hz-15kHz', 'available', null],
      ['SND-006', 'Shure SM58 Microphone', 'audio', 100.00, 25.00, 'Dynamic vocal microphone', 'Cardioid, 50Hz-15kHz', 'reserved', null],
      ['SND-007', 'Sennheiser EW 100 G4 Wireless', 'audio', 650.00, 75.00, 'Wireless handheld microphone system', 'UHF, 100m range', 'available', null],
      ['SND-008', 'Sennheiser EW 100 G4 Wireless', 'audio', 650.00, 75.00, 'Wireless handheld microphone system', 'UHF, 100m range', 'available', null],
      ['SND-009', 'Sennheiser EW 100 G4 Lavalier', 'audio', 700.00, 75.00, 'Wireless lavalier microphone system', 'UHF, bodypack transmitter', 'available', null],
      ['SND-010', 'Crown XLi 2500 Amplifier', 'audio', 500.00, 50.00, 'Power amplifier', '2x 750W @ 4 ohms', 'available', null],
      ['SND-011', 'Behringer X32 Rack', 'audio', 1500.00, 200.00, '40-input digital rack mixer', 'WiFi control, 16 buses', 'out', null],
      ['SND-012', 'JBL EON615 Speaker', 'audio', 700.00, 75.00, '15" powered speaker', '1000W, Bluetooth', 'available', null],

      // Video Equipment
      ['VID-001', 'Epson Pro L1500U Projector', 'video', 12000.00, 500.00, 'Laser projector 12000 lumens', 'WUXGA, 4K enhancement', 'available', '2025-12-15'],
      ['VID-002', 'Epson Pro L1200U Projector', 'video', 8000.00, 400.00, 'Laser projector 7000 lumens', 'WUXGA, lens shift', 'available', null],
      ['VID-003', 'Da-Lite 120" Screen', 'video', 1200.00, 100.00, 'Tripod projection screen', '16:9 aspect ratio', 'available', null],
      ['VID-004', 'Da-Lite 150" Screen', 'video', 1800.00, 150.00, 'Tripod projection screen', '16:9 aspect ratio', 'available', null],
      ['VID-005', 'Draper 200" Screen', 'video', 3500.00, 250.00, 'Electric projection screen', '16:9, wall mount', 'available', null],
      ['VID-006', 'Blackmagic ATEM Mini Pro', 'video', 600.00, 75.00, 'Live production switcher', '4 HDMI inputs, streaming', 'available', null],
      ['VID-007', 'Sony HXR-NX100 Camera', 'video', 2500.00, 200.00, 'Professional camcorder', '1080p, 3x sensors', 'available', null],
      ['VID-008', 'Samsung 75" Display', 'video', 2000.00, 175.00, 'Commercial display', '4K UHD, smart signage', 'available', null],

      // Lighting Equipment
      ['LGT-001', 'Chauvet DJ SlimPAR Pro H', 'lighting', 350.00, 40.00, 'RGBAW+UV LED par', 'Wireless DMX compatible', 'available', null],
      ['LGT-002', 'Chauvet DJ SlimPAR Pro H', 'lighting', 350.00, 40.00, 'RGBAW+UV LED par', 'Wireless DMX compatible', 'available', null],
      ['LGT-003', 'Chauvet DJ SlimPAR Pro H', 'lighting', 350.00, 40.00, 'RGBAW+UV LED par', 'Wireless DMX compatible', 'available', null],
      ['LGT-004', 'Chauvet DJ SlimPAR Pro H', 'lighting', 350.00, 40.00, 'RGBAW+UV LED par', 'Wireless DMX compatible', 'available', null],
      ['LGT-005', 'ADJ Mega Flash DMX', 'lighting', 200.00, 30.00, '800W strobe light', 'DMX controllable', 'available', null],
      ['LGT-006', 'Martin MAC Aura XB', 'lighting', 4500.00, 250.00, 'LED wash moving head', 'RGBW, zoom', 'available', '2025-12-01'],
      ['LGT-007', 'Martin MAC Aura XB', 'lighting', 4500.00, 250.00, 'LED wash moving head', 'RGBW, zoom', 'maintenance', '2025-11-20'],
      ['LGT-008', 'ETC Source Four LED', 'lighting', 1500.00, 100.00, 'Ellipsoidal spotlight', 'Full color mixing', 'available', null],
      ['LGT-009', 'ETC Source Four LED', 'lighting', 1500.00, 100.00, 'Ellipsoidal spotlight', 'Full color mixing', 'available', null],
      ['LGT-010', 'Chauvet Intimidator Spot 375Z', 'lighting', 800.00, 75.00, 'LED moving head spot', '150W, prism', 'available', null],
      ['LGT-011', 'Chauvet Intimidator Spot 375Z', 'lighting', 800.00, 75.00, 'LED moving head spot', '150W, prism', 'available', null],
      ['LGT-012', 'Chamsys QuickQ 20', 'lighting', 2000.00, 150.00, 'Lighting console', '20 universes, touchscreen', 'available', null],
      ['LGT-013', 'Global Truss 20x20 System', 'lighting', 5000.00, 400.00, 'Aluminum truss system', '12" box truss, bases', 'available', null],

      // Other Equipment
      ['OTH-001', 'Staging - 4x8 Deck', 'other', 400.00, 50.00, 'Portable stage deck', '4ft x 8ft, adjustable legs', 'available', null],
      ['OTH-002', 'Staging - 4x8 Deck', 'other', 400.00, 50.00, 'Portable stage deck', '4ft x 8ft, adjustable legs', 'available', null],
      ['OTH-003', 'Staging - 4x8 Deck', 'other', 400.00, 50.00, 'Portable stage deck', '4ft x 8ft, adjustable legs', 'available', null],
      ['OTH-004', 'Staging - 4x8 Deck', 'other', 400.00, 50.00, 'Portable stage deck', '4ft x 8ft, adjustable legs', 'available', null],
      ['OTH-005', 'Podium with Mic', 'other', 300.00, 35.00, 'Wooden podium', 'Built-in gooseneck mic', 'available', null],
      ['OTH-006', 'Cable Snake 100ft', 'other', 400.00, 40.00, '24-channel audio snake', '100ft, XLR returns', 'available', null],
    ];

    for (const e of equipment) {
      await connection.query(
        `INSERT INTO equipment (serial_number, name, category, sale_price, rental_rate, description, specifications, status, maintenance_due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        e
      );
    }
    console.log(`  Added ${equipment.length} equipment items`);

    // Get customer and equipment IDs
    const [customerRows] = await connection.query('SELECT id, name FROM customers');
    const [equipmentRows] = await connection.query('SELECT id, name, rental_rate, sale_price FROM equipment');

    const customerMap = {};
    customerRows.forEach(c => customerMap[c.name] = c.id);

    const equipmentMap = {};
    equipmentRows.forEach(e => equipmentMap[e.name] = { id: e.id, rental_rate: e.rental_rate, sale_price: e.sale_price });

    // Insert Orders
    console.log('Adding orders...');
    const orders = [
      // Completed orders
      [customerMap['First Baptist Church'], 'ORD-2411-0001', 'invoice', 'completed', '2024-11-10', '123 Main Street', 'Springfield', 'IL', '62701', 'Check', 'Net 30', 'Weekly service sound support'],
      [customerMap['Springfield High School'], 'ORD-2411-0002', 'invoice', 'completed', '2024-11-15', '200 Education Lane', 'Springfield', 'IL', '62705', 'PO', 'Net 45', 'Fall concert'],

      // Active orders
      [customerMap['City Convention Center'], 'ORD-2411-0003', 'order', 'accepted', '2024-12-05', '500 Convention Blvd', 'Springfield', 'IL', '62702', 'Credit Card', 'Due on delivery', 'Holiday corporate gala'],
      [customerMap['Downtown Event Hall'], 'ORD-2411-0004', 'order', 'accepted', '2024-12-14', '100 Center Street', 'Springfield', 'IL', '62701', 'Check', 'Net 30', 'Wedding reception'],
      [customerMap['Springfield Arts Council'], 'ORD-2411-0005', 'order', 'sent', '2024-12-20', '750 Arts Boulevard', 'Springfield', 'IL', '62701', 'Invoice', 'Net 30', 'Winter concert series'],

      // Proposals
      [customerMap['Rotary Club of Springfield'], 'ORD-2411-0006', 'proposal', 'sent', '2025-01-15', '321 Service Drive', 'Springfield', 'IL', '62701', null, null, 'Annual gala event'],
      [customerMap['Corporate Solutions Inc'], 'ORD-2411-0007', 'proposal', 'sent', '2025-01-20', '1000 Business Park', 'Springfield', 'IL', '62707', null, null, 'Q1 Sales kickoff meeting'],
      [customerMap['Grace Methodist Church'], 'ORD-2411-0008', 'proposal', 'draft', '2025-02-01', '555 Faith Street', 'Springfield', 'IL', '62706', null, null, 'Easter service expansion'],
    ];

    for (const o of orders) {
      await connection.query(
        `INSERT INTO orders (customer_id, order_number, type, status, event_date, event_address, event_city, event_state, event_zip, payment_method, payment_terms, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        o
      );
    }
    console.log(`  Added ${orders.length} orders`);

    // Get order IDs
    const [orderRows] = await connection.query('SELECT id, order_number FROM orders');
    const orderMap = {};
    orderRows.forEach(o => orderMap[o.order_number] = o.id);

    // Insert Order Items
    console.log('Adding order items...');
    const orderItems = [
      // ORD-2411-0001 - Church weekly service
      [orderMap['ORD-2411-0001'], equipmentMap['Yamaha TF3 Digital Mixer'].id, 'rental', 'Yamaha TF3 Digital Mixer', 1, 350.00, '2024-11-10', '2024-11-10', null, 350.00],
      [orderMap['ORD-2411-0001'], equipmentMap['QSC K12.2 Speaker (Pair)'].id, 'rental', 'QSC K12.2 Speaker Pair', 1, 150.00, '2024-11-10', '2024-11-10', null, 150.00],
      [orderMap['ORD-2411-0001'], equipmentMap['Shure SM58 Microphone'].id, 'rental', 'Shure SM58 Microphone', 3, 25.00, '2024-11-10', '2024-11-10', null, 75.00],
      [orderMap['ORD-2411-0001'], null, 'operator', 'Sound Technician - Burt', 1, 50.00, null, null, 4, 200.00],

      // ORD-2411-0002 - High School concert
      [orderMap['ORD-2411-0002'], equipmentMap['Behringer X32 Rack'].id, 'rental', 'Behringer X32 Rack', 1, 200.00, '2024-11-15', '2024-11-15', null, 200.00],
      [orderMap['ORD-2411-0002'], equipmentMap['QSC K12.2 Speaker (Pair)'].id, 'rental', 'QSC K12.2 Speakers', 2, 150.00, '2024-11-15', '2024-11-15', null, 300.00],
      [orderMap['ORD-2411-0002'], equipmentMap['Chauvet DJ SlimPAR Pro H'].id, 'rental', 'SlimPAR Pro H (x4)', 4, 40.00, '2024-11-15', '2024-11-15', null, 160.00],
      [orderMap['ORD-2411-0002'], null, 'operator', 'Sound Technician', 1, 50.00, null, null, 6, 300.00],
      [orderMap['ORD-2411-0002'], null, 'operator', 'Lighting Technician', 1, 50.00, null, null, 6, 300.00],

      // ORD-2411-0003 - Corporate gala
      [orderMap['ORD-2411-0003'], equipmentMap['Yamaha TF3 Digital Mixer'].id, 'rental', 'Yamaha TF3 Digital Mixer', 1, 350.00, '2024-12-05', '2024-12-05', null, 350.00],
      [orderMap['ORD-2411-0003'], equipmentMap['QSC K12.2 Speaker (Pair)'].id, 'rental', 'QSC K12.2 Speakers', 2, 150.00, '2024-12-05', '2024-12-05', null, 300.00],
      [orderMap['ORD-2411-0003'], equipmentMap['QSC KS118 Subwoofer'].id, 'rental', 'QSC KS118 Subwoofer', 2, 125.00, '2024-12-05', '2024-12-05', null, 250.00],
      [orderMap['ORD-2411-0003'], equipmentMap['Sennheiser EW 100 G4 Wireless'].id, 'rental', 'Wireless Handheld Mics', 2, 75.00, '2024-12-05', '2024-12-05', null, 150.00],
      [orderMap['ORD-2411-0003'], equipmentMap['Epson Pro L1500U Projector'].id, 'rental', 'Epson 12000 Lumen Projector', 1, 500.00, '2024-12-05', '2024-12-05', null, 500.00],
      [orderMap['ORD-2411-0003'], equipmentMap['Da-Lite 150" Screen'].id, 'rental', '150" Projection Screen', 1, 150.00, '2024-12-05', '2024-12-05', null, 150.00],
      [orderMap['ORD-2411-0003'], equipmentMap['Martin MAC Aura XB'].id, 'rental', 'Martin MAC Aura Moving Heads', 2, 250.00, '2024-12-05', '2024-12-05', null, 500.00],
      [orderMap['ORD-2411-0003'], equipmentMap['Chauvet DJ SlimPAR Pro H'].id, 'rental', 'LED Par Lights', 4, 40.00, '2024-12-05', '2024-12-05', null, 160.00],
      [orderMap['ORD-2411-0003'], equipmentMap['Global Truss 20x20 System'].id, 'rental', 'Truss System', 1, 400.00, '2024-12-05', '2024-12-05', null, 400.00],
      [orderMap['ORD-2411-0003'], null, 'operator', 'Lead Technician', 1, 75.00, null, null, 10, 750.00],
      [orderMap['ORD-2411-0003'], null, 'operator', 'Audio Technician', 1, 50.00, null, null, 10, 500.00],
      [orderMap['ORD-2411-0003'], null, 'operator', 'Lighting Technician', 1, 50.00, null, null, 10, 500.00],

      // ORD-2411-0004 - Wedding
      [orderMap['ORD-2411-0004'], equipmentMap['JBL EON615 Speaker'].id, 'rental', 'JBL EON615 Speakers', 2, 75.00, '2024-12-14', '2024-12-14', null, 150.00],
      [orderMap['ORD-2411-0004'], equipmentMap['Sennheiser EW 100 G4 Wireless'].id, 'rental', 'Wireless Mic for Officiant', 1, 75.00, '2024-12-14', '2024-12-14', null, 75.00],
      [orderMap['ORD-2411-0004'], equipmentMap['Sennheiser EW 100 G4 Lavalier'].id, 'rental', 'Lavalier Mic for Groom', 1, 75.00, '2024-12-14', '2024-12-14', null, 75.00],
      [orderMap['ORD-2411-0004'], equipmentMap['Chauvet DJ SlimPAR Pro H'].id, 'rental', 'Uplighting Package', 4, 40.00, '2024-12-14', '2024-12-14', null, 160.00],
      [orderMap['ORD-2411-0004'], null, 'operator', 'DJ/MC Services', 1, 75.00, null, null, 6, 450.00],

      // ORD-2411-0005 - Arts Council concert
      [orderMap['ORD-2411-0005'], equipmentMap['Yamaha TF3 Digital Mixer'].id, 'rental', 'Yamaha TF3', 1, 350.00, '2024-12-20', '2024-12-21', null, 700.00],
      [orderMap['ORD-2411-0005'], equipmentMap['QSC K12.2 Speaker (Pair)'].id, 'rental', 'Main Speakers', 2, 150.00, '2024-12-20', '2024-12-21', null, 600.00],
      [orderMap['ORD-2411-0005'], equipmentMap['ETC Source Four LED'].id, 'rental', 'Stage Spots', 2, 100.00, '2024-12-20', '2024-12-21', null, 400.00],
      [orderMap['ORD-2411-0005'], equipmentMap['Chamsys QuickQ 20'].id, 'rental', 'Lighting Console', 1, 150.00, '2024-12-20', '2024-12-21', null, 300.00],

      // ORD-2411-0006 - Rotary Gala proposal
      [orderMap['ORD-2411-0006'], equipmentMap['Behringer X32 Rack'].id, 'rental', 'Audio Package', 1, 200.00, '2025-01-15', '2025-01-15', null, 200.00],
      [orderMap['ORD-2411-0006'], equipmentMap['QSC K12.2 Speaker (Pair)'].id, 'rental', 'Speakers', 2, 150.00, '2025-01-15', '2025-01-15', null, 300.00],
      [orderMap['ORD-2411-0006'], equipmentMap['Epson Pro L1200U Projector'].id, 'rental', 'Projector', 1, 400.00, '2025-01-15', '2025-01-15', null, 400.00],
      [orderMap['ORD-2411-0006'], equipmentMap['Da-Lite 120" Screen'].id, 'rental', 'Screen', 1, 100.00, '2025-01-15', '2025-01-15', null, 100.00],
      [orderMap['ORD-2411-0006'], null, 'operator', 'Technician', 1, 50.00, null, null, 6, 300.00],
    ];

    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, equipment_id, item_type, description, quantity, unit_price, rental_start, rental_end, hours, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }
    console.log(`  Added ${orderItems.length} order items`);

    // Update order totals
    console.log('Updating order totals...');
    const orderIds = Object.values(orderMap);
    for (const orderId of orderIds) {
      const [items] = await connection.query(
        'SELECT item_type, SUM(total) as sum FROM order_items WHERE order_id = ? GROUP BY item_type',
        [orderId]
      );

      let sales_total = 0, rental_total = 0, operator_total = 0;
      items.forEach(item => {
        if (item.item_type === 'sale') sales_total = parseFloat(item.sum) || 0;
        if (item.item_type === 'rental') rental_total = parseFloat(item.sum) || 0;
        if (item.item_type === 'operator') operator_total = parseFloat(item.sum) || 0;
      });

      await connection.query(
        'UPDATE orders SET sales_total = ?, rental_total = ?, operator_total = ?, total_cost = ? WHERE id = ?',
        [sales_total, rental_total, operator_total, sales_total + rental_total + operator_total, orderId]
      );
    }

    // Insert Reservations (for upcoming events)
    console.log('Adding reservations...');
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    // Today's date and future dates
    const todayStr = formatDate(today);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
    const twoWeeks = new Date(today); twoWeeks.setDate(today.getDate() + 14);

    const reservations = [
      // Today's reservations
      [equipmentMap['Behringer X32 Rack'].id, null, 'First Baptist Church', todayStr, todayStr, '08:00:00', '14:00:00', 'out'],
      [equipmentMap['QSC K12.2 Speaker (Pair)'].id, null, 'First Baptist Church', todayStr, todayStr, '08:00:00', '14:00:00', 'out'],
      [equipmentMap['Shure SM58 Microphone'].id, null, 'First Baptist Church', todayStr, todayStr, '08:00:00', '14:00:00', 'reserved'],

      // Tomorrow
      [equipmentMap['Yamaha TF3 Digital Mixer'].id, null, 'Downtown Event Hall', todayStr, formatDate(tomorrow), '10:00:00', '22:00:00', 'reserved'],
      [equipmentMap['Chauvet DJ SlimPAR Pro H'].id, null, 'Downtown Event Hall', todayStr, formatDate(tomorrow), '10:00:00', '22:00:00', 'reserved'],

      // Next week - Corporate Gala (Dec 5)
      [equipmentMap['Epson Pro L1500U Projector'].id, orderMap['ORD-2411-0003'], 'City Convention Center', todayStr, '2024-12-05', '07:00:00', '23:00:00', 'reserved'],
      [equipmentMap['Da-Lite 150" Screen'].id, orderMap['ORD-2411-0003'], 'City Convention Center', todayStr, '2024-12-05', '07:00:00', '23:00:00', 'reserved'],
      [equipmentMap['Global Truss 20x20 System'].id, orderMap['ORD-2411-0003'], 'City Convention Center', todayStr, '2024-12-05', '07:00:00', '23:00:00', 'reserved'],
    ];

    for (const r of reservations) {
      await connection.query(
        `INSERT INTO reservations (equipment_id, order_id, customer_name, reservation_date, event_date, time_out, time_due_in, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        r
      );
    }
    console.log(`  Added ${reservations.length} reservations`);

    console.log('\n✅ Mock data seeded successfully!');
    console.log('\nSummary:');
    console.log(`  - ${customers.length} customers`);
    console.log(`  - ${equipment.length} equipment items`);
    console.log(`  - ${orders.length} orders`);
    console.log(`  - ${orderItems.length} order line items`);
    console.log(`  - ${reservations.length} reservations`);

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedData();
