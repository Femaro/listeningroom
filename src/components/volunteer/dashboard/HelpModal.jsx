export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Volunteer Help & Support
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Getting Started
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                1. Toggle your availability to "Online" to receive session
                requests
              </p>
              <p>2. Create scheduled sessions for seekers to book in advance</p>
              <p>
                3. Complete required training modules to unlock all features
              </p>
              <p>
                4. Respond to session requests within 2 minutes when available
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Best Practices</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                • Always maintain confidentiality and professional boundaries
              </p>
              <p>• Listen actively without judgment or giving direct advice</p>
              <p>• Guide seekers to professional help when appropriate</p>
              <p>• Take breaks and practice self-care regularly</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Emergency Situations
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium text-sm mb-2">
                If a seeker expresses thoughts of self-harm or immediate danger:
              </p>
              <div className="space-y-1 text-sm text-red-700">
                <p>
                  • Encourage them to contact emergency services immediately
                </p>
                <p>• Provide crisis hotline numbers for their location</p>
                <p>
                  • Stay with them until they connect with professional help
                </p>
                <p>• Report the incident to our platform administrators</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <a
              href="/volunteer-guide"
              className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-center hover:bg-emerald-700 transition-colors"
            >
              Volunteer Guide
            </a>
            <a
              href="/training"
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium text-center hover:bg-gray-700 transition-colors"
            >
              Training Modules
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
