# How to Start the API Server

## Quick Start

Open a **new terminal** and run:

```bash
cd packages/api
npm run dev
```

You should see:
```
🚀 SpreadAI API listening on http://localhost:8080
📡 Chat endpoint: http://localhost:8080/api/chat
```

## If You See Errors

### Error: "Cannot find module"
**Solution:** Install dependencies first:
```bash
cd packages/api
npm install
```

### Error: "GEMINI_API_KEY not set"
**Solution:** This is OK - the server will start but chat won't work. Add to `packages/api/.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Error: "Firebase Admin not configured"
**Solution:** This is OK for development - authentication is disabled. The server will still work.

### Error: "Port 8080 already in use"
**Solution:** Another process is using port 8080. Either:
1. Stop the other process
2. Or change the port in `packages/api/.env`:
   ```env
   PORT=8081
   ```

## Required Files

Make sure you have `packages/api/.env` file with at minimum:

```env
PORT=8080
GEMINI_API_KEY=your_gemini_api_key_here
```

## Verify It's Working

1. **Check the terminal** - you should see:
   ```
   🚀 SpreadAI API listening on http://localhost:8080
   ```

2. **Test the endpoint** (in another terminal):
   ```bash
   curl http://localhost:8080/api/chat
   ```
   You should get a response (even if it's an error about missing token, that means the server is running!)

3. **Check the web app** - it should now connect to the API

## Keep It Running

**Important:** Keep this terminal open and the API server running while you use the web app!

The API server must be running for the chat to work.

