/**
 * Password hashing service using Web Crypto API
 * Provides secure password hashing and verification for production use
 */

export class PasswordService {
  private static readonly SALT_LENGTH = 16;
  private static readonly ITERATIONS = 100000; // PBKDF2 iterations
  private static readonly KEY_LENGTH = 32; // 256 bits

  /**
   * Hash a password using PBKDF2 with a random salt
   */
  static async hashPassword(password: string): Promise<string> {
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    
    // Convert password to ArrayBuffer
    const passwordBuffer = new TextEncoder().encode(password);
    
    // Import the password as a key
    const key = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derive the hash using PBKDF2
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      key,
      this.KEY_LENGTH * 8 // bits
    );
    
    // Convert to Uint8Array
    const hashArray = new Uint8Array(hashBuffer);
    
    // Combine salt and hash
    const combined = new Uint8Array(salt.length + hashArray.length);
    combined.set(salt);
    combined.set(hashArray, salt.length);
    
    // Convert to base64 for storage
    return this.arrayBufferToBase64(combined);
  }

  /**
   * Verify a password against a stored hash
   */
  static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
      // Convert stored hash from base64
      const combined = this.base64ToArrayBuffer(storedHash);
      
      // Extract salt and hash
      const salt = combined.slice(0, this.SALT_LENGTH);
      const storedHashArray = combined.slice(this.SALT_LENGTH);
      
      // Convert password to ArrayBuffer
      const passwordBuffer = new TextEncoder().encode(password);
      
      // Import the password as a key
      const key = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      
      // Derive the hash using the same parameters
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: this.ITERATIONS,
          hash: 'SHA-256'
        },
        key,
        this.KEY_LENGTH * 8 // bits
      );
      
      const hashArray = new Uint8Array(hashBuffer);
      
      // Compare the hashes using constant-time comparison
      return this.constantTimeEqual(hashArray, storedHashArray);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Generate a secure random password for development/testing
   */
  static generateSecurePassword(length: number = 12): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    
    // Ensure password meets requirements
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      // Regenerate if requirements not met
      return this.generateSecurePassword(length);
    }
    
    return password;
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Constant-time comparison to prevent timing attacks
   */
  private static constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    
    return result === 0;
  }
}
