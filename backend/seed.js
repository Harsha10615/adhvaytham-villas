import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool, { initDb, dbMetadata } from './config/db.js';

dotenv.config();

const runSeeder = async () => {
  try {
    // Ensure tables exist before we start clearing/seeding
    await initDb();

    console.log('\n================ ENVIRONMENT DETECTED ================');
    console.log(`Environment Detection: ${dbMetadata.isRailway ? 'Railway' : 'Local'}`);
    console.log(`Connected Database Host: ${dbMetadata.host}:${dbMetadata.port}`);
    console.log(`Database Name: ${dbMetadata.database}`);
    console.log('======================================================\n');

    // Check if villas table already contains data
    const [villasCountResult] = await pool.query('SELECT COUNT(*) as count FROM villas');
    const villasExist = villasCountResult[0].count > 0;

    if (villasExist) {
      console.log(`Villas table contains ${villasCountResult[0].count} records. Clearing data before inserting new data...`);
      // Clear tables
      await pool.query('SET FOREIGN_KEY_CHECKS = 0');
      await pool.query('TRUNCATE TABLE users');
      await pool.query('TRUNCATE TABLE villas');
      await pool.query('TRUNCATE TABLE bookings');
      await pool.query('TRUNCATE TABLE contacts');
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('MySQL Tables cleared.');
    } else {
      console.log('Villas table is empty. Skipping clear step.');
      // Prevent duplicate email entry for the admin user if users table has it already
      const [adminExistsResult] = await pool.query('SELECT COUNT(*) as count FROM users WHERE email = ?', ['harshapothireddy9381@gmail.com']);
      if (adminExistsResult[0].count > 0) {
        console.log('Admin user already exists. Removing the existing user to avoid duplicate email constraint...');
        await pool.query('DELETE FROM users WHERE email = ?', ['harshapothireddy9381@gmail.com']);
      }
    }

    // 1. Seed Admin User (using users table)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Harsha@9381', salt);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
      ['Harsha Pothireddy', 'harshapothireddy9381@gmail.com', hashedPassword, 'admin']
    );

    console.log('Admin user seeded (Email: harshapothireddy9381@gmail.com, Password: Harsha@9381)');

    // 2. Seed 120 Villas
    const imageMap = {
      "2bhk": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "3bhk-exec": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "3bhk-prem": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "4bhk-sig": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "4bhk-grand": "https://images.unsplash.com/photo-1600607687644-aac4c15cecb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };

    let villaValues = [];
    
    for (let i = 1; i <= 120; i++) {
      const villaNumber = String(i).padStart(3, '0');
      const street = Math.floor((i - 1) / 10) + 1;
      
      let type, plotSize, builtUpArea, price, status, availability, facing, images;
      
      facing = (i % 2 === 0) ? "East Facing" : "West Facing";
      if (i % 8 === 0) facing = "North Corner Facing";

      if (i <= 20) {
        type = "2BHK Residential Villa";
        plotSize = "1,500 Sq. Ft.";
        builtUpArea = "1,200 Sq. Ft.";
        price = "₹ 1.25 Cr";
        status = (i % 5 === 0) ? "sold" : "occupied";
        images = [imageMap["2bhk"]];
      } else if (i <= 50) {
        type = "3BHK Executive Villa";
        plotSize = "2,250 Sq. Ft.";
        builtUpArea = "1,900 Sq. Ft.";
        price = "₹ 1.85 Cr";
        if (i === 21 || i === 26 || i === 31 || i === 36 || i === 41 || i === 46) status = "available";
        else if (i === 25 || i === 30 || i === 35 || i === 40) status = "sold";
        else status = "occupied";
        images = [imageMap["3bhk-exec"]];
      } else if (i <= 80) {
        type = "3BHK Premium Villa";
        plotSize = "2,400 Sq. Ft.";
        builtUpArea = "2,100 Sq. Ft.";
        price = "₹ 1.78 Cr";
        if (i === 55 || i === 60 || i === 65 || i === 70 || i === 75) status = "sold";
        else if ([51, 53, 57, 59, 61, 63, 67, 69, 71, 73].includes(i)) status = "available";
        else status = "construction";
        images = [imageMap["3bhk-prem"]];
      } else if (i <= 100) {
        type = "4BHK Signature Villa";
        plotSize = "3,500 Sq. Ft.";
        builtUpArea = "3,100 Sq. Ft.";
        price = "₹ 2.95 Cr";
        if (i === 85 || i === 95) status = "sold";
        else if ([81, 83, 87, 89, 91, 93, 97, 99].includes(i)) status = "available";
        else status = "occupied";
        images = [imageMap["4bhk-sig"]];
      } else {
        type = "4BHK Grand Estate";
        plotSize = "4,100 Sq. Ft.";
        builtUpArea = "3,800 Sq. Ft.";
        price = "₹ 3.40 Cr";
        status = "construction";
        images = [imageMap["4bhk-grand"]];
      }

      if (status === "occupied") availability = "Families Residing";
      else if (status === "available") {
        availability = (type.includes("Premium") || type.includes("Grand")) ? "Booking Open" : "Ready to Move";
      } else if (status === "construction") availability = "Under Construction";
      else if (status === "sold") availability = "Sold Out";

      villaValues.push([
        villaNumber, street, type, status, plotSize, builtUpArea, price, facing, availability, JSON.stringify(images)
      ]);
    }

    if (villaValues.length > 0) {
      await pool.query(
        'INSERT INTO villas (villa_number, street_number, villa_type, status, plot_size, built_up_area, price, facing, availability, image_url) VALUES ?',
        [villaValues]
      );
    }
    console.log(`Number of villas inserted: ${villaValues.length}`);

    // 3. Seed Mock Bookings
    const mockBookings = [
      [
        'Rahul Sharma', 'rahul@gmail.com', '+91 98765 43210',
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        21, 'I would like to check out the layout and finishing quality of Villa 021.', 'Pending'
      ],
      [
        'Priya Patel', 'priya.patel@hotmail.com', '+91 98989 89898',
        new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        81, 'Interested in booking the 4BHK Signature Villa. Can we schedule a morning tour?', 'Pending'
      ],
      [
        'Amit Verma', 'amit.verma@yahoo.com', '+91 91234 56789',
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        51, 'Would like to review the under-construction progress of street 6.', 'Confirmed'
      ]
    ];
    await pool.query(
      'INSERT INTO bookings (customer_name, email, phone, booking_date, villa_id, message, status) VALUES ?',
      [mockBookings]
    );
    console.log('Mock site tour bookings seeded.');

    // 4. Seed Mock Contact Messages
    const mockContacts = [
      [
        'Vikram Singh', 'vikram.singh@outlook.com', '+91 99999 88888',
        'Inquiry regarding resale values', 'Do you have any resale villas available in Phase 1? I am looking for ready-to-move options.', 'New'
      ],
      [
        'Sneha Reddy', 'sneha.reddy@gmail.com', '+91 98888 77777',
        'Customizations for Phase 2', 'Hi, is it possible to change the flooring to Italian marble for the 3BHK Premium configurations in the 9th street?', 'New'
      ]
    ];
    await pool.query(
      'INSERT INTO contacts (name, email, phone, subject, message, status) VALUES ?',
      [mockContacts]
    );
    console.log('Mock contact inquiries seeded.');

    console.log('MySQL Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error(`MySQL Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

runSeeder();
