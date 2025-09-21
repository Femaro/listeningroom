"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award, 
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { 
  getAllTrainingModules, 
  getTrainingStatistics,
  getVolunteersByLevel,
  initializeTrainingModules,
  resetVolunteerTraining
} from "@/utils/trainingService";

export default function TrainingManagement() {
  const [modules, setModules] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [volunteersByLevel, setVolunteersByLevel] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [modulesData, statsData] = await Promise.all([
        getAllTrainingModules(),
        getTrainingStatistics()
      ]);
      
      setModules(modulesData);
      setStatistics(statsData);
      
      // Load volunteers by level
      const levelData = {};
      for (let i = 0; i <= 3; i++) {
        const volunteers = await getVolunteersByLevel(i);
        levelData[i] = volunteers;
      }
      setVolunteersByLevel(levelData);
    } catch (err) {
      setError("Failed to load training data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeModules = async () => {
    try {
      await initializeTrainingModules();
      await loadData();
      alert("Training modules initialized successfully!");
    } catch (err) {
      alert("Failed to initialize training modules");
      console.error(err);
    }
  };

  const handleResetVolunteer = async (volunteerId) => {
    if (confirm("Are you sure you want to reset this volunteer's training progress?")) {
      try {
        await resetVolunteerTraining(volunteerId);
        await loadData();
        alert("Volunteer training progress reset successfully!");
      } catch (err) {
        alert("Failed to reset volunteer training");
        console.error(err);
      }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Training Management</h2>
          <p className="text-gray-600">Manage volunteer training modules and track progress</p>
        </div>
        <button
          onClick={handleInitializeModules}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2 inline" />
          Initialize Modules
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "modules", label: "Training Modules", icon: BookOpen },
            { id: "volunteers", label: "Volunteer Levels", icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && statistics && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalEnrollments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.inProgress}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.completionRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Chart Placeholder */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Progress Over Time</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === "modules" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Training Modules</h3>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
              <Plus className="w-4 h-4 mr-2 inline" />
              Add Module
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <div key={module.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-${module.color}-100 rounded-lg flex items-center justify-center`}>
                    <BookOpen className={`w-6 h-6 text-${module.color}-600`} />
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 mb-2">{module.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{module.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    {module.duration} minutes
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Award className="w-4 h-4 mr-2" />
                    Level {module.level}
                  </div>
                  {module.required && (
                    <div className="flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Required
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Volunteers Tab */}
      {activeTab === "volunteers" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Volunteers by Level</h3>
          
          <div className="space-y-4">
            {Object.entries(volunteersByLevel).map(([level, volunteers]) => (
              <div key={level} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Level {level}: {getLevelName(parseInt(level))}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {volunteers.length} volunteers
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{volunteers.length}</div>
                  </div>
                </div>

                {volunteers.length > 0 && (
                  <div className="space-y-2">
                    {volunteers.slice(0, 5).map((volunteer) => (
                      <div key={volunteer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{volunteer.displayName || volunteer.email}</p>
                          <p className="text-sm text-gray-600">{volunteer.email}</p>
                        </div>
                        <button
                          onClick={() => handleResetVolunteer(volunteer.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Reset Training
                        </button>
                      </div>
                    ))}
                    {volunteers.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        And {volunteers.length - 5} more...
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getLevelName(level) {
  const levels = ["Trainee", "Basic Volunteer", "Advanced Volunteer", "Expert Volunteer"];
  return levels[level] || "Unknown";
}
