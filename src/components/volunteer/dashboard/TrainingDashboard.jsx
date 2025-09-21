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
  AlertCircle
} from "lucide-react";
import { 
  getAllTrainingModules, 
  getVolunteerTrainingProgress, 
  enrollVolunteerInTraining,
  completeTrainingModule 
} from "@/utils/trainingService";
import { VOLUNTEER_LEVELS } from "@/utils/trainingData";
import useFirebaseAuth from "@/utils/useFirebaseAuth";

export default function TrainingDashboard() {
  const { user } = useFirebaseAuth();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      loadTrainingData();
    }
  }, [user]);

  const loadTrainingData = async () => {
    try {
      setLoading(true);
      const [modulesData, progressData] = await Promise.all([
        getAllTrainingModules(),
        getVolunteerTrainingProgress(user.uid)
      ]);
      
      setModules(modulesData);
      setProgress(progressData);
    } catch (err) {
      setError("Failed to load training data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (moduleId) => {
    try {
      await enrollVolunteerInTraining(user.uid, moduleId);
      await loadTrainingData(); // Refresh data
    } catch (err) {
      setError("Failed to enroll in training");
      console.error(err);
    }
  };

  const getModuleStatus = (moduleId) => {
    if (!progress) return 'not_enrolled';
    
    const enrollment = progress.enrollments.find(e => e.moduleId === moduleId);
    return enrollment ? enrollment.status : 'not_enrolled';
  };

  const getModuleProgress = (moduleId) => {
    if (!progress) return 0;
    
    const enrollment = progress.enrollments.find(e => e.moduleId === moduleId);
    return enrollment ? enrollment.progress : 0;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Training Progress Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-blue-600" />
          Training Progress
        </h3>
        
        {progress && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {progress.completedCount}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {progress.totalModules}
              </div>
              <div className="text-sm text-gray-600">Total Modules</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {progress.currentLevel.name}
              </div>
              <div className="text-sm text-gray-600">Current Level</div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {progress && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.completedCount / progress.totalModules) * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Current Level Info */}
      {progress && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-600" />
            Current Level: {progress.currentLevel.name}
          </h3>
          <p className="text-gray-600 mb-4">{progress.currentLevel.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {progress.currentLevel.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Next Level Requirements:</h4>
              <p className="text-sm text-gray-600">
                Complete all required training modules to advance to the next level.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Training Modules */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
          Training Modules
        </h3>
        
        <div className="space-y-4">
          {modules.map((module) => {
            const status = getModuleStatus(module.id);
            const moduleProgress = getModuleProgress(module.id);
            
            return (
              <div key={module.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-${module.color}-100`}>
                        <BookOpen className={`w-5 h-5 text-${module.color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{module.title}</h4>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {module.duration} minutes
                          <span className="mx-2">•</span>
                          Level {module.level}
                          {module.required && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-red-600 font-medium">Required</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{module.description}</p>
                    
                    {/* Progress Bar for in-progress modules */}
                    {status === 'in_progress' && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${moduleProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status.replace('_', ' ').toUpperCase()}
                    </span>
                    
                    {status === 'not_enrolled' && (
                      <button
                        onClick={() => handleEnroll(module.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                      >
                        Enroll
                      </button>
                    )}
                    
                    {status === 'enrolled' && (
                      <button
                        onClick={() => {/* Navigate to training */}}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                      >
                        Start
                      </button>
                    )}
                    
                    {status === 'in_progress' && (
                      <button
                        onClick={() => {/* Navigate to training */}}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                      >
                        Continue
                      </button>
                    )}
                    
                    {status === 'failed' && (
                      <button
                        onClick={() => {/* Retake training */}}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                      >
                        Retake
                      </button>
                    )}
                    
                    {status === 'completed' && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
