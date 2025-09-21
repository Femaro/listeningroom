"use client";

import { useState, useEffect } from "react";
import { 
  Upload, 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  Edit, 
  Eye,
  Video,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus
} from "lucide-react";
import { videoGenerationService, videoManagementService } from "@/utils/videoGenerationService";
import { TRAINING_MODULES } from "@/utils/trainingData";

export default function VideoManagement() {
  const [modules, setModules] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedModule, setSelectedModule] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    loadModules();
    loadVideos();
  }, []);

  const loadModules = () => {
    setModules(TRAINING_MODULES);
  };

  const loadVideos = async () => {
    try {
      const videoData = await videoManagementService.getAllVideos();
      setVideos(videoData);
    } catch (err) {
      setError("Failed to load videos");
      console.error(err);
    }
  };

  const generateVideo = async (module) => {
    try {
      setLoading(true);
      setError("");

      // Generate video using AI service
      const result = await videoGenerationService.generateTrainingVideo(module);
      
      if (result.success) {
        // Store video metadata
        await videoManagementService.storeVideoMetadata(module.id, result);
        await loadVideos();
        alert(`Video generated successfully for ${module.title}`);
      } else {
        setError(result.error || "Failed to generate video");
      }
    } catch (err) {
      setError("Failed to generate video");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAllVideos = async () => {
    try {
      setLoading(true);
      setError("");

      for (const module of modules) {
        const videoStatus = getVideoStatus(module.id);
        if (videoStatus === 'not_created') {
          await generateVideo(module);
          // Add delay between generations to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      alert("All videos have been generated successfully!");
    } catch (err) {
      setError("Failed to generate all videos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async (moduleId, file) => {
    try {
      setLoading(true);
      setError("");

      // Create video URL (in real implementation, upload to cloud storage)
      const videoUrl = URL.createObjectURL(file);
      
      // Store video metadata
      await videoManagementService.storeVideoMetadata(moduleId, {
        videoUrl,
        duration: 0, // Would be calculated from actual video
        thumbnail: null,
        status: 'ready'
      });
      
      await loadVideos();
      alert("Video uploaded successfully");
    } catch (err) {
      setError("Failed to upload video");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (moduleId) => {
    if (confirm("Are you sure you want to delete this video?")) {
      try {
        // In real implementation, delete from cloud storage
        await videoManagementService.updateVideoStatus(moduleId, 'deleted');
        await loadVideos();
        alert("Video deleted successfully");
      } catch (err) {
        setError("Failed to delete video");
        console.error(err);
      }
    }
  };

  const playVideo = (video) => {
    setSelectedModule(video);
    setVideoUrl(video.videoUrl);
    setShowVideoModal(true);
  };

  const getVideoStatus = (moduleId) => {
    const video = videos.find(v => v.moduleId === moduleId);
    return video ? video.status : 'not_created';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Video className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Training Video Management</h2>
          <p className="text-gray-600">Generate and manage training videos for modules</p>
        </div>
        <button
          onClick={loadVideos}
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

      {/* Video Generation Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Generation Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">AI Generated Videos</h4>
            <p className="text-sm text-gray-600 mb-3">
              Automatically generate videos from text content using AI
            </p>
            <button
              onClick={() => generateAllVideos()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Generate All Videos
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Manual Upload</h4>
            <p className="text-sm text-gray-600 mb-3">
              Upload pre-recorded videos for each module
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
            >
              Upload Videos
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">External Services</h4>
            <p className="text-sm text-gray-600 mb-3">
              Use Lumen5, Synthesia, or other video creation services
            </p>
            <button
              onClick={() => setShowServicesModal(true)}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
            >
              Configure Services
            </button>
          </div>
        </div>
      </div>

      {/* Training Modules with Video Status */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Training Modules ({modules.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {modules.map((module) => {
            const videoStatus = getVideoStatus(module.id);
            const video = videos.find(v => v.moduleId === module.id);
            
            return (
              <div key={module.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${module.color}-100`}>
                        <Video className={`w-5 h-5 text-${module.color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{module.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {module.duration} minutes
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            Level {module.level}
                          </span>
                          {module.required && (
                            <span className="text-red-600 font-medium">Required</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{module.description}</p>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(videoStatus)}`}>
                        {getStatusIcon(videoStatus)}
                        <span className="ml-1">
                          {videoStatus === 'not_created' ? 'No Video' : videoStatus}
                        </span>
                      </span>
                      
                      {video && (
                        <span className="text-sm text-gray-500">
                          Duration: {video.duration || 'Unknown'} min
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {videoStatus === 'ready' && video && (
                      <button
                        onClick={() => playVideo(video)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="Play Video"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => generateVideo(module)}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      {videoStatus === 'not_created' ? 'Generate' : 'Regenerate'}
                    </button>
                    
                    {videoStatus === 'ready' && (
                      <button
                        onClick={() => deleteVideo(module.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                        title="Delete Video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedModule.title}
                </h3>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-full"
                  src={videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {/* Download video */}}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2 inline" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
