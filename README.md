# 3i SmartHome - Complete Management System

A comprehensive smart home management system with web dashboard, mobile app, and real-time notifications.

## 🏗️ **Project Structure**

```
3i-smarthome/
├── client/          # Next.js Web Dashboard
├── server/          # Express.js API Server
├── mobile/          # React Native Mobile App
├── env-templates/   # Environment variable templates
└── docs/            # Documentation
```

## 🚀 **Features**

### **Web Dashboard (Client)**
- ✅ **Real-time Dashboard** with project statistics
- ✅ **Role-based Access Control** with permissions
- ✅ **Real-time Notifications** with FCM support
- ✅ **Project Management** (create, update, delete)
- ✅ **Task Management** with assignment tracking
- ✅ **Proposal Management** with status tracking
- ✅ **Customer Management** with detailed profiles
- ✅ **Employee Management** with role assignments
- ✅ **Notification System** with real-time updates

### **Mobile App**
- ✅ **Cross-platform** (iOS & Android)
- ✅ **Real-time Notifications** via FCM
- ✅ **Offline Support** with data caching
- ✅ **Push Notifications** for all activities
- ✅ **Role-based UI** based on user permissions
- ✅ **Real-time Dashboard** with live updates

### **API Server**
- ✅ **RESTful API** with comprehensive endpoints
- ✅ **JWT Authentication** with role-based access
- ✅ **Real-time Notifications** via FCM
- ✅ **File Upload** support for images/documents
- ✅ **Email Integration** for notifications
- ✅ **MongoDB Integration** with optimized queries

## 🛠️ **Technology Stack**

### **Frontend (Web)**
- **Next.js 15** with App Router
- **NextAuth.js** for authentication
- **HeroUI** for UI components
- **Tailwind CSS** for styling
- **Firebase** for push notifications

### **Mobile App**
- **React Native** with Expo
- **Expo Router** for navigation
- **AsyncStorage** for local storage
- **Firebase** for push notifications
- **Axios** for API calls

### **Backend**
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Firebase Admin SDK** for notifications
- **Multer** for file uploads
- **Nodemailer** for email sending

## 📋 **Prerequisites**

- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud)
- **Firebase Project** (for notifications)
- **Git** for version control

## 🚀 **Quick Start**

### **1. Clone the Repository**
```bash
git clone https://github.com/asarDigimarketz/3i-smarthome.git
cd 3i-smarthome
```

### **2. Environment Setup**

#### **Server Setup**
```bash
cd server
cp ../env-templates/server.env.example .env
# Edit .env with your configuration
npm install
npm start
```

#### **Client Setup**
```bash
cd client
cp ../env-templates/client.env.example .env.local
# Edit .env.local with your configuration
npm install
npm run dev
```

#### **Mobile Setup**
```bash
cd mobile
cp ../env-templates/mobile.env.example .env
# Edit .env with your configuration
npm install
npx expo start
```

### **3. Database Setup**
- Create MongoDB database
- Update connection string in server `.env`

### **4. Firebase Setup**
- Create Firebase project
- Add web and mobile apps
- Download service account key
- Update Firebase config in all apps

## 🔧 **Environment Variables**

### **Server (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-jwt-secret
API_KEY=your-api-key
# ... see env-templates/server.env.example
```

### **Client (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_SECRET=your-nextauth-secret
JWT_SECRET=your-jwt-secret
# ... see env-templates/client.env.example
```

### **Mobile (.env)**
```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_API_KEY=your-api-key
# ... see env-templates/mobile.env.example
```

## 📱 **Mobile App Features**

### **Authentication**
- Login/Logout with role-based access
- Session management with AsyncStorage
- Auto-logout on token expiration

### **Dashboard**
- Real-time project statistics
- Recent activities with notifications
- Quick action buttons

### **Project Management**
- Create, edit, delete projects
- Assign team members
- Track project status
- File uploads for project documents

### **Task Management**
- Create tasks with assignments
- Update task status and progress
- Real-time notifications for task updates
- File attachments for task details

### **Notifications**
- Real-time push notifications
- In-app notification center
- Mark as read functionality
- Notification badges with count

## 🌐 **Web Dashboard Features**

### **Authentication**
- NextAuth.js integration
- Google OAuth support
- Role-based access control
- Session management

### **Dashboard**
- Real-time statistics
- Recent activities
- Quick action buttons
- Notification center

### **Management Modules**
- **Projects**: Full CRUD with file uploads
- **Tasks**: Assignment and progress tracking
- **Proposals**: Status management
- **Customers**: Profile management
- **Employees**: Role and permission management

### **Real-time Features**
- Live notification updates
- Real-time dashboard data
- FCM push notifications
- Instant UI updates

## 🔐 **Security Features**

- **JWT Authentication** with role-based access
- **API Key Protection** for server endpoints
- **Environment Variable** protection
- **Input Validation** and sanitization
- **CORS Configuration** for cross-origin requests
- **File Upload** security with type validation

## 📊 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/mobile-login` - Mobile login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### **Projects**
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### **Tasks**
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### **Notifications**
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/stats` - Get unread count

## 🚀 **Deployment**

### **Server Deployment**
```bash
cd server
npm run build
# Deploy to your preferred hosting service
```

### **Client Deployment**
```bash
cd client
npm run build
# Deploy to Vercel, Netlify, or your preferred hosting
```

### **Mobile App Deployment**
```bash
cd mobile
npx expo build:android  # For Android
npx expo build:ios      # For iOS
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 **Support**

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `docs/` folder

## 🔄 **Changelog**

### **Latest Updates**
- ✅ Real-time notification system
- ✅ Cross-platform FCM integration
- ✅ Role-based access control
- ✅ Mobile app with offline support
- ✅ Web dashboard with real-time updates
- ✅ Comprehensive API documentation

---

**Built with ❤️ by the 3i SmartHome Team** 