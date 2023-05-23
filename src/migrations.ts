import dotenv from 'dotenv';
import { exit } from 'process';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate(): Promise<void> {
    try {
      console.log('Connected to the database sucessfully.');
  
      const migrationCommand = process.argv[2];
      if (migrationCommand === 'up') {
        await up();
        console.log('Migration up completed successfully.');
      } else if (migrationCommand === 'down') {
        await down();
        console.log('Migration down completed successfully.');
      } else {
        console.error('Invalid migration command. Please use "up" or "down".');
      }
    } catch (error) {
      console.error('Error performing migration:', error);
    } finally {
      exit();
    }
  }
  
  async function up(): Promise<void> {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          languages VARCHAR(255)
        )
      `);
      console.log('Table "users" created.');
    } catch (error) {
      console.error('Error creating table:', error);
    }
  }
  
  async function down(): Promise<void> {
    try {
      await pool.query('DROP TABLE IF EXISTS users');
      console.log('Table "users" dropped.');
    } catch (error) {
      console.error('Error dropping table:', error);
    }
  }
  
migrate();