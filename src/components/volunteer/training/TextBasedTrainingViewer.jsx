"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  ArrowLeft, 
  ArrowRight,
  FileText,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { db } from "@/utils/firebase";
import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import useFirebaseAuth from "@/utils/useFirebaseAuth";

export default function TextBasedTrainingViewer({ moduleId, onComplete, onBack }) {
  const { user } = useFirebaseAuth();
  const [module, setModule] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    loadModule();
    loadProgress();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      const moduleDoc = await getDoc(doc(db, "training_modules", moduleId));
      if (moduleDoc.exists()) {
        setModule(moduleDoc.data());
      } else {
        setError("Module not found");
      }
    } catch (err) {
      setError("Failed to load module");
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    if (!user) return;
    
    try {
      const progressDoc = await getDoc(doc(db, "training_progress", `${user.uid}_${moduleId}`));
      if (progressDoc.exists()) {
        setProgress(progressDoc.data());
      }
    } catch (err) {
      console.error("Failed to load progress:", err);
    }
  };

  const updateSectionProgress = async (sectionIndex, completed) => {
    if (!user) return;
    
    try {
      const newProgress = {
        ...progress,
        sections: {
          ...progress.sections,
          [sectionIndex]: completed
        },
        lastUpdated: serverTimestamp()
      };
      
      await setDoc(doc(db, "training_progress", `${user.uid}_${moduleId}`), newProgress, { merge: true });
      setProgress(newProgress);
      
      // Check if all sections are completed
      const allSectionsCompleted = module.sections.every((_, index) => newProgress.sections?.[index]);
      if (allSectionsCompleted) {
        await markModuleComplete();
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const markModuleComplete = async () => {
    try {
      await setDoc(doc(db, "training_progress", `${user.uid}_${moduleId}`), {
        completed: true,
        completedAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      onComplete?.();
    } catch (err) {
      console.error("Failed to mark module complete:", err);
    }
  };

  const startReading = () => {
    setIsReading(true);
    setReadingProgress(0);
    
    // Simulate reading progress
    const interval = setInterval(() => {
      setReadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReading(false);
          updateSectionProgress(currentSection, true);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
  };

  const nextSection = () => {
    if (currentSection < module.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setReadingProgress(0);
      setIsReading(false);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setReadingProgress(0);
      setIsReading(false);
    }
  };

  const resetSection = () => {
    setReadingProgress(0);
    setIsReading(false);
    updateSectionProgress(currentSection, false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl">Loading training module...</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error || "Module not found"}</div>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Training
          </button>
        </div>
      </div>
    );
  }

  const currentSectionData = module.sections[currentSection];
  const isSectionCompleted = progress.sections?.[currentSection];
  const completedSections = Object.values(progress.sections || {}).filter(Boolean).length;
  const totalSections = module.sections.length;
  const progressPercentage = (completedSections / totalSections) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
                <p className="text-gray-600">{module.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1 inline" />
                {module.duration} min
              </div>
              <div className="text-sm text-gray-600">
                Level {module.level}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Progress</h2>
            <span className="text-sm text-gray-600">
              {completedSections} of {totalSections} sections completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {module.sections.map((section, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSection(index);
                  setReadingProgress(0);
                  setIsReading(false);
                }}
                className={`p-3 rounded-lg text-left transition-colors ${
                  index === currentSection
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : progress.sections?.[index]
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">
                    Section {index + 1}
                  </span>
                  {progress.sections?.[index] && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {section.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Section Content */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Section {currentSection + 1}: {currentSectionData.title}
              </h2>
              {isSectionCompleted && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-1 inline" />
                  Completed
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Reading Progress */}
            {isReading && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Reading Progress</span>
                  <span className="text-sm text-gray-600">{readingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${readingProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {currentSectionData.content}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={prevSection}
                  disabled={currentSection === 0}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
                
                <button
                  onClick={nextSection}
                  disabled={currentSection === module.sections.length - 1}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>

              <div className="flex space-x-3">
                {!isSectionCompleted && (
                  <>
                    <button
                      onClick={resetSection}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </button>
                    
                    <button
                      onClick={startReading}
                      disabled={isReading}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isReading ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Reading...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Reading
                        </>
                      )}
                    </button>
                  </>
                )}
                
                {isSectionCompleted && (
                  <button
                    onClick={() => {
                      if (currentSection === module.sections.length - 1) {
                        markModuleComplete();
                      } else {
                        nextSection();
                      }
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {currentSection === module.sections.length - 1 ? 'Complete Module' : 'Next Section'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
