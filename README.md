# GeoGuessr Clone

Geographic Guessing Game

## 1. Prerequisites

- Node.js 20+
- Docker (optional)

## 2. Install dependencies

```bash
npm install
```

## 3. Configuration

```bash
cp ./apps/api/.env.example ./apps/api/.env
cp ./apps/web/.env.example ./apps/web/.env
```

## 4. Running the Project

- Up a database (optional)

```bash
docker compose up -d
```

- Run the database schema setup

```bash
npm run db:push
npm run db:seed
```

- Run the app

```bash
npm run start
```

Open `http://localhost:3000` in your browser

## Structure

```text
.
├─ apps
│  ├─ web (Nuxt frontend)
│  └─ api (NestJS backend)
└─ packages
   └─ shared (Shared types, utilities and components)
```
