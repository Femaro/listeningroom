"use client";

import { useState } from "react";
import { 
  Upload, 
  FileText, 
  Video, 
  X, 
  CheckCircle,
  AlertCircle,
  Clock,
  Download
} from "lucide-react";

export default function TextToVideoUploader({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [error, setError] = useState("");

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const textFiles = selectedFiles.filter(file => 
      file.type === 'text/plain' || 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.md')
    );
    
    if (textFiles.length !== selectedFiles.length) {
      setError("Please select only text files (.txt, .md)");
      return;
    }
    
    setFiles(prev => [...prev, ...textFiles]);
    setError("");
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processTextFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');
        
        // Parse the text content to extract training module structure
        const module = {
          title: extractTitle(lines),
          description: extractDescription(lines),
          sections: extractSections(lines),
          duration: estimateDuration(content),
          level: extractLevel(lines),
          required: extractRequired(lines)
        };
        
        resolve(module);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const extractTitle = (lines) => {
    // Look for title patterns
    const titleLine = lines.find(line => 
      line.startsWith('# ') || 
      line.startsWith('Title:') || 
      line.startsWith('Module:')
    );
    return titleLine ? titleLine.replace(/^[#\s]*[Tt]itle:?\s*/, '').replace(/^[#\s]*[Mm]odule:?\s*/, '').trim() : 'Untitled Module';
  };

  const extractDescription = (lines) => {
    // Look for description patterns
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
      
      // Look for section headers
      if (line.startsWith('## ') || line.startsWith('### ') || line.match(/^\d+\./)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace(/^[#\s]*\d+\.\s*/, '').replace(/^[#\s]*/, '').trim(),
          content: '',
          type: 'text'
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
      type: 'text'
    }];
  };

  const estimateDuration = (content) => {
    // Estimate duration based on content length (roughly 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    return Math.max(5, Math.ceil(wordCount / 200));
  };

  const extractLevel = (lines) => {
    // Look for level indicators
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
    
    return 1; // Default to level 1
  };

  const extractRequired = (lines) => {
    // Look for required indicators
    return lines.some(line => 
      line.toLowerCase().includes('required') || 
      line.toLowerCase().includes('mandatory')
    );
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError("Please select at least one file");
      return;
    }

    setUploading(true);
    setError("");
    const results = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(prev => ({ ...prev, [i]: 'processing' }));

        try {
          const module = await processTextFile(file);
          
          // Here you would typically:
          // 1. Generate video from the text content
          // 2. Upload to your video storage service
          // 3. Save metadata to database
          
          // For now, we'll simulate the process
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          results.push({
            fileName: file.name,
            module,
            status: 'success',
            videoUrl: `#generated-video-${i}` // Placeholder
          });
          
          setProgress(prev => ({ ...prev, [i]: 'completed' }));
        } catch (fileError) {
          results.push({
            fileName: file.name,
            status: 'error',
            error: fileError.message
          });
          setProgress(prev => ({ ...prev, [i]: 'error' }));
        }
      }

      onUploadComplete?.(results);
      setFiles([]);
      setProgress({});
    } catch (error) {
      setError("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          multiple
          accept=".txt,.md"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center space-y-4"
        >
          <Upload className="w-12 h-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-900">
              Upload Training Text Files
            </p>
            <p className="text-sm text-gray-600">
              Select .txt or .md files containing your training content
            </p>
          </div>
          <button
            type="button"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Choose Files
          </button>
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Selected Files ({files.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {files.map((file, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(progress[index] || 'pending')}
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${getStatusColor(progress[index] || 'pending')}`}>
                    {progress[index] || 'Ready'}
                  </span>
                  
                  {!uploading && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={uploadFiles}
            disabled={uploading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>Generate Videos</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">File Format Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use clear section headers (## or ### or numbered lists)</li>
          <li>• Include a title at the beginning of each file</li>
          <li>• Add a description or overview section</li>
          <li>• Specify level (beginner/intermediate/advanced) if applicable</li>
          <li>• Mark as "required" if the module is mandatory</li>
        </ul>
      </div>
    </div>
  );
}
