# Dynamic B2B Marketplace with Predictive Recommendation Engines

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

</div>

A production-style, full-stack B2B marketplace platform for enterprise commerce, built with TypeScript, Node.js, Express.js, MongoDB, React, Vite, and Tailwind CSS. It combines secure buyer-vendor workflows, analytics dashboards, product commerce, and predictive recommendation logic in a single SaaS-ready application.

## Overview

This project is designed to model a modern B2B marketplace where:

- buyers discover products and complete procurement workflows
- vendors onboard and publish catalog offerings
- admins monitor activity and operational KPIs
- recommendation logic surfaces relevant products based on intent and demand
- the UI delivers a polished enterprise commerce experience

## Why this project

The platform addresses core enterprise commerce needs:

- procurement and supplier discovery
- multi-role access control
- product and order management
- secure authentication and session handling
- recommendation-driven discovery
- deployment-ready structure for modern hosting environments

## Tech Stack

### Frontend
- React 19
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT
- bcryptjs
- cookie-parser
- Helmet
- CORS
- express-rate-limit
- morgan
- OpenAI SDK
- zod

### Infrastructure and Deployment
- Docker
- Docker Compose
- Nginx
- MongoMemoryServer for local fallback
- environment-based configuration

## Architecture

```text
Client Browser
    |
    v
React Frontend
    |
    | HTTP + Cookies
    v
Express.js API
    |
    +--> Authentication middleware
    +--> Route handlers
    +--> Marketplace services
    +--> MongoDB models
    +--> Recommendation engine
```

## Features

### Buyer experience
- browse the marketplace catalog
- search and filter products
- add items to cart
- proceed through checkout
- track order history
- view personalized recommendations

### Vendor experience
- onboard a company profile
- create business identity and vendor metadata
- publish and manage products
- access dashboard visibility for business performance

### Admin experience
- monitor platform KPIs
- view marketplace growth and operational health
- track core business activity

### Recommendation system
- deterministic product ranking based on buyer intent and product relevance
- inventory and pricing-aware scoring
- demand and review signals
- optional AI enhancement through OpenAI integration

### Security
- JWT access and refresh tokens
- HttpOnly cookie authentication
- password hashing with bcryptjs
- CORS allowlisting
- rate limiting
- Helmet security headers

## Roles

### Buyer
- browses the catalog
- manages cart and orders
- interacts with recommendations

### Vendor
- manages organization profile
- publishes and updates inventory
- participates in marketplace supply flow

### Admin
- monitors operational metrics and marketplace activity
- oversees platform-level functions

## Demo credentials

The app automatically seeds demo users when missing.

- Admin: admin@marketplace.com / Password123!
- Buyer: buyer@marketplace.com / Password123!
- Vendor: vendor@marketplace.com / Password123!

## Repository structure

```text
Dynamic B2B Marketplace with Predictive Recommendation Engines/
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   ├── env.ts
│   │   │   └── seed.ts
│   │   ├── controllers/
│   │   │   └── authController.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── Cart.ts
│   │   │   ├── Order.ts
│   │   │   ├── Organization.ts
│   │   │   ├── Product.ts
│   │   │   ├── Recommendation.ts
│   │   │   ├── RefreshToken.ts
│   │   │   ├── Review.ts
│   │   │   └── User.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── index.ts
│   │   │   └── marketplace.routes.ts
│   │   ├── services/
│   │   │   └── recommendationService.ts
│   │   ├── types/
│   │   ├── utils/
│   │   │   ├── AppError.ts
│   │   │   ├── cookie.ts
│   │   │   └── jwt.ts
│   │   └── ...
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── types/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docker-compose.yml
├── .env.production.example
├── README.md
├── LICENSE
└── package-lock.json
```

## Local development

### Prerequisites
- Node.js 18+
- npm
- MongoDB, or use the in-memory fallback

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

### 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## Production build

### Backend

```bash
cd backend
npm install
npm run build
npm run start
```

### Frontend

```bash
cd frontend
npm install
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

Preview URL:

```text
http://localhost:4173
```

## Docker deployment

From the project root:

```bash
docker compose up --build
```

This starts:

- MongoDB on port 27017
- backend API on port 5000
- frontend on port 80

## Environment variables

### Backend

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/b2b_marketplace
JWT_ACCESS_SECRET=change_me_access_secret
JWT_REFRESH_SECRET=change_me_refresh_secret
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
FRONTEND_URL=http://localhost:4173
```

### Production template

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://mongodb:27017/b2b_marketplace
JWT_ACCESS_SECRET=replace_with_strong_access_secret
JWT_REFRESH_SECRET=replace_with_strong_refresh_secret
CORS_ORIGINS=http://localhost:80,http://frontend
FRONTEND_URL=http://localhost
VITE_API_URL=/api
```

## API routes

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
GET  /api/auth/me
POST /api/auth/vendor/onboard
```

### Marketplace

```text
GET    /api/marketplace/products
GET    /api/marketplace/products/:id
POST   /api/marketplace/products
PUT    /api/marketplace/products/:id
DELETE /api/marketplace/products/:id
GET    /api/marketplace/cart
POST   /api/marketplace/cart
DELETE /api/marketplace/cart/:id
POST   /api/marketplace/checkout
GET    /api/marketplace/orders
GET    /api/marketplace/orders/:id
POST   /api/marketplace/reviews
GET    /api/marketplace/recommendations
```

## Security considerations

- JWT tokens are signed and validated server-side
- access tokens and refresh tokens are stored in HttpOnly cookies
- passwords are hashed with bcryptjs
- CORS is restricted to known origins
- request rate limiting is enabled
- Helmet headers improve baseline protection
- production secrets should be managed externally, not committed to source control

## Deployment readiness

This project is structured for modern deployment workflows, including:

- local development execution
- production builds
- Dockerized deployment
- Nginx-based frontend hosting
- environment-driven configuration

Recommended production additions:

- managed MongoDB service
- TLS termination and domain configuration
- centralized secret management
- CI/CD pipeline setup
- health checks and observability monitoring

## Deployment targets

This app can be adapted to:

- Azure Container Apps
- Azure App Service
- Docker hosts
- Kubernetes clusters
- Render / Railway / Fly.io / similar PaaS platforms

## Roadmap

Planned enhancements include:

- Stripe or PayPal payment integration
- richer admin analytics and sales reporting
- vendor inventory controls and stock workflows
- approval processes for marketplace listings
- AI-driven personalization
- multi-tenant enterprise support
- notifications and audit logs

## License

This project is currently intended for prototype and educational use. For commercial deployment, add a formal license and review legal requirements before public release.

## Summary

The Dynamic B2B Marketplace with Predictive Recommendation Engines is a secure, enterprise-style commerce application that combines product discovery, vendor onboarding, transactional workflows, analytics, and recommendation intelligence in a modern full-stack stack. It is designed as a strong foundation for a real-world B2B SaaS product or internal enterprise marketplace.
