"use client";

import { useState, useEffect } from "react";
import { 
  Upload, 
  FileText, 
  Edit, 
  Trash2, 
  Plus,
  Save,
  X,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { db } from "@/utils/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";

export default function TextBasedTrainingManagement() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = () => {
    const q = query(collection(db, "training_modules"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const modulesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setModules(modulesData);
    });

    return unsubscribe;
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const supportedFiles = files.filter(file => 
      file.type === 'text/plain' || 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.md') ||
      file.name.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    if (supportedFiles.length !== files.length) {
      setError("Please select only supported files (.txt, .md, .docx)");
      return;
    }
    
    setUploadedFiles(supportedFiles);
    setShowUploadModal(true);
    setError("");
  };

  const processTextFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');
        
        const module = {
          title: extractTitle(lines),
          description: extractDescription(lines),
          sections: extractSections(lines),
          duration: estimateDuration(content),
          level: extractLevel(lines),
          required: extractRequired(lines),
          content: content,
          fileName: file.name
        };
        
        resolve(module);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const processDocxFile = async (file) => {
    try {
      // Import mammoth dynamically to avoid SSR issues
      const mammoth = await import('mammoth');
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;
            const result = await mammoth.extractRawText({ arrayBuffer });
            const content = result.value;
            const lines = content.split('\n');
            
            const module = {
              title: extractTitle(lines),
              description: extractDescription(lines),
              sections: extractSections(lines),
              duration: estimateDuration(content),
              level: extractLevel(lines),
              required: extractRequired(lines),
              content: content,
              fileName: file.name
            };
            
            resolve(module);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    } catch (err) {
      throw new Error('Failed to load mammoth library for .docx processing');
    }
  };

  const extractTitle = (lines) => {
    const titleLine = lines.find(line => 
      line.startsWith('# ') || 
      line.startsWith('Title:') || 
      line.startsWith('Module:')
    );
    return titleLine ? titleLine.replace(/^[#\s]*[Tt]itle:?\s*/, '').replace(/^[#\s]*[Mm]odule:?\s*/, '').trim() : 'Untitled Module';
  };

  const extractDescription = (lines) => {
    const descLine = lines.find(line => 
      line.startsWith('Description:') || 
      line.startsWith('Overview:') ||
      line.startsWith('Summary:')
    );
    return descLine ? descLine.replace(/^[Dd]escription:?\s*/, '').replace(/^[Oo]verview:?\s*/, '').replace(/^[Ss]ummary:?\s*/, '').trim() : 'No description provided';
  };

  const extractSections = (lines) => {
    const sections = [];
    let currentSection = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('## ') || line.startsWith('### ') || line.match(/^\d+\./)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace(/^[#\s]*\d+\.\s*/, '').replace(/^[#\s]*/, '').trim(),
          content: '',
          type: 'text',
          completed: false
        };
      } else if (currentSection && line.length > 0) {
        currentSection.content += (currentSection.content ? '\n' : '') + line;
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections.length > 0 ? sections : [{
      title: 'Content',
      content: lines.join('\n'),
      type: 'text',
      completed: false
    }];
  };

  const estimateDuration = (content) => {
    const wordCount = content.split(/\s+/).length;
    return Math.max(5, Math.ceil(wordCount / 200));
  };

  const extractLevel = (lines) => {
    const levelLine = lines.find(line => 
      line.toLowerCase().includes('level') || 
      line.toLowerCase().includes('beginner') ||
      line.toLowerCase().includes('advanced')
    );
    
    if (levelLine) {
      if (levelLine.toLowerCase().includes('beginner') || levelLine.includes('1')) return 1;
      if (levelLine.toLowerCase().includes('intermediate') || levelLine.includes('2')) return 2;
      if (levelLine.toLowerCase().includes('advanced') || levelLine.includes('3')) return 3;
    }
    
    return 1;
  };

  const extractRequired = (lines) => {
    return lines.some(line => 
      line.toLowerCase().includes('required') || 
      line.toLowerCase().includes('mandatory')
    );
  };

  const uploadModules = async () => {
    try {
      setLoading(true);
      setError("");

      for (const file of uploadedFiles) {
        let module;
        
        if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          module = await processDocxFile(file);
        } else {
          module = await processTextFile(file);
        }
        
        await addDoc(collection(db, "training_modules"), {
          ...module,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active'
        });
      }
      
      setShowUploadModal(false);
      setUploadedFiles([]);
      alert("Training modules uploaded successfully!");
    } catch (err) {
      setError("Failed to upload modules: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteModule = async (moduleId) => {
    if (confirm("Are you sure you want to delete this training module?")) {
      try {
        await deleteDoc(doc(db, "training_modules", moduleId));
        alert("Module deleted successfully!");
      } catch (err) {
        setError("Failed to delete module");
      }
    }
  };

  const editModule = (module) => {
    setEditingModule(module);
    setShowEditModal(true);
  };

  const saveModule = async () => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "training_modules", editingModule.id), {
        ...editingModule,
        updatedAt: new Date()
      });
      setShowEditModal(false);
      setEditingModule(null);
      alert("Module updated successfully!");
    } catch (err) {
      setError("Failed to update module");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Text-Based Training Management</h2>
          <p className="text-gray-600">Upload and manage training modules from text and Word documents</p>
        </div>
        <div className="flex space-x-3">
          <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer font-medium">
            <Upload className="w-4 h-4 mr-2 inline" />
            Upload Training Files
            <input
              type="file"
              multiple
              accept=".txt,.md,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* Modules List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Training Modules ({modules.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {modules.map((module) => (
            <div key={module.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                      <FileText className="w-5 h-5 text-blue-600" />
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
                        <span className="text-gray-500">
                          {module.sections?.length || 0} sections
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{module.description}</p>
                  
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1 inline" />
                      Active
                    </span>
                    
                    {module.fileName && (
                      <span className="text-sm text-gray-500">
                        Source: {module.fileName}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => editModule(module)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                    title="Edit Module"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteModule(module.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                    title="Delete Module"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Upload Training Files
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Selected Files:</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">File Format Guidelines</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Supported formats:</strong> .txt, .md, .docx files</li>
                    <li>• Use clear section headers (## or ### or numbered lists)</li>
                    <li>• Include a title at the beginning of each file</li>
                    <li>• Add a description or overview section</li>
                    <li>• Specify level (beginner/intermediate/advanced) if applicable</li>
                    <li>• Mark as "required" if the module is mandatory</li>
                    <li>• For Word documents: Use heading styles for better structure</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadModules}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Upload Modules"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Edit Training Module
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module Title
                  </label>
                  <input
                    type="text"
                    value={editingModule.title}
                    onChange={(e) => setEditingModule({...editingModule, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingModule.description}
                    onChange={(e) => setEditingModule({...editingModule, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={editingModule.duration}
                      onChange={(e) => setEditingModule({...editingModule, duration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level
                    </label>
                    <select
                      value={editingModule.level}
                      onChange={(e) => setEditingModule({...editingModule, level: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>Beginner</option>
                      <option value={2}>Intermediate</option>
                      <option value={3}>Advanced</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingModule.required}
                    onChange={(e) => setEditingModule({...editingModule, required: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Required module
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveModule}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
