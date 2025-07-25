# 📊 API Documentation - 3i SmartHome

Complete API documentation for the 3i SmartHome management system.

## 🔐 **Authentication**

All API endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### **Token Generation**
- **Web Client**: Uses NextAuth.js session
- **Mobile App**: Uses JWT from login endpoint
- **Server-to-Server**: Uses API key authentication

## 📋 **Base URL**

```
Development: http://localhost:5000
Production: https://your-api-domain.com
```

## 🔑 **Authentication Endpoints**

### **POST /api/auth/login**
User login for web dashboard.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "admin",
    "permissions": ["read", "write", "delete"]
  }
}
```

### **POST /api/auth/mobile-login**
Mobile app login.

**Request Body:**
```json
{
  "email": "employee@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "employee_id",
    "email": "employee@example.com",
    "role": "employee",
    "permissions": ["read", "write"]
  }
}
```

### **POST /api/auth/register**
User registration.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin"
}
```

### **GET /api/auth/me**
Get current user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "permissions": ["read", "write", "delete"]
  }
}
```

## 📊 **Project Endpoints**

### **GET /api/projects**
Get all projects with pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status
- `search` (string): Search in project name

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "_id": "project_id",
      "name": "Project Name",
      "description": "Project description",
      "status": "active",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z",
      "budget": 50000,
      "assignedTo": ["employee_id"],
      "createdBy": "user_id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### **POST /api/projects**
Create new project.

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "status": "active",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "budget": 50000,
  "assignedTo": ["employee_id"],
  "files": [File] // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "project": {
    "_id": "project_id",
    "name": "New Project",
    "description": "Project description",
    "status": "active",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T00:00:00.000Z",
    "budget": 50000,
    "assignedTo": ["employee_id"],
    "createdBy": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **PUT /api/projects/:id**
Update project.

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "completed",
  "budget": 60000
}
```

### **DELETE /api/projects/:id**
Delete project.

## 📝 **Task Endpoints**

### **GET /api/tasks**
Get all tasks with pagination.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status
- `projectId` (string): Filter by project
- `assignedTo` (string): Filter by assigned user

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "_id": "task_id",
      "title": "Task Title",
      "description": "Task description",
      "status": "pending",
      "priority": "high",
      "projectId": "project_id",
      "assignedTo": "employee_id",
      "dueDate": "2024-01-15T00:00:00.000Z",
      "createdBy": "user_id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### **POST /api/tasks**
