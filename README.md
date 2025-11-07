# Student Achievement Tracker

A comprehensive platform for students to track, showcase, and grow their extracurricular achievements.

## Features

- User Authentication (JWT-based)
- Student Profile Management
- Achievement Tracking and Verification
- Digital Portfolio
- Skill Development Progress
- Admin Dashboard for Achievement Verification
- Real-time Notifications

## Technologies Used

- Frontend:
  - HTML5
  - CSS3
  - JavaScript
  - Bootstrap 5
- Backend:
  - Node.js
  - Express.js
  - SQLite3
  - JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- NPM (v6 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd ExtraciricullarActivitesPlatform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   JWT_SECRET=your-secret-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## Project Structure

```
src/
├── frontend/
│   ├── styles/
│   │   └── main.css
│   ├── js/
│   │   └── main.js
│   ├── index.html
│   ├── login.html
│   └── register.html
└── backend/
    ├── config/
    │   └── database.js
    ├── middleware/
    │   └── auth.js
    ├── routes/
    │   ├── auth.js
    │   ├── achievements.js
    │   ├── portfolio.js
    │   └── admin.js
    └── server.js
```

## API Documentation

### Authentication

#### Register User
- **POST** `/api/auth/register`
- Body:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```

#### Login User
- **POST** `/api/auth/login`
- Body:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

### Achievements

#### Get User Achievements
- **GET** `/api/achievements`
- Headers: `Authorization: Bearer [token]`

#### Create Achievement
- **POST** `/api/achievements`
- Headers: `Authorization: Bearer [token]`
- Body:
  ```json
  {
    "title": "string",
    "description": "string",
    "category": "string"
  }
  ```

#### Update Achievement
- **PUT** `/api/achievements/:id`
- Headers: `Authorization: Bearer [token]`
- Body:
  ```json
  {
    "title": "string",
    "description": "string",
    "category": "string"
  }
  ```

#### Delete Achievement
- **DELETE** `/api/achievements/:id`
- Headers: `Authorization: Bearer [token]`

### Portfolio

#### Get User Portfolio
- **GET** `/api/portfolio/:userId`

#### Update Skills
- **POST** `/api/portfolio/skills`
- Headers: `Authorization: Bearer [token]`
- Body:
  ```json
  {
    "skills": [
      {
        "name": "string",
        "level": number
      }
    ]
  }
  ```

### Admin Routes

#### Get Pending Achievements
- **GET** `/api/admin/pending-achievements`
- Headers: `Authorization: Bearer [token]`

#### Get All Users
- **GET** `/api/admin/users`
- Headers: `Authorization: Bearer [token]`

#### Update User Role
- **PUT** `/api/admin/users/:id/role`
- Headers: `Authorization: Bearer [token]`
- Body:
  ```json
  {
    "role": "student|admin"
  }
  ```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Protected routes using middleware
- Role-based access control

## Admin account (initial setup)

If you need an administrator account on a fresh deploy, you can provide two environment variables so the server will create a seeded admin user on startup:

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongSecurePassword123
```

Set these in your Render (or hosting) environment variables before the first deployment. The server will create the admin user with the `admin` role during database initialization. After the admin account is created you can remove these environment variables if you prefer.

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Create a pull request

## License

ISC License