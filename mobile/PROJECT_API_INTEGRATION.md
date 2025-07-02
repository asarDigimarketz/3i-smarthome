# Mobile Projects API Integration

## Overview
The mobile app's project functionality has been integrated with the server APIs. This document explains the integration implemented directly within the project files.

## Files Modified

### 1. `/src/app/(tabs)/projects/index.jsx`
**Features Added:**
- ✅ Real API calls to fetch projects from server
- ✅ Loading states and error handling
- ✅ Pull-to-refresh functionality
- ✅ Filtering by service type and status
- ✅ Data transformation from server format to mobile format
- ✅ Empty state handling

**API Endpoint Used:**
```
GET /api/projects?services=...&projectStatus=...
```

**Data Transformation:**
- Server status (`new`, `in-progress`, etc.) → Mobile status (`New`, `InProgress`, etc.)
- Address object → Flattened display string
- Currency formatting with Indian locale
- Date formatting for display

### 2. `/src/app/(tabs)/projects/AddProjects.jsx`
**Features Added:**
- ✅ Form validation (email, phone, required fields)
- ✅ API submission with proper data format
- ✅ File upload support for project attachments
- ✅ Loading states during submission
- ✅ Success/error alerts
- ✅ Data mapping from mobile to server format

**API Endpoint Used:**
```
POST /api/projects
Content-Type: application/json (without file)
Content-Type: multipart/form-data (with file)
```

**Data Format Sent to Server:**
```javascript
{
  customerName: "John Doe",
  contactNumber: "+91 9876543210",
  email: "john@example.com",
  address: {
    addressLine: "123 Main St",
    city: "Mumbai",
    district: "Mumbai",
    state: "Maharashtra", 
    country: "India",
    pincode: "400001"
  },
  services: "Home Cinema",
  projectDescription: "Home theater setup",
  projectAmount: 500000,
  size: "1200",
  projectStatus: "new",
  projectDate: "2024-01-15"
}
```

## API Configuration

### Environment Variables Required
```bash
EXPO_PUBLIC_API_URL=http://192.168.29.32:5000
EXPO_PUBLIC_API_KEY=your_api_key_here
```

### Authentication
All API calls include the API key in headers:
```javascript
headers: {
  'x-api-key': process.env.EXPO_PUBLIC_API_KEY
}
```

## Data Mapping

### Status Mapping
| Mobile Status | Server Status |
|---------------|---------------|
| New           | new           |
| InProgress    | in-progress   |
| Complete      | completed     |
| Done          | done          |
| Cancelled     | cancelled     |

### Service Types (Consistent)
- Home Cinema
- Security System  
- Home Automation
- Outdoor Audio

## Error Handling

### Network Errors
- Automatic detection of network issues
- User-friendly error messages
- Retry functionality

### Validation Errors
- Client-side validation before API call
- Email format validation
- Phone number validation
- Required field validation
- Amount validation

### Server Errors
- HTTP status code handling
- Server error message display
- Proper error categorization

## User Experience Features

### Loading States
- Initial loading with spinner
- Pull-to-refresh indicator
- Button loading states during submission
- Disabled inputs during submission

### Data Synchronization
- Automatic refresh after successful operations
- Real-time filtering with API calls
- Consistent data format across components

### File Upload
- Support for PDF, DOC, DOCX, and images
- File size validation (10MB limit)
- Progress indication during upload
- File removal functionality

## Testing

### How to Test
1. Start the server: `cd server && npm start`
2. Start mobile app: `cd mobile && npm start` 
3. Test features:
   - View projects (should load from API)
   - Create new project (should submit to API)
   - Test filtering by service and status
   - Test file upload
   - Test error handling (turn off network)

### Debug Information
The app includes comprehensive console logging:
- API request URLs and parameters
- Response status and data
- Error details
- Form validation results

## Server API Structure Referenced

### Project Model Fields (Server)
```javascript
{
  customerName: String (required),
  contactNumber: String (required),
  email: String (required),
  address: {
    addressLine: String (required),
    city: String (required),
    district: String (required),
    state: String (required),
    country: String (required),
    pincode: String (required)
  },
  services: String (enum: ["Home Cinema", "Home Automation", "Security System", "Outdoor Audio Solution"]),
  projectDescription: String (required),
  projectAmount: Number (required),
  size: String (required),
  projectStatus: String (enum: ["new", "in-progress", "completed", "done", "cancelled"]),
  projectDate: Date,
  attachment: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }
}
```

### Server Response Format
```javascript
{
  success: true/false,
  data: project_object, // for create/update
  projects: [project_objects], // for list
  message: "Success message",
  pagination: { ... } // for list with pagination
}
```

## Future Enhancements
- Project detail view
- Project editing
- Task management
- Status updates
- Statistics dashboard
- Offline support 