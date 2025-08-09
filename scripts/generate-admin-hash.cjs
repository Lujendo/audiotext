/**
 * Generate password hash for admin user
 * This script generates a password hash compatible with our PasswordService
 */

const crypto = require('crypto');

class PasswordService {
  static SALT_LENGTH = 16;
  static ITERATIONS = 100000;
  static KEY_LENGTH = 32;

  static async hashPassword(password) {
    // Generate a random salt
    const salt = crypto.randomBytes(this.SALT_LENGTH);
    
    // Derive the hash using PBKDF2
    const hash = crypto.pbkdf2Sync(password, salt, this.ITERATIONS, this.KEY_LENGTH, 'sha256');
    
    // Combine salt and hash, then encode as base64
    const combined = Buffer.concat([salt, hash]);
    return combined.toString('base64');
  }
}

async function generateAdminHash() {
  const password = 'AdminPassword123!';
  const hash = await PasswordService.hashPassword(password);
  
  console.log('Admin User Credentials:');
  console.log('Email: admin@audiotext.com');
  console.log('Password: AdminPassword123!');
  console.log('Hash:', hash);
  console.log('\nSQL to create admin user:');
  console.log(`
INSERT INTO users (
    id, email, name, password_hash, role, avatar, email_verified, 
    created_at, updated_at, stripe_customer_id, subscription_status, 
    subscription_id, plan_type, last_login, is_active
) VALUES (
    'admin-user-001',
    'admin@audiotext.com',
    'AudioText Admin',
    '${hash}',
    'admin',
    NULL,
    1,
    datetime('now'),
    datetime('now'),
    NULL,
    'free',
    NULL,
    'enterprise',
    NULL,
    1
);`);
}

generateAdminHash().catch(console.error);
