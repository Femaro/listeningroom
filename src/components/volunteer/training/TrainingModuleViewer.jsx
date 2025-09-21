"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  PlayCircle,
  PauseCircle,
  RotateCcw
} from "lucide-react";
import { 
  getTrainingModule, 
  updateTrainingProgress, 
  completeTrainingModule 
} from "@/utils/trainingService";
import useFirebaseAuth from "@/utils/useFirebaseAuth";

export default function TrainingModuleViewer({ moduleId, onComplete, onClose }) {
  const { user } = useFirebaseAuth();
  const [module, setModule] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    if (moduleId) {
      loadModule();
    }
  }, [moduleId]);

  const loadModule = async () => {
    try {
      setLoading(true);
      const moduleData = await getTrainingModule(moduleId);
      setModule(moduleData);
    } catch (err) {
      setError("Failed to load training module");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (newProgress, newSection) => {
    try {
      await updateTrainingProgress(user.uid, moduleId, {
        progress: newProgress,
        currentSection: newSection,
        status: newProgress === 100 ? 'completed' : 'in_progress'
      });
      setProgress(newProgress);
      setCurrentSection(newSection);
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const handleNext = () => {
    if (!module) return;
    
    const newSection = currentSection + 1;
    const newProgress = ((newSection + 1) / (module.content.sections.length + 1)) * 100;
    
    if (newSection >= module.content.sections.length) {
      // Move to quiz
      setIsQuizMode(true);
      updateProgress(90, currentSection);
    } else {
      updateProgress(newProgress, newSection);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      const newSection = currentSection - 1;
      const newProgress = ((newSection + 1) / (module.content.sections.length + 1)) * 100;
      updateProgress(newProgress, newSection);
    }
  };

  const handleQuizAnswer = (questionId, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleQuizSubmit = async () => {
    if (!module) return;
    
    const questions = module.content.quiz.questions;
    const correctAnswers = questions.filter(q => 
      quizAnswers[q.id] === q.correct
    ).length;
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    
    try {
      const result = await completeTrainingModule(user.uid, moduleId, score);
      if (result.success) {
        updateProgress(100, currentSection);
        setTimeout(() => {
          onComplete?.(result);
        }, 2000);
      }
    } catch (err) {
      setError("Failed to submit quiz");
      console.error(err);
    }
  };

  const handleRetake = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setIsQuizMode(false);
    setCurrentSection(0);
    updateProgress(0, 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <p>{error || "Module not found"}</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentSectionData = module.content.sections[currentSection];
  const isLastSection = currentSection >= module.content.sections.length - 1;
  const canProceed = !isQuizMode || (isQuizMode && Object.keys(quizAnswers).length === module.content.quiz.questions.length);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{module.title}</h2>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {module.duration} minutes
              <span className="mx-2">•</span>
              Level {module.level}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">Progress</div>
          <div className="text-lg font-semibold text-blue-600">{Math.round(progress)}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Content */}
      {!isQuizMode ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Section {currentSection + 1}: {currentSectionData.title}
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {currentSectionData.content}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
            
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              {isLastSection ? "Take Quiz" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quiz: {module.title}</h3>
            <p className="text-gray-600">
              Answer all questions to complete this training module. You need {module.content.quiz.passingScore}% to pass.
            </p>
          </div>

          {!quizSubmitted ? (
            <div className="space-y-6">
              {module.content.quiz.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {index + 1}. {question.question}
                  </h4>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={optionIndex}
                          checked={quizAnswers[question.id] === optionIndex}
                          onChange={() => handleQuizAnswer(question.id, optionIndex)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-center pt-6 border-t border-gray-200">
                <button
                  onClick={handleQuizSubmit}
                  disabled={!canProceed}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                quizScore >= module.content.quiz.passingScore 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                <CheckCircle className={`w-8 h-8 ${
                  quizScore >= module.content.quiz.passingScore 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`} />
              </div>
              
              <div>
                <h3 className={`text-xl font-semibold ${
                  quizScore >= module.content.quiz.passingScore 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {quizScore >= module.content.quiz.passingScore ? 'Congratulations!' : 'Quiz Failed'}
                </h3>
                <p className="text-gray-600 mt-2">
                  You scored {quizScore}% 
                  {quizScore >= module.content.quiz.passingScore 
                    ? ' and passed the quiz!' 
                    : `. You need ${module.content.quiz.passingScore}% to pass.`
                  }
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                {quizScore < module.content.quiz.passingScore && (
                  <button
                    onClick={handleRetake}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
