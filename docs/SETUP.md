# 🚀 Setup Guide - 3i SmartHome

Complete setup guide for the 3i SmartHome management system.

## 📋 **Prerequisites**

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud instance)
- **Git** for version control
- **Firebase Project** (for notifications)
- **Code Editor** (VS Code recommended)

## 🏗️ **Project Structure**

```
3i-smarthome/
├── client/              # Next.js Web Dashboard
├── server/              # Express.js API Server
├── mobile/              # React Native Mobile App
├── env-templates/       # Environment templates
├── docs/                # Documentation
└── README.md           # Project overview
```

## 🔧 **Step 1: Environment Setup**

### **Server Environment**
1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Copy environment template:
   ```bash
   cp ../env-templates/server.env.example .env
   ```

3. Edit `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/3i-smarthome
   JWT_SECRET=your-super-secret-jwt-key
   API_KEY=your-api-key-here
   SMTP_FROM_EMAIL=your-email@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ADMINEMAIL=admin@example.com
   ```

### **Client Environment**
1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Copy environment template:
   ```bash
   cp ../env-templates/client.env.example .env.local
   ```

3. Edit `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_API_KEY=your-api-key-here
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   JWT_SECRET=your-super-secret-jwt-key
   SMTP_FROM_EMAIL=your-email@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
   ADMINEMAIL=admin@example.com
   ```

### **Mobile Environment**
1. Navigate to mobile directory:
   ```bash
   cd mobile
   ```

2. Copy environment template:
   ```bash
   cp ../env-templates/mobile.env.example .env
   ```

3. Edit `.env` file:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000
   EXPO_PUBLIC_API_KEY=your-api-key-here
   EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   EXPO_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
   ```

## 🗄️ **Step 2: Database Setup**

### **MongoDB Setup**
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `3i-smarthome`
3. Update the `MONGODB_URI` in server `.env` file

### **Database Collections**
The following collections will be created automatically:
- `users` - Admin users
- `useremployees` - Employee users
- `projects` - Project data
- `tasks` - Task data
- `proposals` - Proposal data
- `customers` - Customer data
- `notifications` - Notification data
- `fcmtokens` - FCM tokens for push notifications
- `roles` - Role and permission data

## 🔥 **Step 3: Firebase Setup**

### **Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Enable Cloud Firestore (if needed)

### **Add Web App**
1. In Firebase Console, click "Add app" → "Web"
2. Register app with name "3i-smarthome-web"
3. Copy the Firebase config object
4. Update client `.env.local` with Firebase config

### **Add Mobile App**
1. In Firebase Console, click "Add app" → "Android"
2. Register app with package name (from mobile app.json)
3. Download `google-services.json` and place in `mobile/android/app/`
4. Update mobile `.env` with Firebase config

### **Enable Cloud Messaging**
1. In Firebase Console, go to Project Settings
2. Go to Cloud Messaging tab
3. Generate VAPID key
4. Add VAPID key to both client and mobile `.env` files

### **Service Account Setup**
1. In Firebase Console, go to Project Settings → Service Accounts
2. Generate new private key
3. Download JSON file and place in `server/` directory
4. Update server `.env` with Firebase admin config

## 📦 **Step 4: Install Dependencies**

### **Server Dependencies**
```bash
cd server
npm install
```

### **Client Dependencies**
```bash
cd client
npm install
```

### **Mobile Dependencies**
```bash
cd mobile
npm install
```

## 🚀 **Step 5: Start Development Servers**

### **Start Server (API)**
```bash
cd server
npm start
```
Server will run on `http://localhost:5000`

### **Start Client (Web Dashboard)**
```bash
cd client
npm run dev
```
Client will run on `http://localhost:3000`

### **Start Mobile App**
```bash
cd mobile
npx expo start
```
Mobile app will run on Expo development server

## 🔐 **Step 6: Initial Setup**

### **Create Admin User**
1. Start the server
2. The system will automatically create an admin user
3. Default admin credentials will be logged in console
4. Login to web dashboard with admin credentials

### **Configure Roles and Permissions**
1. Login as admin
2. Go to Settings → Roles & Permissions
3. Create roles for different user types
4. Assign permissions to roles

### **Add Initial Data**
1. Create test projects
2. Add employees
3. Create tasks
4. Test notification system

## 🧪 **Step 7: Testing**

### **Test Web Dashboard**
1. Open `http://localhost:3000`
2. Login with admin credentials
3. Test all features:
   - Dashboard statistics
   - Create/edit projects
   - Create/edit tasks
   - Notification system

### **Test Mobile App**
1. Install Expo Go on your phone
2. Scan QR code from Expo development server
3. Test mobile features:
   - Login/logout
   - Dashboard
   - Project management
   - Push notifications

### **Test API Endpoints**
1. Use Postman or similar tool
2. Test all API endpoints
3. Verify authentication
4. Test file uploads

## 🔧 **Troubleshooting**

### **Common Issues**

#### **MongoDB Connection Error**
- Check if MongoDB is running
- Verify connection string in server `.env`
- Check network connectivity

#### **Firebase Configuration Error**
- Verify Firebase config in all `.env` files
- Check if Firebase project is properly set up
- Ensure VAPID key is correct

#### **Port Already in Use**
- Change port in `.env` files
- Kill existing processes using the port
- Use different ports for each service

#### **Environment Variables Not Loading**
- Ensure `.env` files are in correct locations
- Check file names (`.env.local` for client)
- Restart development servers

#### **Mobile App Not Loading**
- Check Expo CLI installation
- Verify mobile `.env` configuration
- Check network connectivity

### **Debug Commands**

#### **Server Debug**
```bash
cd server
npm run dev  # For development with nodemon
```

#### **Client Debug**
```bash
cd client
npm run dev  # Next.js development server
```

#### **Mobile Debug**
```bash
cd mobile
npx expo start --clear  # Clear cache and restart
```

## 📱 **Mobile App Setup**

### **Android Setup**
1. Install Android Studio
2. Set up Android SDK
3. Create Android Virtual Device (AVD)
4. Run `npx expo start` and press 'a' for Android

### **iOS Setup**
1. Install Xcode (Mac only)
2. Install iOS Simulator
3. Run `npx expo start` and press 'i' for iOS

### **Physical Device**
1. Install Expo Go app
2. Scan QR code from development server
3. Test on physical device

## 🌐 **Production Deployment**

### **Server Deployment**
1. Set `NODE_ENV=production` in server `.env`
2. Use PM2 or similar process manager
3. Deploy to your preferred hosting service

### **Client Deployment**
1. Build the client: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred hosting
3. Update environment variables in hosting platform

### **Mobile App Deployment**
1. Build for production: `npx expo build:android`
2. Upload to Google Play Store
3. For iOS: `npx expo build:ios` and upload to App Store

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Review error logs in console
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Check network connectivity and firewall settings

For additional support:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `docs/` folder

---

**Happy Coding! 🚀** 