# MERN Stack Authentication System with MySQL Database & Dashboard

**CampusPe Full Stack Development Assignment**

- **Mentor:** Jacob Dennis
- **Institution:** CampusPe
- **Tech Stack:** MySQL, Express.js, React.js, Node.js

---

## Project Description

This is a full-stack MERN application using MySQL database. It includes user authentication (register, login, forgot password, reset password) and a dashboard where users can manage their own items using full CRUD operations.

## Tech Stack

**Frontend:**
- React.js
- React Router DOM
- Axios
- Tailwind CSS
- React Context API

**Backend:**
- Node.js
- Express.js
- MySQL (mysql2)
- bcryptjs
- jsonwebtoken (JWT)
- Nodemailer

## MySQL Database Setup

1. Install MySQL Server from https://dev.mysql.com/downloads/
2. Open MySQL Workbench or MySQL Command Line
3. Run the SQL script:
```
mysql -u root -p < database.sql
```
Or open `database.sql` file and run it in MySQL Workbench.

4. Verify tables created:
```sql
USE mern_auth_db;
SHOW TABLES;
```

## Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mern_auth_db
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

Start the backend server:
```bash
npm run dev
```

Backend runs at: http://localhost:5000

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

## How to Run Both Projects

Open two terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Then open http://localhost:5173 in browser.

## API Endpoints

### Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| POST | /api/auth/forgot-password | Send password reset email |
| POST | /api/auth/reset-password | Reset password with token |
| GET | /api/auth/me | Get current logged-in user |

### Item Routes (All Protected - JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/items | Get all items for user |
| GET | /api/items/:id | Get single item |
| POST | /api/items | Create new item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |
| GET | /api/items/stats | Get dashboard statistics |

## Features

- User Registration with validation
- User Login with JWT authentication
- Forgot Password (email reset link)
- Reset Password with token validation
- Dashboard with statistics cards (Total, Active, Pending, Completed)
- Add new items with title, description, status
- Edit existing items
- Delete items with confirmation dialog
- Status update directly from item list
- Protected routes (redirect to login if not authenticated)
- Auto logout on token expiry
- Responsive design for mobile and desktop

## Project Structure

```
Campuspe_intership_project/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── itemController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── itemRoutes.js
│   ├── .env.example
│   ├── .gitignore
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   ├── authApi.js
│   │   │   └── itemApi.js
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── PublicRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
├── database.sql
├── screenshots/
└── README.md
```

## Screenshots

See `screenshots/` folder for application screenshots.

## Security Notes

- Passwords are hashed using bcryptjs before storing
- JWT tokens expire in 7 days
- All item routes are protected with JWT middleware
- SQL injection prevented using parameterized queries
- `.env` file is not committed to GitHub
