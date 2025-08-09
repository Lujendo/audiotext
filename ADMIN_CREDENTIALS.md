# AudioText Admin User Credentials

## Test Admin User

**Email:** `admin@audiotext.com`  
**Password:** `AdminPassword123!`  
**Role:** `admin`  
**Plan Type:** `enterprise`

## Admin Capabilities

The admin user has access to:

- **User Management**: View, edit, and manage all users
- **Settings Page**: Access to admin settings and configuration
- **Enterprise Features**: Full access to all AudioText features
- **Dashboard**: Admin-specific dashboard with system overview

## Login Instructions

1. Go to: https://audiotext.info-eac.workers.dev/login
2. Enter the email: `admin@audiotext.com`
3. Enter the password: `AdminPassword123!`
4. Click "Sign In"

After login, the admin will be redirected to the dashboard and can access the settings page to manage users.

## Security Notes

- This is a test/development admin user
- In production, change the password to a more secure one
- Consider implementing additional admin security measures
- The password hash is stored securely using PBKDF2 with 100,000 iterations

## Database Details

- **User ID**: `admin-user-001`
- **Created**: Auto-generated timestamp
- **Email Verified**: `true`
- **Active Status**: `true`
- **Subscription Status**: `free` (admin doesn't need paid subscription)
- **Plan Type**: `enterprise` (access to all features)
