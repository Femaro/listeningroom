"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Send,
  Server,
  Database,
  Mail,
  Phone,
  Settings,
  Copy,
  ExternalLink,
  Clock,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

export default function DeploymentDashboard() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [emailTestResult, setEmailTestResult] = useState(null);
  const [emailTestLoading, setEmailTestLoading] = useState(false);

  // Environment variable state
  const [envVars, setEnvVars] = useState({
    RESEND_API_KEY: "",
    FROM_EMAIL: "",
  });
  const [envSaving, setEnvSaving] = useState(false);
  const [envSaveResult, setEnvSaveResult] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/deployment-check");
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error("Failed to check system status:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveEnvironmentVariables = async () => {
    setEnvSaving(true);
    setEnvSaveResult(null);

    try {
      const response = await fetch("/api/deployment-check", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environmentVariables: envVars }),
      });

      const data = await response.json();

      if (data.success) {
        setEnvSaveResult({
          success: true,
          message: "Environment variables saved successfully!",
        });
        // Refresh system status after saving
        setTimeout(() => {
          checkSystemStatus();
          setEnvSaveResult(null);
        }, 2000);
      } else {
        setEnvSaveResult({
          success: false,
          message: data.error || "Failed to save environment variables",
        });
      }
    } catch (error) {
      setEnvSaveResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setEnvSaving(false);
    }
  };

  const testEmailService = async () => {
    if (!testEmail) {
      alert("Please enter an email address");
      return;
    }

    setEmailTestLoading(true);
    try {
      const response = await fetch("/api/deployment-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail }),
      });

      const data = await response.json();
      setEmailTestResult(data);

      if (data.success) {
        setTimeout(() => setEmailTestResult(null), 5000);
      }
    } catch (error) {
      setEmailTestResult({
        error: "Network error. Please try again.",
        success: false,
      });
    } finally {
      setEmailTestLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-700 bg-green-50 border-green-200";
      case "warning":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "error":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Deployment Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor and configure your Listening Room deployment
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  systemStatus?.status === "ready"
                    ? "bg-green-100 text-green-800"
                    : systemStatus?.status === "partial"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                Status: {systemStatus?.status || "Unknown"}
              </div>
              <button
                onClick={checkSystemStatus}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* System Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Server className="w-5 h-5 mr-2" />
                System Health
              </h2>

              <div className="space-y-4">
                {/* Database */}
                <div
                  className={`p-4 rounded-lg border ${getStatusColor(systemStatus?.checks?.database?.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5" />
                      <div>
                        <h3 className="font-medium">Database</h3>
                        <p className="text-sm opacity-75">
                          {systemStatus?.checks?.database?.details}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(systemStatus?.checks?.database?.status)}
                  </div>
                </div>

                {/* Email Service */}
                <div
                  className={`p-4 rounded-lg border ${getStatusColor(systemStatus?.checks?.email?.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5" />
                      <div>
                        <h3 className="font-medium">Email Service</h3>
                        <p className="text-sm opacity-75">
                          API Key:{" "}
                          {systemStatus?.checks?.email?.details?.apiKey
                            ? "✓ Configured"
                            : "✗ Missing"}
                          {systemStatus?.checks?.email?.details?.verifiedDomains
                            ?.length > 0 &&
                            ` • Verified: ${systemStatus.checks.email.details.verifiedDomains.join(", ")}`}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(systemStatus?.checks?.email?.status)}
                  </div>
                </div>

                {/* WebRTC */}
                <div
                  className={`p-4 rounded-lg border ${getStatusColor(systemStatus?.checks?.webrtc?.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5" />
                      <div>
                        <h3 className="font-medium">WebRTC Voice Calling</h3>
                        <p className="text-sm opacity-75">
                          TURN Servers:{" "}
                          {systemStatus?.checks?.webrtc?.details?.turnServers
                            ?.length || 0}{" "}
                          configured
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(systemStatus?.checks?.webrtc?.status)}
                  </div>
                </div>

                {/* Environment */}
                <div
                  className={`p-4 rounded-lg border ${getStatusColor(systemStatus?.checks?.environment?.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5" />
                      <div>
                        <h3 className="font-medium">Environment Variables</h3>
                        <p className="text-sm opacity-75">
                          {systemStatus?.checks?.environment?.details?.missing
                            ?.length > 0
                            ? `Missing: ${systemStatus.checks.environment.details.missing.join(", ")}`
                            : "All required variables configured"}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(systemStatus?.checks?.environment?.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Email Testing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Email Testing
              </h2>

              <div className="space-y-4">
                <div className="flex space-x-3">
                  <input
                    type="email"
                    placeholder="Enter test email address..."
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    onClick={testEmailService}
                    disabled={emailTestLoading || !testEmail}
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {emailTestLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Send Test</span>
                  </button>
                </div>

                {emailTestResult && (
                  <div
                    className={`p-4 rounded-lg border ${
                      emailTestResult.success
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {emailTestResult.success ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {emailTestResult.success
                          ? emailTestResult.message
                          : emailTestResult.error}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configuration Guide */}
          <div className="space-y-6">
            {/* Environment Variable Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Environment Variables
              </h2>

              <div className="space-y-6">
                {/* Resend API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resend API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      placeholder="re_..."
                      value={envVars.RESEND_API_KEY}
                      onChange={(e) =>
                        setEnvVars((prev) => ({
                          ...prev,
                          RESEND_API_KEY: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from{" "}
                    <a
                      href="https://resend.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:underline"
                    >
                      resend.com/api-keys
                    </a>
                  </p>
                </div>

                {/* From Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="noreply@yourdomain.com"
                    value={envVars.FROM_EMAIL}
                    onChange={(e) =>
                      setEnvVars((prev) => ({
                        ...prev,
                        FROM_EMAIL: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be from a domain verified in{" "}
                    <a
                      href="https://resend.com/domains"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:underline"
                    >
                      Resend
                    </a>
                  </p>
                </div>

                {/* Save Button */}
                <button
                  onClick={saveEnvironmentVariables}
                  disabled={
                    envSaving || !envVars.RESEND_API_KEY || !envVars.FROM_EMAIL
                  }
                  className="w-full bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {envSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{envSaving ? "Saving..." : "Save Configuration"}</span>
                </button>

                {/* Save Result */}
                {envSaveResult && (
                  <div
                    className={`p-4 rounded-lg border ${
                      envSaveResult.success
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {envSaveResult.success ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm">{envSaveResult.message}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {systemStatus?.recommendations &&
              systemStatus.recommendations.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Recommendations
                  </h2>

                  <div className="space-y-4">
                    {systemStatus.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          rec.type === "critical"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {rec.type === "critical" ? (
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h3
                              className={`font-medium ${
                                rec.type === "critical"
                                  ? "text-red-800"
                                  : "text-yellow-800"
                              }`}
                            >
                              {rec.message}
                            </h3>
                            <p
                              className={`text-sm mt-1 ${
                                rec.type === "critical"
                                  ? "text-red-700"
                                  : "text-yellow-700"
                              }`}
                            >
                              {rec.action}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Environment Setup Guide */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Setup Guide
              </h2>

              <div className="space-y-6">
                {/* Email Configuration */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Service (Resend)
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      1. Sign up at{" "}
                      <a
                        href="https://resend.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline inline-flex items-center"
                      >
                        resend.com <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </p>
                    <p className="text-gray-600">
                      2. Add your domain at{" "}
                      <a
                        href="https://resend.com/domains"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline inline-flex items-center"
                      >
                        resend.com/domains{" "}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </p>
                    <p className="text-gray-600">
                      3. Configure DNS records for domain verification
                    </p>
                    <p className="text-gray-600">
                      4. Get your API key and enter it above
                    </p>
                  </div>
                </div>

                {/* WebRTC Configuration */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    WebRTC TURN Servers
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="bg-gray-50 p-3 rounded font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span>NEXT_PUBLIC_TURN_SERVER_URL=turn:...</span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              "NEXT_PUBLIC_TURN_SERVER_URL=turn:your-turn-server.com:3478",
                            )
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>NEXT_PUBLIC_TURN_USERNAME=username</span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              "NEXT_PUBLIC_TURN_USERNAME=your_username",
                            )
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>NEXT_PUBLIC_TURN_CREDENTIAL=password</span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              "NEXT_PUBLIC_TURN_CREDENTIAL=your_credential",
                            )
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Recommended providers: Twilio, AWS, Xirsys, or self-hosted
                      Coturn
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Last updated:{" "}
            {systemStatus?.timestamp &&
              new Date(systemStatus.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
