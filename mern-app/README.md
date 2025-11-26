# Smart Group Evaluator - MERN Stack

A comprehensive group evaluation and management system built with MongoDB, Express, React, and Node.js.

## Project Structure

```
mern-app/
├── server/          # Backend (Express + MongoDB)
├── client/          # Frontend (React + TypeScript)
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Backend Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cp .env.example .env
```

Edit `.env` and update the following variables:

```env
PORT=5000
NODE_ENV=development

# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/smart-group-evaluator

# Or MongoDB Atlas
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smart-group-evaluator

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:5173
```

### 3. Start MongoDB

If using local MongoDB:

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

If using MongoDB Atlas, create a cluster and get your connection string.

### 4. Run Backend Server

Development mode (with hot reload):

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

The server will run on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Frontend

Development mode:

```bash
npm run dev
```

The client will run on `http://localhost:5173`

Production build:

```bash
npm run build
npm run preview
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (protected)
- `PUT /update-profile` - Update profile (protected)
- `PUT /change-password` - Change password (protected)

### Groups (`/api/groups`)

- `GET /` - Get all groups
- `GET /:id` - Get group by ID
- `POST /` - Create group (admin)
- `PUT /:id` - Update group (admin)
- `DELETE /:id` - Delete group (admin)

### Members (`/api/members`)

- `GET /` - Get all members
- `GET /:id` - Get member by ID
- `POST /` - Create member (admin)
- `PUT /:id` - Update member (admin)
- `DELETE /:id` - Delete member (admin)
- `POST /import-csv` - Import from CSV
- `GET /export-csv` - Export to CSV

### Tasks (`/api/tasks`)

- `GET /` - Get all tasks
- `GET /:id` - Get task by ID
- `POST /` - Create task (admin)
- `PUT /:id` - Update task (admin)
- `DELETE /:id` - Delete task (admin)
- `GET /upcoming` - Get upcoming tasks

### Evaluations (`/api/evaluations`)

- `GET /` - Get all evaluations
- `GET /:id` - Get evaluation by ID
- `POST /` - Create evaluation (admin)
- `PUT /:id` - Update evaluation (admin)
- `DELETE /:id` - Delete evaluation (admin)

### Analysis (`/api/analysis`)

- `GET /group/:groupId` - Get group analysis
- `GET /trends` - Get evaluation trends
- `GET /statistics` - Get statistics
- `GET /rankings` - Get rankings
- `GET /elite-groups` - Get top 3 groups

## Migration from Firebase

### Export Firebase Data

1. Go to Firebase Console → Firestore Database
2. Use Firebase Admin SDK to export data
3. Save as JSON files

### Import to MongoDB

A migration script will be provided to:
- Transform Firestore data structure to MongoDB format
- Import users, groups, members, tasks, and evaluations
- Set up proper relationships

## Default Users

After setup, create admin users using the registration endpoint or MongoDB directly:

```javascript
// Super Admin
{
  email: "admin@example.com",
  password: "admin123",
  displayName: "Super Admin",
  role: "super-admin"
}

// Regular Admin
{
  email: "teacher@example.com",
  password: "teacher123",
  displayName: "Teacher",
  role: "admin"
}
```

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

### Port Already in Use

- Change `PORT` in `.env`
- Kill the process using the port

### CORS Errors

- Ensure `CLIENT_URL` in backend `.env` matches your frontend URL
- Check CORS configuration in `server.ts`

## Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- React Router
- Axios
- Chart.js

## License

ISC
