# Bixi-Dhiig

Bixi-Dhiig is a blood donation and blood request platform. The goal is to connect people who urgently need blood with registered donors who have a matching blood type, while also giving hospitals a faster way to request blood when they need it.

The project is currently focused on the authentication service: email/password auth, OTP email verification, refresh token rotation, and Google social login. After authentication is stable, the next work will be frontend auth for web and mobile, then the full blood request flow.

## Project Status

This project is under active development.

Currently in progress:

- Email/password registration and login
- Email verification with OTP
- Access token and refresh token authentication
- Refresh token rotation using Redis
- Google OAuth/social login

Coming next:

- Web authentication UI
- Mobile authentication UI
- Blood request flow for users and hospitals
- Admin approval flow for user requests
- Donor notification system
- Docker containerization

## Product Vision

Bixi-Dhiig will support three main groups:

- Users: register, manage their profile and blood type, request blood, and receive matching donation alerts.
- Hospitals: request blood directly without admin approval.
- Admins: review and approve blood requests submitted by regular users.

When a blood request is created, the system will find registered users with the same blood type and notify them. Notification delivery is still being decided, but the options are:

- In-app notifications
- Email notifications
- Push notifications on mobile
- A combination of the above

## Planned Blood Request Flow

```text
User creates blood request
        |
        v
Admin reviews request
        |
        v
Request approved
        |
        v
Matching donors are notified
```

```text
Hospital creates blood request
        |
        v
Request is published directly
        |
        v
Matching donors are notified
```

Hospitals will not need admin approval because their requests are treated as trusted and urgent.

## Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Redis
- JWT authentication with `jose`
- Password hashing with `bcrypt`
- Zod validation
- Google APIs for email/OAuth support
- Winston logger
- Helmet, CORS, and cookie-parser

### Web Frontend

Planned web stack:

- Next.js
- React
- React Hook Form
- Redux Toolkit
- Axios
- shadcn/ui if needed

### Mobile Frontend

Planned mobile stack:

- Flutter
- GetX
- Notification packages as needed

### Infrastructure

- Docker for containerization, coming soon
- Docker Compose, planned for local development

## Workspace Structure

```text
.
|-- backend/
|   |-- prisma/
|   |   |-- schema.prisma
|   |   `-- migrations/
|   `-- src/
|       |-- auth/
|       |-- config/
|       |-- lib/
|       |-- middlewares/
|       `-- services/
|-- frontend/
|   |-- mobile/
|   `-- web/
`-- README.md
```

## Backend Features

- User registration
- User login
- Email verification with OTP
- Resend OTP code
- JWT access token creation
- Refresh token cookie
- Refresh token rotation with Redis
- Protected route middleware
- Health check endpoint
- Prisma database schema
- Email templates for OTP, welcome email, and password reset

## Current API Endpoints

Base URL:

```text
/api/v1
```

Health:

```text
GET /health
```

Authentication:

```text
POST /auth/register
POST /auth/login
POST /auth/resend-code
POST /auth/verify
POST /auth/refresh-token
```

## Database Models

Current Prisma models:

- `User`
- `OauthAccount`

Current auth providers:

- `PASSWORD`
- `GOOGLE`
- `GITHUB`
- `APPLE`

The project currently focuses on password and Google authentication. Other providers can be added later.

## Environment Variables

Create a `.env` file inside `backend/`.

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/bixi_dhiig"
CORS_ORIGIN="http://localhost:3000"

JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="your-google-redirect-uri"
GOOGLE_REFRESH_TOKEN="your-google-refresh-token"

SENDER_EMAIL="your-sender-email"
EMAIL_FROM="Bixi-Dhiig <your-sender-email>"

LOG_LEVEL="info"
NODE_ENV="development"
```

Redis is required for refresh token rotation and OTP-related temporary data.

## Getting Started

Install backend dependencies:

```bash
cd backend
npm install
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the backend development server:

```bash
npm run dev
```

The API will run on the port configured in `PORT`.

## Development Roadmap

### Phase 1: Authentication

- Complete password authentication
- Complete email verification
- Complete refresh token rotation
- Implement Google social login
- Add password reset/change password flow

### Phase 2: Web App

- Build Next.js authentication pages
- Add form validation with React Hook Form
- Manage auth state with Redux Toolkit
- Connect API requests using Axios
- Add protected routes
- Add UI components with shadcn/ui if needed

### Phase 3: Mobile App

- Build Flutter authentication screens
- Manage state with GetX
- Connect mobile app to backend auth APIs
- Add secure token handling
- Add push/in-app notification support

### Phase 4: Blood Request System

- Add blood type to user profiles
- Allow users to request blood
- Allow hospitals to request blood directly
- Add admin approval for user-created requests
- Match requests with donors by blood type
- Notify matching donors
- Track request status

### Phase 5: Deployment

- Add Docker support
- Add Docker Compose for backend, PostgreSQL, and Redis
- Prepare production environment configuration
- Add deployment documentation

## Long-Term Ideas

- Donor availability status
- Request urgency levels
- Hospital dashboards
- Admin analytics
- Location-based donor matching
- Push notifications
- Email notification templates
- Audit logs
- Role-based access control
- Multi-language support

## Mission

Bixi-Dhiig is built to make urgent blood requests easier to send, easier to verify, and easier for matching donors to respond to. The long-term goal is a reliable platform that helps users, hospitals, and admins coordinate blood donation faster and more safely.
