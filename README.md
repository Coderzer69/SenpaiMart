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
<img width="100%" height="742" alt="Home" src="https://github.com/user-attachments/assets/98c1edb2-4d65-4b83-b55a-6f226739af18" />



### Product Page
<img width="1536" height="741" alt="image" src="https://github.com/user-attachments/assets/6a5b24a8-5ef5-410a-a7e3-df5a403f1356" />



### Admin Dashboard

<img width="1536" height="742" alt="image" src="https://github.com/user-attachments/assets/f9e9a44c-7243-45dc-8f18-64e31bf36391" />


---

## Future Improvements

- Wishlist functionality
- AI-based recommendations
- Inventory management
- Advanced analytics
- Payment enhancements

