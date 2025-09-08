import fs from 'fs';
import path from 'path';
import pool from '../config/database.js';

async function runMigration() {
  try {
    console.log('Running Cloudinary migration...');
    
    // Read and execute the SQL migration
    const migrationSQL = fs.readFileSync(
      path.join(process.cwd(), 'migrations', 'add_cloudinary_fields.sql'), 
      'utf8'
    );
    
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.execute(statement);
        console.log('Executed:', statement.trim());
      }
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();