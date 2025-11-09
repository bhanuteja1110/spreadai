# Firebase Service Account Setup

## Where to Place the Service Account Key

Place the Firebase service account key in: **`packages/api/.env`**

## Step-by-Step Instructions

### Step 1: Get Your Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **spread-23ece**
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to the **Service accounts** tab
5. Click **"Generate new private key"**
6. Click **"Generate key"** in the popup
7. A JSON file will download (e.g., `spread-23ece-firebase-adminsdk-xxxxx.json`)

### Step 2: Add to `.env` File

Create or edit: **`packages/api/.env`**

You have **TWO options**:

---

## Option 1: JSON String (Recommended - Easiest)

Copy the **entire contents** of the downloaded JSON file and paste it as a single-line string:

```env
# packages/api/.env

PORT=8080
GEMINI_API_KEY=your_gemini_key_here

# Firebase Service Account (entire JSON as a single line)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"spread-23ece","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@spread-23ece.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/..."}'
```

**Important Notes:**
- The entire JSON must be on **one line**
- Use **single quotes** around the JSON string
- Keep all the `\n` characters in the private_key (they're needed)

---

## Option 2: Individual Environment Variables

If you prefer to split it into separate variables:

```env
# packages/api/.env

PORT=8080
GEMINI_API_KEY=your_gemini_key_here

# Firebase Service Account (individual variables)
FIREBASE_PROJECT_ID=spread-23ece
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@spread-23ece.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

**Important Notes:**
- Keep the private key in **double quotes** with `\n` characters
- All values should match exactly what's in your downloaded JSON file

---

## Quick Example

Here's what your `packages/api/.env` file should look like:

```env
# Server
PORT=8080

# Gemini API
GEMINI_API_KEY=your_actual_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash-latest

# Firebase Service Account (Option 1 - Recommended)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"spread-23ece","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@spread-23ece.iam.gserviceaccount.com","client_id":"123","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/..."}'
```

---

## How to Convert JSON File to Single Line

If you have the JSON file and need to convert it to a single line:

### On Windows (PowerShell):
```powershell
$json = Get-Content "path\to\your\service-account.json" -Raw
$json.Replace("`"", "\`"") | Out-File "single-line.txt"
```

### On Mac/Linux:
```bash
cat service-account.json | tr -d '\n' | sed 's/"/\\"/g'
```

### Or use an online tool:
- Copy the JSON file content
- Use a JSON minifier (like jsonformatter.org)
- Copy the minified version
- Wrap it in single quotes: `FIREBASE_SERVICE_ACCOUNT='...'`

---

## Verify It's Working

After adding the service account to `.env`:

1. Restart your API server:
   ```bash
   cd packages/api
   npm run dev
   ```

2. Look for this message in the console:
   ```
   Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT
   ```

3. If you see:
   ```
   Firebase Admin not initialized - allowing request (auth disabled)
   ```
   Then the service account wasn't loaded correctly. Check:
   - JSON is valid
   - JSON is on one line (for Option 1)
   - All quotes are properly escaped
   - File is saved as `packages/api/.env` (not `.env.example`)

---

## Security Reminders

✅ **DO:**
- Keep `.env` file in `.gitignore` (already done)
- Use environment variables in production
- Store securely in cloud secret managers (AWS Secrets Manager, etc.)

❌ **DON'T:**
- Commit `.env` to git
- Share service account keys publicly
- Store keys in code or version control

---

## File Location Summary

```
spreadai/
├── packages/
│   └── api/
│       └── .env          ← PUT YOUR SERVICE ACCOUNT HERE
│       └── .env.example  ← Example file (safe to commit)
│       └── src/
│           └── middlewares/
│               └── auth.js  ← Reads from .env
```

