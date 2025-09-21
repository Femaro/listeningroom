"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  Award, 
  TrendingUp,
  Users,
  Star,
  AlertCircle,
  FileText,
  Upload
} from "lucide-react";
import { db } from "@/utils/firebase";
import { collection, query, onSnapshot, orderBy, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import useFirebaseAuth from "@/utils/useFirebaseAuth";
import TextBasedTrainingViewer from "@/components/volunteer/training/TextBasedTrainingViewer";

export default function TextBasedTrainingDashboard() {
  const { user } = useFirebaseAuth();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    if (user) {
      loadTrainingData();
    }
  }, [user]);

  const loadTrainingData = async () => {
    try {
      setLoading(true);
      
      // Load training modules
      const modulesQuery = query(collection(db, "training_modules"), orderBy("createdAt", "desc"));
      const unsubscribeModules = onSnapshot(modulesQuery, (snapshot) => {
        const modulesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setModules(modulesData);
      });

      // Load user progress
      if (user) {
        const progressQuery = query(collection(db, "training_progress"), orderBy("lastUpdated", "desc"));
        const unsubscribeProgress = onSnapshot(progressQuery, (snapshot) => {
          const progressData = {};
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.userId === user.uid) {
              progressData[data.moduleId] = data;
            }
          });
          setProgress(progressData);
        });

        return () => {
          unsubscribeModules();
          unsubscribeProgress();
        };
      }
    } catch (err) {
      setError("Failed to load training data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startModule = (moduleId) => {
    setSelectedModule(moduleId);
  };

  const completeModule = async (moduleId) => {
    try {
      await setDoc(doc(db, "training_progress", `${user.uid}_${moduleId}`), {
        userId: user.uid,
        moduleId: moduleId,
        completed: true,
        completedAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      setSelectedModule(null);
      alert("Congratulations! You've completed this training module.");
    } catch (err) {
      console.error("Failed to complete module:", err);
    }
  };

  const getModuleProgress = (moduleId) => {
    return progress[moduleId] || {};
  };

  const getCompletedModules = () => {
    return Object.values(progress).filter(p => p.completed).length;
  };

  const getTotalSections = () => {
    return modules.reduce((total, module) => total + (module.sections?.length || 0), 0);
  };

  const getCompletedSections = () => {
    return Object.values(progress).reduce((total, moduleProgress) => {
      if (moduleProgress.sections) {
        return total + Object.values(moduleProgress.sections).filter(Boolean).length;
      }
      return total;
    }, 0);
  };

  if (selectedModule) {
    return (
      <TextBasedTrainingViewer
        moduleId={selectedModule}
        onComplete={() => completeModule(selectedModule)}
        onBack={() => setSelectedModule(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl">Loading training modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Training Center</h1>
        <p className="text-gray-600 text-lg">Complete training modules to enhance your volunteering skills</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Modules</p>
              <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{getCompletedModules()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sections</p>
              <p className="text-2xl font-bold text-gray-900">{getCompletedSections()}/{getTotalSections()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Level</p>
              <p className="text-2xl font-bold text-gray-900">
                {getCompletedModules() >= 5 ? "Expert" : 
                 getCompletedModules() >= 3 ? "Advanced" : 
                 getCompletedModules() >= 1 ? "Intermediate" : "Beginner"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Training Modules */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Training Modules</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {modules.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Modules Available</h3>
              <p className="text-gray-600">Check back later for new training content.</p>
            </div>
          ) : (
            modules.map((module) => {
              const moduleProgress = getModuleProgress(module.id);
              const isCompleted = moduleProgress.completed;
              const completedSections = moduleProgress.sections ? 
                Object.values(moduleProgress.sections).filter(Boolean).length : 0;
              const totalSections = module.sections?.length || 0;
              const progressPercentage = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

              return (
                <div key={module.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{module.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {module.duration} minutes
                            </span>
                            <span className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              Level {module.level}
                            </span>
                            <span className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {totalSections} sections
                            </span>
                            {module.required && (
                              <span className="text-red-600 font-medium">Required</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{module.description}</p>
                      
                      {/* Progress Bar */}
                      {totalSections > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm text-gray-600">
                              {completedSections}/{totalSections} sections
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isCompleted ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        {isCompleted ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            <CheckCircle className="w-4 h-4 mr-1 inline" />
                            Completed
                          </span>
                        ) : completedSections > 0 ? (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            <PlayCircle className="w-4 h-4 mr-1 inline" />
                            In Progress
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                            <BookOpen className="w-4 h-4 mr-1 inline" />
                            Not Started
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => startModule(module.id)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                      >
                        {isCompleted ? 'Review' : completedSections > 0 ? 'Continue' : 'Start'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
