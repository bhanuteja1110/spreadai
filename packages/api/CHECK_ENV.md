# How to Check Your .env File

## Quick Check

Run this command to verify your Firebase configuration:

```bash
cd packages/api
npm run verify:firebase
```

## Common Issues

### Issue 1: Variable Name Wrong

Make sure you're using **exactly** this name:
```env
FIREBASE_SERVICE_ACCOUNT='...'
```

**NOT:**
- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `FIREBASE_ADMIN_KEY`
- `SERVICE_ACCOUNT`

### Issue 2: JSON Format

The JSON must be:
- **On a single line** (no line breaks)
- **Wrapped in single quotes** `'...'`
- **Valid JSON** (properly escaped)

**Correct:**
```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"spread-23ece",...}'
```

**Wrong:**
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}  # Missing quotes
FIREBASE_SERVICE_ACCOUNT='{
  "type": "service_account",
  ...
}'  # Multiple lines
```

### Issue 3: File Location

Make sure the file is:
- Located at: `packages/api/.env` (not `packages/api/.env.example`)
- Saved (not just typed)

### Issue 4: Special Characters

If your JSON has quotes or special characters, they need to be escaped:
- Use single quotes around the entire JSON: `'...'`
- Keep all `\n` characters in the private key

## How to Fix

1. **Open** `packages/api/.env`

2. **Check** if you have a line starting with:
   ```
   FIREBASE_SERVICE_ACCOUNT=
   ```

3. **If using Option 1 (JSON string):**
   - Make sure the entire JSON is on **one line**
   - Wrap it in **single quotes**: `'...'`
   - Example:
     ```env
     FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"spread-23ece","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@spread-23ece.iam.gserviceaccount.com",...}'
     ```

4. **If using Option 2 (individual variables):**
   - Make sure you have all these:
     ```env
     FIREBASE_PROJECT_ID=spread-23ece
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
     FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@spread-23ece.iam.gserviceaccount.com
     FIREBASE_PRIVATE_KEY_ID=abc123...
     FIREBASE_CLIENT_ID=123456789
     FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
     ```

5. **Save** the file

6. **Restart** the API server:
   ```bash
   cd packages/api
   npm run dev
   ```

7. **Verify** again:
   ```bash
   npm run verify:firebase
   ```

## Expected Output

If configured correctly, you should see:
```
✅ FIREBASE_SERVICE_ACCOUNT is set
✅ JSON is valid
   Project ID: spread-23ece
   Client Email: firebase-adminsdk-xxxxx@spread-23ece.iam.gserviceaccount.com
✅ Firebase Admin initialized successfully!
```

## Still Not Working?

1. Check the file is saved as `packages/api/.env` (not `.env.txt` or `.env.example`)
2. Make sure there are no extra spaces or characters
3. Try copying the JSON from your downloaded service account file
4. Use a JSON validator to check your JSON is valid
5. Restart your terminal/IDE after saving the file

