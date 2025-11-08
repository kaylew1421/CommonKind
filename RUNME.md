# CommonKind Hackathon — Quick Start

## Install
```
npm install
```

## Run
```
npm run dev
# open http://localhost:3000
```

## Build
```
npm run build
npm run preview
```

If deploying the API to Cloud Run, set `.env.production`:
```
VITE_API_BASE_URL=https://<your-cloud-run-api-url>
VITE_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```
The app falls back to local MOCK_HUBS if API is down.
