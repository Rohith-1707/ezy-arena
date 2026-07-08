# Ezy Arena – AI-Powered Smart Stadium Platform

> **Tagline:** One App. One Pass. One Arena.

Ezy Arena is an ultra-premium, full-stack, responsive Progressive Web App (PWA) designed to transform the live stadium experience during massive sporting events like the FIFA World Cup 2026. 

The platform supports **Fans**, **Organizers**, **Security Staff**, **Volunteers**, **Food Vendors**, **Medical Teams**, and **Administrators** through a cohesive, dynamic, and glassmorphic real-time interface.

---

## Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Socket.IO Client.
- **Backend**: Node.js, Express.js, TypeScript, REST APIs, Socket.IO.
- **Database**: PostgreSQL (Prisma ORM), Redis.
- **AI**: Gemini API / Gemini AI model integrations for natural language navigation, smart entry suggestion, theme generation, voice synthesis, and translations.
- **Maps**: Dynamic vector indoor layouts and Google Maps Integration.
- **Containerization**: Docker & Docker Compose.

---

## Directory Structure

```
ezy-arena/
├── backend/               # Node.js + Express API server
│   ├── prisma/            # Prisma Schema & migrations
│   └── src/               # Server codebase (TypeScript)
├── frontend/              # Next.js client application
│   ├── public/            # Static assets
│   └── src/               # React + Tailwind codebase
├── docker-compose.yml     # PostgreSQL + Redis + services container config
├── .env.example           # Reference environmental setup
└── README.md              # Documentation
```

---

## Key Features

1. **AI Personalized Theme System**: Interactive dashboard background overlays supporting cinematic sports gallery, national colors, animated particle canvases, loops of custom mp4 player clips, and custom AI prompt backgrounds.
2. **Permanent Fan ID & Encrypted QR Pass**: Fan profile maps to a permanent 7-char ID. Each booked ticket issues a fresh encrypted 5-min gate capacity slot token.
3. **Capacity Slot Reservation**: Automated gate allocation checking that closes slots once capacity limit (e.g. 30 fans per gate per 5-min block) is hit, backed by dynamic route redirects.
4. **Smart Offline Ticket Integration**: Input ticket barcode/digits -> OTP verification -> issue virtual ID and active match profile.
5. **Interactive Stadium Map & Indoor Navigation**: Zoomable, pannable vector layouts tracking restrooms, exit paths, medical centers, charging stations, and seat pathfinding routes.
6. **Smart Seat Food Delivery & Ordering**: Order from seat, track prep queue and active deliveries.
7. **AI Virtual Voice Assistant**: Speech-to-text / Text-to-speech queries solving gate paths, ordering snacks, and translation of official announcer alerts into 100+ languages.
8. **Operations Dashboard Tab Views**: Dedicated, customized monitoring blocks for entry capacities, queue lengths, active security scanning lanes, medical dispatch coordinates, transportation delays, and environmental footprint sustainability indexes.

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker (Optional)

### Installation & Run

1. **Clone and Enter the directory**:
   ```bash
   cd ezy-arena
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Or copy on Windows: copy .env.example .env
   ```

3. **Install Dependencies and Start (Standard Local Mode)**:
   
   To run backend and frontend concurrently:
   
   **Backend**:
   ```bash
   cd backend
   npm install
   npm run prisma:generate  # Generates schema clients
   npm run dev
   ```

   **Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Or Run via Docker Compose**:
   ```bash
   docker-compose up --build
   ```

---

## License
MIT License. Created as a production-grade showcase application.
