<<<<<<< HEAD
# Sarte-Salon
Salon in-house portal for employees  
=======
# 🎯 Sarte-Salon Backend

A comprehensive salon management system with AI-powered face recognition, built with Node.js and Express.js.

## ✨ Features

- **🔐 AI Face Recognition**: AWS Rekognition integration for employee authentication
- **👥 User Management**: Multi-role system (Admin, Manager, Employee)
- **⏰ Attendance Tracking**: Face-verified check-in/check-out system
- **💇‍♀️ Services & Products**: Complete catalog management with images
- **👨‍💼 Client Management**: Comprehensive client database
- **🧾 Billing System**: Full billing and payment tracking
- **💰 Financial Management**: Advance salary and expense management
- **📅 Advance Bookings**: Customer booking system with reminders
- **🔒 Security**: JWT authentication, CORS, rate limiting, security headers

## 🚀 Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd salon-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy the example environment file and configure your settings:

   ```bash
   cp env.example .env
   ```

   Then edit `.env` with your actual credentials:

   ```env
   # Database Configuration
   MONGO_URI=mongodb://localhost:27017/salon_db
   # Or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/salon_db

   # JWT Secret (Generate a strong secret key)
   JWT_SECRET=your_super_secret_jwt_key_here

   # AWS Configuration for Face Recognition
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1

   # Cloudinary Configuration for Image Storage
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Frontend URL (for CORS in production)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   For production:

   ```bash
   npm start
   ```

5. **Health Check:**
   Visit `http://localhost:5000/health` to verify the server is running.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with role-based access control
- **AI/ML**: AWS Rekognition for face recognition
- **File Storage**: Cloudinary for image management
- **Security**: Helmet, CORS, Rate limiting

## 📚 API Documentation

The API includes 80+ endpoints across multiple modules. Key endpoint categories:

- **Authentication**: `/api/auth/*`
- **Employee Management**: `/api/employees/*`
- **Attendance**: `/api/attendance/*`
- **Services**: `/api/services/*`
- **Products**: `/api/products/*`
- **Client Management**: `/api/clients/*`, `/api/admin-clients/*`
- **Billing**: `/api/bills/*`
- **Financial**: `/api/advance-salary/*`, `/api/expenses/*`

For complete API documentation, see `Complete-API-Summary.md`.

## 🔒 Security Features

- **Environment Variables**: All sensitive data uses environment variables
- **Face Recognition**: AI-powered authentication with AWS Rekognition
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Global error handling with detailed logging

## 🚀 Deployment

The application is deployment-ready for various platforms:

- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repository
- **Vercel**: Deploy as serverless functions
- **AWS/DigitalOcean**: Traditional VPS deployment

Make sure to set all environment variables in your deployment platform.

## 📁 Project Structure

```
salon-backend/
├── config/          # Configuration files (AWS, Cloudinary)
├── controller/      # Business logic controllers
├── middleware/      # Authentication & authorization
├── models/          # MongoDB schemas
├── routes/          # API route definitions
├── services/        # Business services
├── utils/           # Utility functions
├── server.js        # Main application entry point
└── env.example      # Environment variables template
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
>>>>>>> master
