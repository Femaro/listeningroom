"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, ExternalLink, X, Mail, Copy, Eye, EyeOff } from "lucide-react";

export default function ResendSetupBanner() {
  const [setupStatus, setSetupStatus] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkResendSetup();
    
    // Check if user previously dismissed this banner
    const isDismissed = localStorage.getItem('resend-setup-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const checkResendSetup = async () => {
    try {
      const response = await fetch('/api/deployment-check');
      const data = await response.json();
      setSetupStatus(data.checks?.email);
    } catch (error) {
      console.error('Failed to check Resend setup:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissBanner = () => {
    setDismissed(true);
    localStorage.setItem('resend-setup-dismissed', 'true');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  // Don't show if loading, dismissed, or already properly configured
  if (loading || dismissed || setupStatus?.status === 'success') {
    return null;
  }

  const isApiKeyMissing = !setupStatus?.details?.apiKey;
  const hasUnverifiedDomains = setupStatus?.details?.domains?.length > 0 && 
                               setupStatus?.details?.verifiedDomains?.length === 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Complete Resend Email Setup
              </h3>
              {isApiKeyMissing ? (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              ) : hasUnverifiedDomains ? (
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            <p className="text-gray-600 mb-3">
              {isApiKeyMissing 
                ? "Your Resend API key is not configured. Email notifications won't work until this is set up."
                : hasUnverifiedDomains
                ? "Your domain needs verification to send emails reliably."
                : "Resend is configured but needs final verification."
              }
            </p>

            {/* Quick Status */}
            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <div className="flex items-center space-x-1">
                {setupStatus?.details?.apiKey ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span className={setupStatus?.details?.apiKey ? "text-green-700" : "text-red-700"}>
                  API Key {setupStatus?.details?.apiKey ? "Configured" : "Missing"}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                {setupStatus?.details?.verifiedDomains?.length > 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span className={setupStatus?.details?.verifiedDomains?.length > 0 ? "text-green-700" : "text-red-700"}>
                  Domain {setupStatus?.details?.verifiedDomains?.length > 0 ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>

            {/* Setup Steps */}
            <div className="space-y-3">
              {isApiKeyMissing && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">1</span>
                    Get your Resend API Key
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      1. Visit{" "}
                      <a 
                        href="https://resend.com/api-keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center"
                      >
                        resend.com/api-keys <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </p>
                    <p className="text-sm text-gray-600">
                      2. Create a new API key and copy it
                    </p>
                    <div className="bg-gray-50 p-3 rounded border font-mono text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">
                          RESEND_API_KEY={showApiKey ? "re_your_actual_api_key_here" : "re_••••••••••••••••••"}
                        </span>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="text-gray-500 hover:text-gray-700 p-1"
                            title={showApiKey ? "Hide" : "Show example"}
                          >
                            {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button 
                            onClick={() => copyToClipboard('RESEND_API_KEY=re_your_api_key_here')}
                            className="text-gray-500 hover:text-gray-700 p-1"
                            title="Copy template"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
                    {isApiKeyMissing ? "2" : "1"}
                  </span>
                  Add and Verify Your Domain
                </h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    1. Go to{" "}
                    <a 
                      href="https://resend.com/domains" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center"
                    >
                      resend.com/domains <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </p>
                  <p className="text-sm text-gray-600">
                    2. Add your domain (e.g., yourdomain.com)
                  </p>
                  <p className="text-sm text-gray-600">
                    3. Configure the DNS records shown in Resend
                  </p>
                  <div className="bg-gray-50 p-3 rounded border font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">FROM_EMAIL=noreply@yourdomain.com</span>
                      <button 
                        onClick={() => copyToClipboard('FROM_EMAIL=noreply@yourdomain.com')}
                        className="text-gray-500 hover:text-gray-700 p-1"
                        title="Copy template"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
                    {isApiKeyMissing ? "3" : "2"}
                  </span>
                  Test Your Setup
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Visit the{" "}
                  <a 
                    href="/deployment-dashboard" 
                    className="text-blue-600 hover:underline"
                  >
                    deployment dashboard
                  </a>
                  {" "}to test email sending once configured.
                </p>
              </div>
            </div>

            {/* Help Links */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
              <a 
                href="https://www.create.xyz/docs/integrations/resend" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline inline-flex items-center"
              >
                📖 Setup Guide <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <a 
                href="https://resend.com/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline inline-flex items-center"
              >
                📚 Resend Docs <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <button 
                onClick={checkResendSetup}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                🔄 Refresh Status
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={dismissBanner}
          className="text-gray-400 hover:text-gray-600 p-1"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}