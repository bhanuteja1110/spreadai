# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for SpreadAI.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Enable **Email/Password** authentication:
   - Click on "Sign-in method" tab
   - Click "Email/Password"
   - Enable "Email/Password" and click "Save"

## Step 3: Get Web App Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the Web icon (`</>`) to add a web app
4. Register your app (name it "SpreadAI Web")
5. Copy the Firebase configuration object

## Step 4: Configure Frontend (.env)

Create `packages/web/.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 5: Get Service Account Key (for Backend)

1. In Firebase Console, go to **Project Settings**
2. Go to **Service accounts** tab
3. Click "Generate new private key"
4. Download the JSON file (keep it secure!)

## Step 6: Configure Backend (.env)

You have two options:

### Option A: Use JSON String (Recommended for cloud deployment)

Add to `packages/api/.env`:

```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

Copy the entire contents of the service account JSON file as a single-line string.

### Option B: Use Individual Environment Variables

Add to `packages/api/.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

## Step 7: Install Dependencies

```bash
# Install frontend dependencies
cd packages/web
npm install

# Install backend dependencies
cd ../api
npm install
```

## Step 8: Test the Setup

1. Start the backend:
   ```bash
   cd packages/api
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd packages/web
   npm run dev
   ```

3. Open the app in your browser
4. Try creating an account or signing in

## Security Notes

- **Never commit** `.env` files to git
- **Never commit** service account keys
- Keep service account keys secure
- Use environment variables in production
- Enable Firebase App Check for additional security

## Troubleshooting

### "Firebase Admin not initialized"
- Check that `FIREBASE_SERVICE_ACCOUNT` is set correctly in `packages/api/.env`
- Verify the JSON is valid and properly escaped
- Check backend logs for initialization errors

### "Unauthorized: No token provided"
- Make sure you're logged in on the frontend
- Check that Firebase config is set in `packages/web/.env`
- Verify the auth state is being tracked correctly

### "Invalid token"
- Token might be expired (tokens expire after 1 hour)
- Check that Firebase Admin is properly initialized
- Verify the service account has proper permissions

## Development Mode

If Firebase Admin is not configured, the backend will allow requests with a mock user for development. This is not secure and should not be used in production.

