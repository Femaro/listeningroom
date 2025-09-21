# Volunteer Training System

A comprehensive training system that allows volunteers to enroll in trainings, complete them, and earn different levels of volunteering based on their progress.

## Features

### For Volunteers
- **Training Dashboard**: View all available training modules and progress
- **Module Enrollment**: Enroll in training modules
- **Progress Tracking**: Track completion status and progress
- **Level Progression**: Earn different volunteer levels based on completed trainings
- **Interactive Training**: Take training modules with quizzes and assessments
- **Real-time Updates**: Progress updates in real-time

### For Admins
- **Training Management**: Create, edit, and manage training modules
- **Progress Monitoring**: Track volunteer training progress and statistics
- **Level Management**: View volunteers by level and manage level requirements
- **Analytics**: Training completion rates and volunteer statistics

## Training Modules

The system includes 6 core training modules:

1. **Module 1: Welcome & Platform Overview** (15 min, Level 1, Required)
   - Introduction to mission, values, and platform features
   - Code of conduct and ethical guidelines

2. **Module 2: Active Listening Fundamentals** (30 min, Level 1, Required)
   - Core principles of effective listening
   - Empathetic communication techniques
   - Non-verbal cues recognition

3. **Module 3: Crisis Recognition & Response** (45 min, Level 2, Required)
   - Identifying crisis situations
   - Appropriate response protocols
   - Emergency resource connections

4. **Module 4: Building Rapport & Trust** (25 min, Level 2, Required)
   - Creating safe spaces
   - Trust-building techniques

5. **Module 5: Boundaries & Self-Care** (20 min, Level 2, Required)
   - Setting professional boundaries
   - Self-care practices for volunteers

6. **Module 6: Platform Tools & Features** (15 min, Level 1, Required)
   - Dashboard navigation
   - Session management tools

## Volunteer Levels

### Level 0: Trainee
- **Requirements**: None
- **Benefits**: Access to basic platform features
- **Description**: New volunteer, no training completed

### Level 1: Basic Volunteer
- **Requirements**: Modules 1, 2, 6
- **Benefits**: Can start basic support sessions, access to volunteer community
- **Description**: Completed foundational training

### Level 2: Advanced Volunteer
- **Requirements**: All 6 modules
- **Benefits**: Can handle crisis situations, access to advanced features, mentor new volunteers
- **Description**: Completed all required training

### Level 3: Expert Volunteer
- **Requirements**: All 6 modules + specialized training
- **Benefits**: Lead training sessions, access to all platform features, priority support
- **Description**: Completed additional specialized training

## Firebase Collections

### `trainings`
Stores training module definitions:
```javascript
{
  id: "module-1",
  title: "Welcome & Platform Overview",
  description: "Introduction to our mission, values, and platform features.",
  duration: 15,
  level: 1,
  required: true,
  icon: "BookOpen",
  color: "teal",
  content: {
    sections: [...],
    quiz: {
      questions: [...],
      passingScore: 80
    }
  }
}
```

### `volunteer_trainings`
Tracks volunteer enrollment and progress:
```javascript
{
  volunteerId: "user123",
  moduleId: "module-1",
  status: "completed", // enrolled, in_progress, completed, failed
  progress: 100,
  currentSection: 0,
  quizAttempts: 0,
  quizScore: 85,
  passed: true,
  enrolledAt: timestamp,
  completedAt: timestamp
}
```

### `user_profiles`
Updated with volunteer level information:
```javascript
{
  volunteerLevel: 2,
  volunteerLevelName: "Advanced Volunteer",
  lastLevelUpdate: timestamp
}
```

## Usage

### For Volunteers

1. **Access Training Dashboard**:
   - Go to Volunteer Dashboard → Training tab
   - View all available modules and current progress

2. **Enroll in Training**:
   - Click "Enroll" on any available module
   - Module status changes to "enrolled"

3. **Take Training**:
   - Click "Start" or "Continue" on enrolled modules
   - Complete sections and take the quiz
   - Pass the quiz to complete the module

4. **Track Progress**:
   - View completion status and current level
   - See benefits of current and next levels

### For Admins

1. **Access Training Management**:
   - Go to Admin Dashboard → Training tab
   - View training statistics and volunteer progress

2. **Initialize Training Modules**:
   - Click "Initialize Modules" to set up default training modules
   - Or use the script: `node scripts/initializeTraining.js`

3. **Monitor Progress**:
   - View completion rates and volunteer statistics
   - Track volunteers by level
   - Reset volunteer training if needed

## API Functions

### Training Service (`/src/utils/trainingService.js`)

- `initializeTrainingModules()` - Initialize training modules in Firebase
- `getAllTrainingModules()` - Get all available training modules
- `getTrainingModule(moduleId)` - Get specific training module
- `enrollVolunteerInTraining(volunteerId, moduleId)` - Enroll volunteer in training
- `getVolunteerTrainingProgress(volunteerId)` - Get volunteer's training progress
- `updateTrainingProgress(volunteerId, moduleId, progressData)` - Update training progress
- `completeTrainingModule(volunteerId, moduleId, quizScore)` - Complete training module
- `updateVolunteerLevel(volunteerId)` - Update volunteer's level
- `getTrainingStatistics()` - Get training statistics for admin
- `getVolunteersByLevel(level)` - Get volunteers by level
- `resetVolunteerTraining(volunteerId)` - Reset volunteer's training progress

### Training Data (`/src/utils/trainingData.js`)

- `TRAINING_MODULES` - Array of training module definitions
- `VOLUNTEER_LEVELS` - Array of volunteer level definitions
- `calculateVolunteerLevel(completedModules)` - Calculate volunteer level
- `getNextRequiredModules(completedModules)` - Get next required modules

## Components

### Volunteer Components
- `TrainingDashboard` - Main training interface for volunteers
- `TrainingModuleViewer` - Interactive training module viewer

### Admin Components
- `TrainingManagement` - Admin interface for managing trainings

## Setup Instructions

1. **Initialize Training Modules**:
   ```bash
   # Option 1: Use admin interface
   # Go to Admin Dashboard → Training → Initialize Modules

   # Option 2: Use script
   node scripts/initializeTraining.js
   ```

2. **Configure Firebase**:
   - Ensure Firebase is properly configured
   - Set up Firestore security rules for training collections

3. **Test the System**:
   - Create a volunteer account
   - Enroll in training modules
   - Complete modules and verify level progression

## Security Rules

Ensure proper Firestore security rules for training collections:

```javascript
// Allow volunteers to read their own training progress
match /volunteer_trainings/{document} {
  allow read, write: if request.auth != null && 
    request.auth.uid == resource.data.volunteerId;
}

// Allow admins to manage training modules
match /trainings/{document} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.userType == 'admin';
}
```

## Future Enhancements

- **Specialized Training Tracks**: Different training paths for different volunteer roles
- **Certification Badges**: Visual badges for completed trainings
- **Training Analytics**: Detailed analytics and reporting
- **Mobile App Integration**: Training modules accessible via mobile app
- **Offline Training**: Download training modules for offline access
- **Video Content**: Integration with video training content
- **Peer Review**: Peer review system for training completion
- **Continuing Education**: Ongoing training requirements and updates
