"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageCircle,
  Calendar,
  Globe,
  FileText,
  Award,
  Users,
  Filter,
  Search,
  RefreshCw
} from "lucide-react";

export default function TrainingApplicationsTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/training-applications');
      const result = await response.json();
      
      if (result.success) {
        setApplications(result.applications);
      } else {
        setError("Failed to load applications");
      }
    } catch (err) {
      setError("Failed to load applications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      const response = await fetch('/api/training-applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status,
          adminNotes: adminNotes || undefined
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status, adminNotes: adminNotes || app.adminNotes }
              : app
          )
        );
        setShowModal(false);
        setAdminNotes("");
        setSelectedApplication(null);
      } else {
        setError(result.error || "Failed to update application");
      }
    } catch (err) {
      setError("Failed to update application");
      console.error(err);
    }
  };

  const handleSelectApplication = (application) => {
    setSelectedApplication(application);
    setAdminNotes(application.adminNotes || "");
    setShowModal(true);
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === "all" || app.status === filter;
    const matchesSearch = searchTerm === "" || 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
          <h2 className="text-2xl font-bold text-gray-900">Training Applications</h2>
          <p className="text-gray-600">Review and manage training applications</p>
        </div>
        <button
          onClick={loadApplications}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4 mr-2 inline" />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Applications ({filteredApplications.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredApplications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No applications found
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{application.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {application.email}
                          </span>
                          {application.phone && (
                            <span className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {application.phone}
                            </span>
                          )}
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {application.city}, {application.country}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">
                          <strong>Background:</strong> {application.background.substring(0, 100)}...
                        </p>
                        <p className="text-gray-600 mt-1">
                          <strong>Motivation:</strong> {application.motivation.substring(0, 100)}...
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <strong>Training Goals:</strong> {application.trainingGoals.join(', ')}
                        </p>
                        <p className="text-gray-600 mt-1">
                          <strong>Languages:</strong> {application.preferredLanguages.join(', ')}
                        </p>
                      </div>
                    </div>
                    
                    {application.motivation && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Motivation:</strong> {application.motivation}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1">{application.status}</span>
                    </span>
                    
                    <button
                      onClick={() => handleSelectApplication(application)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Application Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Name:</strong> {selectedApplication.name}</p>
                      <p><strong>Email:</strong> {selectedApplication.email}</p>
                      <p><strong>Phone:</strong> {selectedApplication.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p><strong>Location:</strong> {selectedApplication.city}, {selectedApplication.country}</p>
                      <p><strong>Timezone:</strong> {selectedApplication.timezone}</p>
                      <p><strong>Submitted:</strong> {selectedApplication.submittedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Background */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Background & Experience</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Professional Background:</p>
                      <p className="text-gray-600">{selectedApplication.background}</p>
                    </div>
                    {selectedApplication.experience && (
                      <div>
                        <p className="font-medium text-gray-700">Previous Experience:</p>
                        <p className="text-gray-600">{selectedApplication.experience}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-700">Motivation:</p>
                      <p className="text-gray-600">{selectedApplication.motivation}</p>
                    </div>
                  </div>
                </div>
                
                {/* Training Preferences */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Training Preferences</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Training Goals:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedApplication.trainingGoals.map((goal, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Specializations:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedApplication.specializations.map((spec, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Preferred Languages:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedApplication.preferredLanguages.map((lang, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Admin Notes */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Admin Notes</h4>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this application..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                
                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
