# Webhook Playground

A full stack Dockerized application for testing and simulating webhooks with custom payloads, headers, and endpoint management.

## Features
- Test webhooks with custom JSON payloads and HTTP headers
- Save, manage, and replay multiple webhook endpoints
- Real-time response display and event history
- Copy-to-clipboard for URLs and payloads
- Modern, user-friendly React UI
- Easy setup and deployment with Docker Compose

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed

### Quick Start
1. Clone the repository:
   ```sh
   git clone https://github.com/Srinivas-2410/webhook-playground.git
   cd webhook-playground
   ```
2. Build and run with Docker Compose:
   ```sh
   docker-compose up --build
   ```
3. Open your browser:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

## Project Structure
```
backend/    # Node.js/Express API for webhook handling
frontend/   # React app for UI
```

## Development
- For live code updates, use Docker volumes or run frontend/backend locally with `npm start`.
- Backend: `cd backend && npm start`
- Frontend: `cd frontend && npm start`

## License
MIT
