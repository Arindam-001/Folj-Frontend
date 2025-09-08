# Care App - Full Stack React Application

A complete full-stack application built with React, Node.js, Express, and MySQL for church community management and task assignment.

## Features

- **User Authentication**: Role-based login system (User/Admin)
- **Task Management**: Admin can assign tasks to users with different types
- **Connection Requests**: Users can submit connection forms
- **Real-time Notifications**: Admin gets notified when users complete tasks
- **User Dashboard**: View assigned tasks, submit connection forms
- **Admin Dashboard**: Manage users, assign tasks, view connection requests

## Tech Stack

- **Frontend**: React, Axios, React Router
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT tokens
- **Styling**: Custom CSS

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Setup Instructions

### 1. Database Setup
1. Install MySQL and start the server
2. Run the SQL script in `database/schema.sql` to create the database and tables
3. Update the database credentials in `backend/.env`

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Default Admin Credentials

- **Email**: `admin@care.com`
- **Password**: `admin123`

## API Endpoints

### Authentication
- POST `/api/users/register` - Register new user
- POST `/api/users/login` - Login user/admin

### Tasks
- GET `/api/tasks` - Get user tasks
- PUT `/api/tasks/:id` - Update task
- POST `/api/admin/assign-task` - Admin assign task

### Connection Requests
- POST `/api/connections/submit` - Submit connection request
- PUT `/api/connections/update/:id` - Update connection request
- GET `/api/connections/my-submissions` - Get user submissions

### Admin Routes
- GET `/api/admin/users` - Get all users
- GET `/api/admin/connection-requests` - Get connection requests
- GET `/api/admin/notifications` - Get admin notifications

## Task Types

- Prayer visit
- Prayer call
- Hospital visit
- To connect in general
- To connect to a connect group

## Environment Variables

Create a `.env` file in the backend directory:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=care_db
JWT_SECRET=your_jwt_secret_key
PORT=5001
```

## Running the Application

1. Start MySQL server
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `cd frontend && npm start`
4. Open http://localhost:3000 in your browser

## Project Structure

```
care/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   └── App.js
├── backend/           # Node.js backend
│   ├── routes/
│   ├── config/
│   └── server.js
└── database/          # SQL schema
    └── schema.sql
```