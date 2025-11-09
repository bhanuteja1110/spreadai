# SpreadAI

A modern AI chat application built with React, Node.js, and Google Gemini API, featuring Firebase authentication and an elegant glassmorphism UI.

## Features

- 🤖 **AI Chat** - Powered by Google Gemini API
- 🔐 **Firebase Authentication** - Secure email/password authentication
- 🎨 **Modern UI** - Elegant dark theme with glassmorphism design
- ⚡ **Real-time** - Fast and responsive chat experience
- 📱 **Responsive** - Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Firebase Auth

### Backend
- Node.js
- Express.js
- Google Gemini API
- Firebase Admin SDK

## Project Structure

```
spreadai/
├── packages/
│   ├── api/          # Backend API server
│   ├── web/          # Frontend React app
│   └── worker/       # Background worker (optional)
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project set up
- Google Gemini API key
- Firebase service account key (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd spreadai
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install:all
   ```

3. **Configure environment variables**

   **Frontend** (`packages/web/.env`):
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

   **Backend** (`packages/api/.env`):
   ```env
   PORT=8080
   GEMINI_API_KEY=your_gemini_api_key
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
   ```

4. **Start the development servers**

   Terminal 1 (API):
   ```bash
   cd packages/api
   npm run dev
   ```

   Terminal 2 (Web):
   ```bash
   cd packages/web
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Setup Guides

- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Firebase Service Account Setup](./packages/api/FIREBASE_SERVICE_ACCOUNT_SETUP.md)
- [Quick Start Guide](./QUICK_START.md)

## Development

### Running Services

```bash
# Start API server
npm run dev:api

# Start Web app
npm run dev:web

# Start Worker (if needed)
npm run dev:worker
```

### Building for Production

```bash
# Build web app
cd packages/web
npm run build

# Build API (if needed)
cd packages/api
npm run build
```

## Environment Variables

### Frontend (.env)
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

### Backend (.env)
- `PORT` - Server port (default: 8080)
- `GEMINI_API_KEY` - Google Gemini API key
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON (as string)

## Security Notes

⚠️ **Important**: Never commit sensitive files to git:
- `.env` files
- Firebase service account keys (`*-firebase-adminsdk-*.json`)
- API keys

All sensitive files are already in `.gitignore`.

## Deployment

### Deploy to Production

1. Set up environment variables on your hosting platform
2. Build the frontend: `cd packages/web && npm run build`
3. Deploy the backend API
4. Configure CORS and proxy settings

### Recommended Platforms

- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Backend**: Render, Railway, or Heroku

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Private project - All rights reserved

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ by the SpreadAI team
