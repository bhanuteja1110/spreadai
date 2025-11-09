# Quick Start Guide

## Start Both Services

You need to run **TWO terminals** - one for the API and one for the Web app.

### Terminal 1: Start API Server

```bash
cd packages/api
npm run dev
```

You should see:
```
SpreadAI API listening on 8080
```

### Terminal 2: Start Web App

```bash
cd packages/web
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

## Troubleshooting

### Error: "connect ECONNREFUSED ::1:8080"

**Solution:** The API server is not running. Start it in Terminal 1.

### Error: "Empty response from server"

**Solution:** 
1. Make sure API server is running (check Terminal 1)
2. Check if API server shows any errors
3. Verify `GEMINI_API_KEY` is set in `packages/api/.env`

### Error: "Firebase Admin not initialized"

**Solution:** This is OK for development. The API will work with a mock user. For production, add `FIREBASE_SERVICE_ACCOUNT` to `packages/api/.env`.

## Required Environment Variables

### Frontend (`packages/web/.env`)
Already configured with your Firebase credentials in `firebase.js`

### Backend (`packages/api/.env`)
```env
PORT=8080
GEMINI_API_KEY=your_gemini_api_key_here
# Optional: FIREBASE_SERVICE_ACCOUNT='...' (for production auth)
```

## Verify Everything Works

1. **API Server** (Terminal 1):
   - Should show: `SpreadAI API listening on 8080`
   - No errors about missing dependencies

2. **Web Server** (Terminal 2):
   - Should show: `Local: http://localhost:3000/`
   - No import errors

3. **Test in Browser**:
   - Open http://localhost:3000
   - You should see the login screen
   - Create an account or sign in
   - Try sending a chat message

