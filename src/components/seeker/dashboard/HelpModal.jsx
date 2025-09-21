"use client";

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Help & Support</h2>
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
              How to get started
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Click "Begin Session" to connect with a volunteer</p>
              <p>2. You'll be matched with an available listener</p>
              <p>3. Start chatting - your first 5 minutes are free</p>
              <p>4. End the session anytime you're ready</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Privacy & Safety
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• All conversations are completely confidential</p>
              <p>• Our volunteers are trained and verified</p>
              <p>• You can end any conversation at any time</p>
              <p>• We don't store your chat messages</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Emergency Resources
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium text-sm mb-2">
                If you're in immediate danger or having thoughts of self-harm:
              </p>
              <div className="space-y-1 text-sm text-red-700">
                <p>• Call emergency services (911, 999, etc.)</p>
                <p>• Contact your local crisis hotline</p>
                <p>• Visit your nearest emergency room</p>
                <p>• Reach out to a trusted friend or family member</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <a
              href="/crisis-resources"
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-center hover:bg-red-700 transition-colors"
            >
              Crisis Resources
            </a>
            <a
              href="/how-it-works"
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium text-center hover:bg-gray-700 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