Create new task.

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "projectId": "project_id",
  "assignedTo": "employee_id",
  "dueDate": "2024-01-15",
  "files": [File] // Optional
}
```

### **PUT /api/tasks/:id**
Update task.

**Request Body:**
```json
{
  "title": "Updated Task",
  "status": "in-progress",
  "priority": "high",
  "dueDate": "2024-01-20"
}
```

### **DELETE /api/tasks/:id**
Delete task.

## 📋 **Proposal Endpoints**

### **GET /api/proposals**
Get all proposals.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

**Response:**
```json
{
  "success": true,
  "proposals": [
    {
      "_id": "proposal_id",
      "title": "Proposal Title",
      "description": "Proposal description",
      "status": "pending",
      "amount": 25000,
      "customerId": "customer_id",
      "createdBy": "user_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### **POST /api/proposals**
Create new proposal.

**Request Body:**
```json
{
  "title": "New Proposal",
  "description": "Proposal description",
  "status": "pending",
  "amount": 25000,
  "customerId": "customer_id",
  "files": [File] // Optional
}
```

### **PUT /api/proposals/:id**
Update proposal.

### **DELETE /api/proposals/:id**
Delete proposal.

## 👥 **Customer Endpoints**

### **GET /api/customers**
Get all customers.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search in customer name/email

**Response:**
```json
{
  "success": true,
  "customers": [
    {
      "_id": "customer_id",
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "+1234567890",
      "address": "Customer Address",
      "createdBy": "user_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### **POST /api/customers**
Create new customer.

**Request Body:**
```json
{
  "name": "New Customer",
  "email": "customer@example.com",
  "phone": "+1234567890",
  "address": "Customer Address"
}
```

### **PUT /api/customers/:id**
Update customer.

### **DELETE /api/customers/:id**
Delete customer.

## 👨‍💼 **Employee Endpoints**

### **GET /api/employees**
Get all employees.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `role` (string): Filter by role

**Response:**
```json
{
  "success": true,
  "employees": [
    {
      "_id": "employee_id",
      "name": "Employee Name",
      "email": "employee@example.com",
      "phone": "+1234567890",
      "role": "employee",
      "department": "Engineering",
      "createdBy": "user_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### **POST /api/employees**
Create new employee.

**Request Body:**
```json
{
  "name": "New Employee",
  "email": "employee@example.com",
  "phone": "+1234567890",
  "role": "employee",
  "department": "Engineering",
  "password": "password123"
}
```

### **PUT /api/employees/:id**
Update employee.

### **DELETE /api/employees/:id**
Delete employee.

## 🔔 **Notification Endpoints**

### **GET /api/notifications**
Get all notifications for current user.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `isRead` (boolean): Filter by read status

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "notification_id",
      "title": "Notification Title",
      "body": "Notification body",
      "type": "task",
      "isRead": false,
      "triggeredBy": "user_id",
      "triggeredByModel": "User",
      "changes": {
        "status": "completed"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### **GET /api/notifications/stats**
Get notification statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 25,
    "unread": 5,
    "read": 20
  }
}
```

### **PUT /api/notifications/:id/read**
Mark notification as read.

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### **DELETE /api/notifications/:id**
Delete notification.

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

## 🔥 **FCM Token Endpoints**

### **POST /api/fcm/token**
Register FCM token for push notifications.

**Request Body:**
```json
{
  "userId": "user_id",
  "token": "fcm_token_here",
  "platform": "web" // or "mobile"
}
```

**Response:**
```json
{
  "success": true,
  "message": "FCM token registered successfully"
}
```

## 📁 **File Upload Endpoints**

### **POST /api/upload**
Upload files.

**Request Body:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File to upload
- `type`: File type (project, task, proposal, etc.)

**Response:**
```json
{
  "success": true,
  "file": {
    "filename": "uploaded_file.jpg",
    "path": "/uploads/project/file.jpg",
    "url": "http://localhost:5000/uploads/project/file.jpg"
  }
}
```

## 🔧 **Settings Endpoints**

### **GET /api/settings/general**
Get general settings.

**Response:**
```json
{
  "success": true,
  "settings": {
    "companyName": "3i SmartHome",
    "companyEmail": "info@3ismarthome.com",
    "companyPhone": "+1234567890",
    "companyAddress": "Company Address"
  }
}
```

### **PUT /api/settings/general**
Update general settings.

**Request Body:**
```json
{
  "companyName": "Updated Company Name",
  "companyEmail": "updated@example.com",
  "companyPhone": "+1234567890",
  "companyAddress": "Updated Address"
}
```

### **GET /api/settings/email**
Get email configuration.

**Response:**
```json
{
  "success": true,
  "emailConfig": {
    "smtpHost": "smtp.gmail.com",
    "smtpPort": 587,
    "smtpUser": "user@gmail.com",
    "smtpFrom": "noreply@example.com"
  }
}
```

### **PUT /api/settings/email**
Update email configuration.

## 🚨 **Error Responses**

### **400 Bad Request**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### **401 Unauthorized**
```json
{
  "success": false,
  "message": "No token provided"
}
```

### **403 Forbidden**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### **404 Not Found**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### **500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## 📊 **Response Format**

All API responses follow this format:

```json
{
  "success": true/false,
  "message": "Response message",
  "data": {}, // Optional
  "pagination": {}, // Optional for list endpoints
  "errors": [] // Optional for error responses
}
```

## 🔐 **Security**

### **Authentication**
- JWT tokens for API access
- Token expiration (8 hours)
- Role-based access control

### **Rate Limiting**
- 100 requests per minute per IP
- 1000 requests per hour per user

### **CORS**
- Configured for web and mobile clients
- Allowed origins: `http://localhost:3000`, `http://localhost:8081`

### **File Upload Security**
- File type validation
- File size limits (10MB max)
- Secure file storage

## 📱 **Mobile App Specific**

### **Authentication Flow**
1. Call `/api/auth/mobile-login`
2. Store JWT token in AsyncStorage
3. Include token in all API calls
4. Handle token expiration

### **Push Notifications**
1. Register FCM token with `/api/fcm/token`
2. Receive notifications for relevant events
3. Handle notification taps

### **Offline Support**
- Cache data in AsyncStorage
- Sync when online
- Handle network errors gracefully

---

**For more information, check the setup guide and troubleshooting documentation.** 