# Database Connection & Management Guide

This guide provides comprehensive instructions for connecting to and managing the database system in Able-D backend, acting as a complete DBMS (Database Management System) for the frontend.

## Table of Contents
1. [Database Overview](#database-overview)
2. [Connection Setup](#connection-setup)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Management Scripts](#management-scripts)
6. [Frontend Integration](#frontend-integration)
7. [Troubleshooting](#troubleshooting)

## Database Overview

The Able-D backend uses **MongoDB** (Azure Cosmos DB for MongoDB API) as the primary database with the following collections:

- **users** - Student and teacher accounts
- **subjects** - Available subjects by school/class
- **notes** - Educational content and notes
- **sessions** - User sessions and tokens (optional)

### Current Configuration
- **Database Type**: MongoDB (Azure Cosmos DB)
- **Connection**: MongoDB Atlas/Cosmos DB
- **Authentication**: JWT + Firebase
- **Backup Strategy**: Azure Cosmos DB automatic backups

## Connection Setup

### 1. Environment Configuration

Create/update your `backend/.env` file:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=abled

# Alternative: Local MongoDB (for development)
# MONGO_URI=mongodb://localhost:27017
# MONGO_DB_NAME=abled_dev

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_EXPIRES_HOURS=12

# Firebase Configuration (optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CREDENTIALS_FILE=path/to/service-account.json
```

### 2. Connection Test

Use the provided test script to verify your connection:

```bash
cd backend
python scripts/test_db_connection.py
```

### 3. Database Initialization

Initialize the database with required indexes and default data:

```bash
cd backend
python scripts/init_database.py
```

## Database Schema

### Users Collection

```javascript
{
  "_id": ObjectId,
  "role": "student" | "teacher",
  "name": String,
  "email": String, // unique for teachers
  "passwordHash": String, // bcrypt hashed
  "studentType": "visually_impaired" | "hearing_impaired" | "speech_impaired" | "slow_learner",
  "class": String,
  "subject": String,
  "school": String,
  "anonymousId": String, // for anonymous students
  "createdAt": ISO8601,
  "updatedAt": ISO8601
}
```

### Subjects Collection

```javascript
{
  "_id": ObjectId,
  "subjectName": String,
  "school": String,
  "class": String,
  "addedBy": String, // user ID
  "createdAt": ISO8601
}
```

### Notes Collection

```javascript
{
  "_id": ObjectId,
  "school": String,
  "class": String,
  "subject": String,
  "topic": String,
  "text": String,
  "uploadedBy": String, // user ID
  "sourceType": "document" | "manual" | "ai_generated",
  "originalFilename": String,
  "meta": Object, // additional metadata
  "createdAt": ISO8601,
  "updatedAt": ISO8601
}
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/student/register` | Register new student |
| POST | `/api/auth/student/login` | Student login |
| POST | `/api/auth/teacher/register` | Register new teacher |
| POST | `/api/auth/teacher/login` | Teacher login |
| GET | `/api/auth/firebase/verify` | Verify Firebase token |

### Data Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | List subjects for school/class |
| POST | `/api/subjects` | Add new subject |
| GET | `/api/notes` | List notes (with filters) |
| POST | `/api/notes` | Save new note |
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |

### Database Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/db/health` | Database health check |
| GET | `/api/db/stats` | Database statistics |
| POST | `/api/db/backup` | Create database backup |
| POST | `/api/db/migrate` | Run database migrations |

## Management Scripts

### 1. Database Connection Test

**File**: `backend/scripts/test_db_connection.py`

Tests database connectivity and basic operations.

### 2. Database Initialization

**File**: `backend/scripts/init_database.py`

Initializes the database with:
- Required indexes
- Default subjects
- Sample data (optional)

### 3. Database Backup

**File**: `backend/scripts/backup_database.py`

Creates database backups and exports data.

### 4. Database Migration

**File**: `backend/scripts/migrate_database.py`

Handles database schema migrations and updates.

### 5. Database Cleanup

**File**: `backend/scripts/cleanup_database.py`

Cleans up old data, expired sessions, and unused records.

## Frontend Integration

### 1. API Client Setup

Create a database service in your frontend:

```javascript
// services/database.service.js
const API_BASE = 'http://localhost:5000/api';

class DatabaseService {
  constructor() {
    this.token = localStorage.getItem('accessToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`Database request failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // User Management
  async registerStudent(studentData) {
    return this.request('/auth/student/register', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  async loginStudent(credentials) {
    return this.request('/auth/student/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  // Data Management
  async getSubjects(school, className) {
    return this.request(`/subjects?school=${school}&class=${className}`);
  }

  async saveNote(noteData) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  }

  async getNotes(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/notes?${params}`);
  }

  // Database Health
  async checkHealth() {
    return this.request('/db/health');
  }

  async getStats() {
    return this.request('/db/stats');
  }
}

export default new DatabaseService();
```

### 2. React Hook for Database Operations

```javascript
// hooks/useDatabase.js
import { useState, useEffect } from 'react';
import DatabaseService from '../services/database.service';

export const useDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (operation) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};

// Usage in component
const MyComponent = () => {
  const { execute, loading, error } = useDatabase();
  const [subjects, setSubjects] = useState([]);

  const loadSubjects = async () => {
    try {
      const data = await execute(() => 
        DatabaseService.getSubjects('MySchool', 'Grade10')
      );
      setSubjects(data);
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {/* Render subjects */}
    </div>
  );
};
```

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   ```
   Error: Connection timeout to MongoDB
   Solution: Check MONGO_URI and network connectivity
   ```

2. **Authentication Failed**
   ```
   Error: Authentication failed
   Solution: Verify credentials in MONGO_URI
   ```

3. **Index Creation Failed**
   ```
   Error: Index creation failed
   Solution: Check user permissions and run init script
   ```

### Debug Commands

```bash
# Test connection
python scripts/test_db_connection.py --verbose

# Check database health
curl http://localhost:5000/api/db/health

# View database stats
curl http://localhost:5000/api/db/stats

# Check logs
tail -f logs/app.log
```

### Performance Optimization

1. **Index Optimization**
   - Monitor slow queries
   - Add compound indexes for frequent queries
   - Remove unused indexes

2. **Connection Pooling**
   - Adjust connection pool size
   - Monitor connection usage
   - Implement connection retry logic

3. **Caching Strategy**
   - Implement Redis for session storage
   - Cache frequently accessed data
   - Use database query result caching

## Security Considerations

1. **Data Encryption**
   - Use TLS for all connections
   - Encrypt sensitive data at rest
   - Implement field-level encryption

2. **Access Control**
   - Implement role-based access control
   - Use JWT for API authentication
   - Validate all user inputs

3. **Backup & Recovery**
   - Regular automated backups
   - Test backup restoration
   - Implement point-in-time recovery

## Monitoring & Maintenance

### Health Checks
- Database connectivity
- Index performance
- Query performance
- Storage usage

### Regular Maintenance
- Index optimization
- Data cleanup
- Performance monitoring
- Security updates

For more detailed information, refer to the individual script documentation in the `scripts/` directory.
