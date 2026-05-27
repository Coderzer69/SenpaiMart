# SenpaiMart

Modern full-stack E-commerce platform built with React, TypeScript, Express.js, and PostgreSQL.

## Features

- Authentication & authorization with Clerk
- Product, cart, and order management
- Admin dashboard
- Real-time customer support chat
- Video calling integration
- Image uploads & optimization
- REST API architecture
- Error tracking & monitoring
- Responsive modern UI

---

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- DaisyUI
- TanStack Query

### Backend
- Node.js
- Express.js
- TypeScript

### Database
- PostgreSQL
- Drizzle ORM
- Neon

### Services & Integrations
- Clerk
- Stream Chat & Video
- ImageKit
- Sentry

---

## Project Structure

```bash
SenpaiMart/
├── client/
├── server/
├── drizzle/
├── shared/
└── README.md
```

---

## Environment Variables

Create a `.env` file in the server directory.

```env
DATABASE_URL=

CLERK_SECRET_KEY=
VITE_CLERK_PUBLISHABLE_KEY=

STREAM_API_KEY=
STREAM_API_SECRET=

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

SENTRY_DSN=
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/senpaimart.git
cd senpaimart
```

Install dependencies:

```bash
npm install
```

Run database migrations:

```bash
npm run db:push
```

Start the development server:

```bash
npm run dev
```

---

## Screenshots

### Home Page
<img width="100%" alt="Home" src="YOUR_IMAGE_LINK_HERE" />

### Product Page
<img width="100%" alt="Product" src="YOUR_IMAGE_LINK_HERE" />

### Admin Dashboard
<img width="100%" alt="Dashboard" src="YOUR_IMAGE_LINK_HERE" />

---

## Future Improvements

- Wishlist functionality
- AI-based recommendations
- Inventory management
- Advanced analytics
- Payment enhancements

---

## License

MIT License
