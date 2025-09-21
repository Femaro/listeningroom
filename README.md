# 🎧 Listening Room

A comprehensive mental health support platform connecting volunteers with those in need through real-time sessions and training programs.

## ✨ Features

### 🔐 User Management
- **Multi-role System**: Admin, Volunteer, and Seeker roles
- **Firebase Authentication**: Secure user registration and login
- **Profile Management**: Complete user profiles with preferences

### 💬 Session Management
- **Real-time Sessions**: Voice and text chat capabilities
- **Session Scheduling**: Create and manage help sessions
- **Availability Toggle**: Volunteers can set their availability status
- **Session History**: Track all past and current sessions

### 📚 Training System
- **Text-based Training**: Upload and complete training modules
- **Word Document Support**: Upload .docx files for training content
- **Progress Tracking**: Monitor training completion and progress
- **Admin Management**: Create, edit, and manage training modules
- **Section Navigation**: Easy navigation through training content

### 👨‍💼 Admin Dashboard
- **User Management**: View and manage all users
- **Session Monitoring**: Track all active and completed sessions
- **Training Management**: Upload and organize training content
- **Analytics**: View platform statistics and insights
- **Settings**: Configure platform-wide settings

### 🎯 Volunteer Features
- **Training Dashboard**: Complete training modules
- **Session Creation**: Create new help sessions
- **Impact Tracking**: View volunteer impact and statistics
- **Availability Management**: Set online/offline status

## 🛠️ Tech Stack

### Frontend
- **React Router v7**: Modern routing and navigation
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Mammoth**: Word document processing

### Backend & Services
- **Firebase Authentication**: User authentication
- **Firestore**: Real-time database
- **Firebase Storage**: File storage
- **Vercel Functions**: Serverless API endpoints

### Deployment
- **Vercel**: Hosting and deployment platform
- **Firebase Hosting**: Alternative hosting option
- **Global CDN**: Fast loading worldwide

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- Firebase project
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/listeningroom.git
   cd listeningroom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp vercel.env.example .env.local
   ```
   
   Update `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   AUTH_SECRET=your_secure_secret
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:4000`

## 🔧 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication, Firestore, and Storage

### 2. Configure Authentication
1. Enable Email/Password provider
2. Add your domain to authorized domains
3. Configure security rules

### 3. Set up Firestore
1. Create database in production mode
2. Configure security rules (see deployment guides)
3. Set up indexes for optimal performance

## 📦 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Configure build settings

2. **Set Environment Variables**
   - Add all variables from `vercel.env.example`
   - Configure Firebase settings

3. **Deploy**
   ```bash
   npm run vercel:deploy
   ```

### Firebase Hosting

1. **Build for Firebase**
   ```bash
   npm run build:firebase
   ```

2. **Deploy**
   ```bash
   firebase deploy
   ```

## 📁 Project Structure

```
src/
├── app/                    # React Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── volunteer/         # Volunteer pages
│   ├── seeker/           # Seeker pages
│   ├── api/              # API routes
│   └── ...
├── components/            # Reusable components
│   ├── admin/            # Admin components
│   ├── volunteer/        # Volunteer components
│   ├── seeker/          # Seeker components
│   └── ...
├── utils/                # Utility functions
│   ├── firebase.ts      # Firebase configuration
│   └── ...
└── ...
```

## 🔒 Security

- **Authentication**: Firebase Auth with email/password
- **Authorization**: Role-based access control
- **Data Security**: Firestore security rules
- **File Upload**: Secure file handling with type validation
- **CORS**: Proper cross-origin resource sharing

## 📊 Features in Detail

### Training System
- **File Upload**: Support for .txt, .md, and .docx files
- **Content Processing**: Automatic parsing and section creation
- **Progress Tracking**: Real-time progress updates
- **Admin Controls**: Full training management interface

### Session Management
- **Real-time Updates**: Live session status updates
- **Multi-modal**: Voice and text chat support
- **Scheduling**: Flexible session scheduling
- **History**: Complete session history and analytics

### Admin Dashboard
- **User Analytics**: Comprehensive user statistics
- **Session Monitoring**: Real-time session tracking
- **Content Management**: Training module management
- **System Settings**: Platform configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See deployment guides in the repository
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Video call integration
- [ ] Multi-language support
- [ ] Advanced training features
- [ ] Integration with external services

## 🙏 Acknowledgments

- Firebase for backend services
- Vercel for hosting and deployment
- React Router team for the excellent routing library
- Tailwind CSS for the utility-first CSS framework
- All contributors and volunteers

---

**Built with ❤️ for mental health support**

*Connecting people, providing support, making a difference.*
