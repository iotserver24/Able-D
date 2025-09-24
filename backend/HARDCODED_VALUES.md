# Hardcoded Values in Backend

This document describes the hardcoded values used in the backend registration system.

## School/College

**Value**: `"DemoSchool"`

**Location**: 
- `backend/app/routes/auth.py` - Student and Teacher registration endpoints
- `backend/app/services/auth_service.py` - Default parameter in registration functions

**Usage**: All users (both students and teachers) are automatically assigned to "DemoSchool" during registration.

## Subjects

**Available Subjects**:
- `"english"`
- `"science"` 
- `"social"`

**Default Subject for Students**: `"science"`

**Location**:
- `backend/app/services/subject_service.py` - `default_subjects()` function defines available subjects
- `backend/app/routes/auth.py` - Student registration hardcodes subject as "science"

## Registration Changes

### Student Registration
- **School**: Automatically set to "DemoSchool"
- **Subject**: Automatically set to "science"
- **Required Fields**: name, email, password, class, studentType

### Teacher Registration  
- **School**: Automatically set to "DemoSchool"
- **Required Fields**: name, email, password

## Frontend Changes

The frontend registration forms have been updated to remove:
- School selection field (hardcoded in backend)
- Subject selection field for students (hardcoded in backend)

## Benefits

1. **Simplified Registration**: Users don't need to select school or subject
2. **Consistent Data**: All users belong to the same school
3. **Reduced Complexity**: Fewer form fields and validation
4. **Easier Testing**: Consistent test data across all registrations

## API Endpoints Affected

- `POST /api/auth/student/register` - Now ignores school and subject in request body
- `POST /api/auth/teacher/register` - Now ignores school in request body
- `GET /api/subjects` - Still returns the three available subjects for reference
