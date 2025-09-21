import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { TRAINING_MODULES, VOLUNTEER_LEVELS, calculateVolunteerLevel } from './trainingData';

// Training Collections
const TRAININGS_COLLECTION = 'trainings';
const VOLUNTEER_TRAININGS_COLLECTION = 'volunteer_trainings';
const VOLUNTEER_PROGRESS_COLLECTION = 'volunteer_progress';

// Initialize training modules in Firebase
export async function initializeTrainingModules() {
  try {
    for (const module of TRAINING_MODULES) {
      const moduleRef = doc(db, TRAININGS_COLLECTION, module.id);
      await setDoc(moduleRef, {
        ...module,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('Training modules initialized successfully');
  } catch (error) {
    console.error('Error initializing training modules:', error);
    throw error;
  }
}

// Get all training modules
export async function getAllTrainingModules() {
  try {
    const q = query(collection(db, TRAININGS_COLLECTION), orderBy('level', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting training modules:', error);
    throw error;
  }
}

// Get a specific training module
export async function getTrainingModule(moduleId) {
  try {
    const moduleRef = doc(db, TRAININGS_COLLECTION, moduleId);
    const moduleSnap = await getDoc(moduleRef);
    
    if (moduleSnap.exists()) {
      return { id: moduleSnap.id, ...moduleSnap.data() };
    } else {
      throw new Error('Training module not found');
    }
  } catch (error) {
    console.error('Error getting training module:', error);
    throw error;
  }
}

// Enroll volunteer in a training module
export async function enrollVolunteerInTraining(volunteerId, moduleId) {
  try {
    const enrollmentRef = doc(db, VOLUNTEER_TRAININGS_COLLECTION, `${volunteerId}_${moduleId}`);
    
    await setDoc(enrollmentRef, {
      volunteerId,
      moduleId,
      status: 'enrolled', // enrolled, in_progress, completed, failed
      enrolledAt: serverTimestamp(),
      progress: 0,
      currentSection: 0,
      quizAttempts: 0,
      lastAccessedAt: serverTimestamp()
    });
    
    return { success: true, message: 'Successfully enrolled in training' };
  } catch (error) {
    console.error('Error enrolling in training:', error);
    throw error;
  }
}

// Get volunteer's training progress
export async function getVolunteerTrainingProgress(volunteerId) {
  try {
    const q = query(
      collection(db, VOLUNTEER_TRAININGS_COLLECTION),
      where('volunteerId', '==', volunteerId)
    );
    const querySnapshot = await getDocs(q);
    
    const enrollments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get volunteer's current level
    const completedModules = enrollments.filter(e => e.status === 'completed');
    const currentLevel = calculateVolunteerLevel(completedModules);
    
    return {
      enrollments,
      completedModules,
      currentLevel,
      totalModules: TRAINING_MODULES.length,
      completedCount: completedModules.length
    };
  } catch (error) {
    console.error('Error getting volunteer training progress:', error);
    throw error;
  }
}

// Update training progress
export async function updateTrainingProgress(volunteerId, moduleId, progressData) {
  try {
    const enrollmentRef = doc(db, VOLUNTEER_TRAININGS_COLLECTION, `${volunteerId}_${moduleId}`);
    
    await updateDoc(enrollmentRef, {
      ...progressData,
      lastAccessedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating training progress:', error);
    throw error;
  }
}

// Complete a training module
export async function completeTrainingModule(volunteerId, moduleId, quizScore) {
  try {
    const module = await getTrainingModule(moduleId);
    const passingScore = module.content.quiz.passingScore;
    
    const enrollmentRef = doc(db, VOLUNTEER_TRAININGS_COLLECTION, `${volunteerId}_${moduleId}`);
    
    const status = quizScore >= passingScore ? 'completed' : 'failed';
    
    await updateDoc(enrollmentRef, {
      status,
      progress: 100,
      completedAt: serverTimestamp(),
      quizScore,
      passed: quizScore >= passingScore,
      updatedAt: serverTimestamp()
    });
    
    // Update volunteer's overall progress
    await updateVolunteerLevel(volunteerId);
    
    return { 
      success: true, 
      passed: quizScore >= passingScore,
      message: quizScore >= passingScore ? 'Training completed successfully!' : 'Training failed. Please retake the quiz.'
    };
  } catch (error) {
    console.error('Error completing training module:', error);
    throw error;
  }
}

// Update volunteer's level based on completed trainings
export async function updateVolunteerLevel(volunteerId) {
  try {
    const progress = await getVolunteerTrainingProgress(volunteerId);
    const newLevel = progress.currentLevel;
    
    const volunteerRef = doc(db, 'user_profiles', volunteerId);
    await updateDoc(volunteerRef, {
      volunteerLevel: newLevel.level,
      volunteerLevelName: newLevel.name,
      lastLevelUpdate: serverTimestamp()
    });
    
    return newLevel;
  } catch (error) {
    console.error('Error updating volunteer level:', error);
    throw error;
  }
}

// Get training statistics for admin
export async function getTrainingStatistics() {
  try {
    const q = query(collection(db, VOLUNTEER_TRAININGS_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    const enrollments = querySnapshot.docs.map(doc => doc.data());
    
    const stats = {
      totalEnrollments: enrollments.length,
      completed: enrollments.filter(e => e.status === 'completed').length,
      inProgress: enrollments.filter(e => e.status === 'in_progress').length,
      failed: enrollments.filter(e => e.status === 'failed').length,
      enrolled: enrollments.filter(e => e.status === 'enrolled').length
    };
    
    // Calculate completion rate
    stats.completionRate = stats.totalEnrollments > 0 
      ? (stats.completed / stats.totalEnrollments) * 100 
      : 0;
    
    return stats;
  } catch (error) {
    console.error('Error getting training statistics:', error);
    throw error;
  }
}

// Get volunteers by level
export async function getVolunteersByLevel(level) {
  try {
    const q = query(
      collection(db, 'user_profiles'),
      where('userType', '==', 'volunteer'),
      where('volunteerLevel', '==', level)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting volunteers by level:', error);
    throw error;
  }
}

// Reset volunteer training progress (admin only)
export async function resetVolunteerTraining(volunteerId) {
  try {
    const q = query(
      collection(db, VOLUNTEER_TRAININGS_COLLECTION),
      where('volunteerId', '==', volunteerId)
    );
    const querySnapshot = await getDocs(q);
    
    const batch = [];
    querySnapshot.docs.forEach(doc => {
      batch.push(updateDoc(doc.ref, {
        status: 'enrolled',
        progress: 0,
        currentSection: 0,
        quizAttempts: 0,
        completedAt: null,
        quizScore: null,
        passed: false,
        updatedAt: serverTimestamp()
      }));
    });
    
    await Promise.all(batch);
    
    // Reset volunteer level
    const volunteerRef = doc(db, 'user_profiles', volunteerId);
    await updateDoc(volunteerRef, {
      volunteerLevel: 0,
      volunteerLevelName: 'Trainee',
      lastLevelUpdate: serverTimestamp()
    });
    
    return { success: true, message: 'Training progress reset successfully' };
  } catch (error) {
    console.error('Error resetting volunteer training:', error);
    throw error;
  }
}
