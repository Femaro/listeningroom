"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Activity,
  Settings,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  MessageCircle,
  Mic,
  Eye,
  Edit,
  Trash2,
  Ban,
  BookOpen,
  Video,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Globe,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Search,
  Download,
  Upload,
  MoreVertical,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Bell,
  Terminal,
} from "lucide-react";
import useFirebaseAuth from "@/utils/useFirebaseAuth";
import { db } from "@/utils/firebase";
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  where,
  addDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
  limit,
  getDocs
} from "firebase/firestore";
import TextBasedTrainingManagement from "@/components/admin/TextBasedTrainingManagement";
import TrainingApplicationsTab from "@/components/admin/TrainingApplicationsTab";
import VideoManagement from "@/components/admin/VideoManagement";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminDashboard() {
  const { user, userProfile, loading: authLoading } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Data states
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    activeSessions: 0,
    totalVolunteers: 0,
    totalSeekers: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    avgSessionDuration: 0,
    newUsersToday: 0,
    sessionsToday: 0,
    crisisInterventions: 0,
    volunteerHours: 0,
    averageResponseTime: 0,
    systemHealth: 100,
    userSatisfaction: 0,
    platformUptime: 99.9,
    revenue: 0,
    donations: 0,
  });

  // Filter and search states
  const [sessionFilter, setSessionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Additional admin states
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [showReports, setShowReports] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (userProfile && userProfile.userType !== "admin") {
      window.location.href = "/dashboard";
    }
  }, [userProfile]);

  // Load data
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setError("Please sign in to access the admin dashboard.");
      setLoading(false);
      return;
    }

    if (userProfile && userProfile.userType !== "admin") {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    if (user && userProfile?.userType === "admin") {
      setLoading(true);
      setError(null);
      loadAllData();
    }
  }, [user, userProfile, authLoading]);

  const loadAllData = async () => {
    try {
      console.log("Loading admin dashboard data...");
      
      // Load sessions
      const sessionsQuery = query(collection(db, "sessions"), orderBy("createdAt", "desc"));
      const sessionsUnsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
        const sessionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        }));
        setSessions(sessionsData);
        updateStats(sessionsData, users);
      });

      // Load users
      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));
        setUsers(usersData);
        updateStats(sessions, usersData);
      });

      // Load activities (recent actions)
      const activitiesQuery = query(collection(db, "activities"), orderBy("timestamp", "desc"), limit(50));
      const activitiesUnsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
        const activitiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        }));
        setActivities(activitiesData);
      });

      // Load reports
      const reportsQuery = query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(20));
      const reportsUnsubscribe = onSnapshot(reportsQuery, (snapshot) => {
        const reportsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));
        setReports(reportsData);
      });

      // Load notifications
      const notificationsQuery = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(20));
      const notificationsUnsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));
        setNotifications(notificationsData);
      });

      // Load system logs
      const logsQuery = query(collection(db, "system_logs"), orderBy("timestamp", "desc"), limit(100));
      const logsUnsubscribe = onSnapshot(logsQuery, (snapshot) => {
        const logsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        }));
        setSystemLogs(logsData);
      });

      // Load moderation queue
      const moderationQuery = query(collection(db, "moderation_queue"), orderBy("createdAt", "desc"));
      const moderationUnsubscribe = onSnapshot(moderationQuery, (snapshot) => {
        const moderationData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));
        setModerationQueue(moderationData);
      });

      setLoading(false);

      return () => {
        sessionsUnsubscribe();
        usersUnsubscribe();
        activitiesUnsubscribe();
        reportsUnsubscribe();
        notificationsUnsubscribe();
        logsUnsubscribe();
        moderationUnsubscribe();
      };
    } catch (error) {
      console.error("Error loading admin data:", error);
      setError(`Failed to load admin data: ${error.message}`);
      setLoading(false);
    }
  };

  const updateStats = (sessionsData, usersData) => {
    const totalUsers = usersData.length;
    const totalSessions = sessionsData.length;
    const activeSessions = sessionsData.filter(s => s.status === "waiting" || s.status === "active").length;
    const totalVolunteers = usersData.filter(u => u.userType === "volunteer").length;
    const totalSeekers = usersData.filter(u => u.userType === "seeker").length;
    const completedSessions = sessionsData.filter(s => s.status === "completed").length;
    const cancelledSessions = sessionsData.filter(s => s.status === "cancelled").length;
    
    const avgDuration = sessionsData.length > 0 
      ? sessionsData.reduce((sum, s) => sum + (s.duration || 30), 0) / sessionsData.length 
      : 0;

    // Calculate additional metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newUsersToday = usersData.filter(u => 
      u.createdAt && u.createdAt >= today
    ).length;
    
    const sessionsToday = sessionsData.filter(s => 
      s.createdAt && s.createdAt >= today
    ).length;
    
    const crisisInterventions = sessionsData.filter(s => 
      s.specialization && s.specialization.toLowerCase().includes('crisis')
    ).length;
    
    const volunteerHours = completedSessions * (avgDuration / 60); // Convert to hours
    
    const averageResponseTime = sessionsData.length > 0 
      ? sessionsData.reduce((sum, s) => {
          if (s.createdAt && s.updatedAt) {
            return sum + (s.updatedAt - s.createdAt) / (1000 * 60); // Convert to minutes
          }
          return sum;
        }, 0) / sessionsData.length 
      : 0;

    setStats({
      totalUsers,
      totalSessions,
      activeSessions,
      totalVolunteers,
      totalSeekers,
      completedSessions,
      cancelledSessions,
      avgSessionDuration: Math.round(avgDuration),
      newUsersToday,
      sessionsToday,
      crisisInterventions,
      volunteerHours: Math.round(volunteerHours),
      averageResponseTime: Math.round(averageResponseTime),
      systemHealth: 100, // This would be calculated based on system metrics
      userSatisfaction: 4.5, // This would come from user feedback
      platformUptime: 99.9, // This would come from monitoring
      revenue: 0, // This would come from payment data
      donations: 0, // This would come from donation data
    });
  };

  // User management functions
  const handleUserAction = async (userId, action) => {
    try {
      const userRef = doc(db, "users", userId);
      
      switch (action) {
        case "suspend":
          await updateDoc(userRef, { 
            status: "suspended", 
            suspendedAt: new Date(),
            updatedAt: new Date() 
          });
          break;
        case "activate":
          await updateDoc(userRef, { 
            status: "active", 
            suspendedAt: null,
            updatedAt: new Date() 
          });
          break;
        case "ban":
          await updateDoc(userRef, { 
            status: "banned", 
            bannedAt: new Date(),
            updatedAt: new Date() 
          });
          break;
        case "unban":
          await updateDoc(userRef, { 
            status: "active", 
            bannedAt: null,
            updatedAt: new Date() 
          });
          break;
        case "delete":
          await deleteDoc(userRef);
          break;
        case "promote":
          await updateDoc(userRef, { 
            userType: "volunteer",
            updatedAt: new Date() 
          });
          break;
        case "demote":
          await updateDoc(userRef, { 
            userType: "seeker",
            updatedAt: new Date() 
          });
          break;
        case "makeAdmin":
          await updateDoc(userRef, { 
            userType: "admin", 
            updatedAt: new Date() 
          });
          break;
        case "makeVolunteer":
          await updateDoc(userRef, { 
            userType: "volunteer", 
            updatedAt: new Date() 
          });
          break;
        default:
          throw new Error("Invalid action");
      }
    } catch (error) {
      console.error("Error performing user action:", error);
      setError(`Failed to ${action} user`);
    }
  };

  // Content moderation functions
  const handleModerationAction = async (itemId, action) => {
    try {
      const itemRef = doc(db, "moderation_queue", itemId);
      
      switch (action) {
        case "approve":
          await updateDoc(itemRef, { 
            status: "approved", 
            moderatedAt: new Date(),
            moderatedBy: user.uid,
            updatedAt: new Date() 
          });
          break;
        case "reject":
          await updateDoc(itemRef, { 
            status: "rejected", 
            moderatedAt: new Date(),
            moderatedBy: user.uid,
            updatedAt: new Date() 
          });
          break;
        case "escalate":
          await updateDoc(itemRef, { 
            status: "escalated", 
            escalatedAt: new Date(),
            escalatedBy: user.uid,
            updatedAt: new Date() 
          });
          break;
        default:
          throw new Error("Invalid moderation action");
      }
    } catch (error) {
      console.error("Error performing moderation action:", error);
      setError(`Failed to ${action} content`);
    }
  };

  // System administration functions
  const handleSystemAction = async (action, data = {}) => {
    try {
      switch (action) {
        case "sendNotification":
          await addDoc(collection(db, "notifications"), {
            title: data.title,
            message: data.message,
            type: data.type || "info",
            targetUsers: data.targetUsers || "all",
            createdAt: new Date(),
            createdBy: user.uid,
          });
          break;
        case "updateSettings":
          await setDoc(doc(db, "system_settings", "main"), {
            ...data,
            updatedAt: new Date(),
            updatedBy: user.uid,
          }, { merge: true });
          break;
        case "generateReport":
          await addDoc(collection(db, "reports"), {
            type: data.type,
            period: data.period,
            data: data.reportData,
            createdAt: new Date(),
            createdBy: user.uid,
          });
          break;
        default:
          throw new Error("Invalid system action");
      }
    } catch (error) {
      console.error("Error performing system action:", error);
      setError(`Failed to ${action}`);
    }
  };

  // Bulk operations
  const handleBulkAction = async (action, selectedItems) => {
    try {
      const batch = writeBatch(db);
      
      selectedItems.forEach(item => {
        const itemRef = doc(db, "sessions", item.id);
        switch (action) {
          case "bulkCancel":
            batch.update(itemRef, { 
              status: "cancelled", 
              updatedAt: new Date() 
            });
            break;
          case "bulkComplete":
            batch.update(itemRef, { 
              status: "completed", 
              updatedAt: new Date() 
            });
            break;
          case "bulkDelete":
            batch.delete(itemRef);
            break;
        }
      });
      
      await batch.commit();
      setSelectedSessions([]);
    } catch (error) {
      console.error("Error performing bulk action:", error);
      setError(`Failed to ${action} selected items`);
    }
  };

  // Session management functions
  const handleSessionAction = async (sessionId, action) => {
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      
      switch (action) {
        case "cancel":
          await updateDoc(sessionRef, { 
            status: "cancelled", 
            updatedAt: new Date() 
          });
          break;
        case "complete":
          await updateDoc(sessionRef, { 
            status: "completed", 
            updatedAt: new Date() 
          });
          break;
        case "delete":
          await deleteDoc(sessionRef);
          break;
        case "activate":
          await updateDoc(sessionRef, { 
            status: "waiting", 
            updatedAt: new Date() 
          });
          break;
      }
    } catch (error) {
      console.error("Error updating session:", error);
      setError(`Failed to ${action} session`);
    }
  };


  // Bulk actions
  const handleBulkSessionAction = async (action) => {
    try {
      const batch = writeBatch(db);
      
      selectedSessions.forEach(sessionId => {
        const sessionRef = doc(db, "sessions", sessionId);
        switch (action) {
          case "cancel":
            batch.update(sessionRef, { status: "cancelled", updatedAt: new Date() });
            break;
          case "delete":
            batch.delete(sessionRef);
            break;
        }
      });
      
      await batch.commit();
      setSelectedSessions([]);
    } catch (error) {
      console.error("Error bulk updating sessions:", error);
      setError("Failed to perform bulk action");
    }
  };

  const handleBulkUserAction = async (action) => {
    try {
      const batch = writeBatch(db);
      
      selectedUsers.forEach(userId => {
        const userRef = doc(db, "users", userId);
        switch (action) {
          case "ban":
            batch.update(userRef, { status: "banned", updatedAt: new Date() });
            break;
          case "delete":
            batch.delete(userRef);
            break;
        }
      });
      
      await batch.commit();
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error bulk updating users:", error);
      setError("Failed to perform bulk action");
    }
  };

  // Filter functions
  const filteredSessions = sessions.filter(session => {
    const matchesFilter = sessionFilter === "all" || session.status === sessionFilter;
    const matchesSearch = searchTerm === "" || 
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.volunteerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredUsers = users.filter(user => {
    const matchesFilter = userFilter === "all" || user.userType === userFilter || user.status === userFilter;
    const matchesSearch = searchTerm === "" || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "sessions" && "Session Management"}
                {activeTab === "users" && "User Management"}
                {activeTab === "training" && "Training Management"}
                {activeTab === "training-applications" && "Training Applications"}
                {activeTab === "video-management" && "Video Management"}
                {activeTab === "moderation" && "Content Moderation"}
                {activeTab === "reports" && "Reports & Analytics"}
                {activeTab === "notifications" && "Notifications"}
                {activeTab === "logs" && "System Logs"}
                {activeTab === "analytics" && "Analytics"}
                {activeTab === "settings" && "System Settings"}
              </h1>
              <p className="text-gray-600 mt-1">
                {activeTab === "overview" && "Complete platform management and monitoring"}
                {activeTab === "sessions" && "Manage and monitor all platform sessions"}
                {activeTab === "users" && "User accounts, roles, and permissions"}
                {activeTab === "training" && "Create and manage training modules"}
                {activeTab === "training-applications" && "Review and approve training applications"}
                {activeTab === "video-management" && "Generate and manage training videos"}
                {activeTab === "moderation" && "Content moderation and safety tools"}
                {activeTab === "reports" && "Platform reports and insights"}
                {activeTab === "notifications" && "System notifications and alerts"}
                {activeTab === "logs" && "System logs and debugging information"}
                {activeTab === "analytics" && "Advanced analytics and metrics"}
                {activeTab === "settings" && "Platform configuration and settings"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <a
                href="/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-sm"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "overview" && (
          <OverviewTab stats={stats} sessions={sessions} users={users} activities={activities} />
        )}
        
        {activeTab === "sessions" && (
          <SessionsTab 
            sessions={filteredSessions}
            sessionFilter={sessionFilter}
            setSessionFilter={setSessionFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedSessions={selectedSessions}
            setSelectedSessions={setSelectedSessions}
            onSessionAction={handleSessionAction}
            onBulkAction={handleBulkSessionAction}
          />
        )}
        
        {activeTab === "users" && (
          <UsersTab 
            users={filteredUsers}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            onUserAction={handleUserAction}
            onBulkAction={handleBulkUserAction}
          />
        )}
        
        {activeTab === "training" && (
          <TextBasedTrainingManagement />
        )}
        
        {activeTab === "training-applications" && (
          <TrainingApplicationsTab />
        )}
        
        {activeTab === "video-management" && (
          <VideoManagement />
        )}
        
        {activeTab === "activities" && (
          <ActivitiesTab activities={activities} />
        )}
        
        {activeTab === "moderation" && (
          <ModerationTab 
            moderationQueue={moderationQueue}
            onModerationAction={handleModerationAction}
          />
        )}
        
        {activeTab === "reports" && (
          <ReportsTab 
            reports={reports}
            onGenerateReport={(type, data) => handleSystemAction('generateReport', { type, ...data })}
          />
        )}
        
        {activeTab === "notifications" && (
          <NotificationsTab 
            notifications={notifications}
            onSendNotification={(type, data) => handleSystemAction('sendNotification', { type, ...data })}
          />
        )}
        
        {activeTab === "logs" && (
          <SystemLogsTab systemLogs={systemLogs} />
        )}
        
        {activeTab === "analytics" && (
          <AnalyticsTab stats={stats} sessions={sessions} users={users} />
        )}
        
        {activeTab === "settings" && (
          <SettingsTab />
        )}
      </div>
    </AdminLayout>
  );
}

// Overview Tab Component
function OverviewTab({ stats, sessions, users, activities }) {
  const recentSessions = sessions.slice(0, 5);
  const recentUsers = users.slice(0, 5);
  const recentActivities = activities.slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Volunteers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVolunteers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-900 font-medium">{session.title}</p>
                  <p className="text-gray-600 text-sm">by {session.volunteerName}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  session.status === "waiting" ? "bg-yellow-100 text-yellow-800" :
                  session.status === "active" ? "bg-green-100 text-green-800" :
                  session.status === "completed" ? "bg-blue-100 text-blue-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-900 font-medium">{user.name}</p>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.userType === "volunteer" ? "bg-purple-100 text-purple-800" :
                  user.userType === "admin" ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {user.userType}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sessions Tab Component
function SessionsTab({ 
  sessions, 
  sessionFilter, 
  setSessionFilter, 
  searchTerm, 
  setSearchTerm,
  selectedSessions,
  setSelectedSessions,
  onSessionAction,
  onBulkAction
}) {
  const [expandedSession, setExpandedSession] = useState(null);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedSessions(sessions.map(s => s.id));
    } else {
      setSelectedSessions([]);
    }
  };

  const handleSelectSession = (sessionId, checked) => {
    if (checked) {
      setSelectedSessions([...selectedSessions, sessionId]);
    } else {
      setSelectedSessions(selectedSessions.filter(id => id !== sessionId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sessions</option>
              <option value="waiting">Waiting</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedSessions.length > 0 && (
          <div className="mt-4 flex items-center gap-4">
            <span className="text-gray-700 font-medium">{selectedSessions.length} selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => onBulkAction("cancel")}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
              >
                Cancel Selected
              </button>
              <button
                onClick={() => onBulkAction("delete")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedSessions.length === sessions.length && sessions.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Volunteer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(session.id)}
                      onChange={(e) => handleSelectSession(session.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{session.title}</div>
                      <div className="text-sm text-gray-600">{session.sessionType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{session.volunteerName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      session.status === "waiting" ? "bg-yellow-100 text-yellow-800" :
                      session.status === "active" ? "bg-green-100 text-green-800" :
                      session.status === "completed" ? "bg-blue-100 text-blue-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {session.currentParticipants || 0}/{session.maxParticipants}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {session.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {session.status === "waiting" && (
                        <button
                          onClick={() => onSessionAction(session.id, "cancel")}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {session.status === "cancelled" && (
                        <button
                          onClick={() => onSessionAction(session.id, "activate")}
                          className="text-green-400 hover:text-green-300"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onSessionAction(session.id, "delete")}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab({ 
  users, 
  userFilter, 
  setUserFilter, 
  searchTerm, 
  setSearchTerm,
  selectedUsers,
  setSelectedUsers,
  onUserAction,
  onBulkAction
}) {
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Users</option>
              <option value="volunteer">Volunteers</option>
              <option value="seeker">Seekers</option>
              <option value="admin">Admins</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 flex items-center gap-4">
            <span className="text-white">{selectedUsers.length} selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => onBulkAction("ban")}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
              >
                Ban Selected
              </button>
              <button
                onClick={() => onBulkAction("delete")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users List */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-white/30"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      className="rounded border-white/30"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.userType === "admin" ? "bg-red-100 text-red-800" :
                      user.userType === "volunteer" ? "bg-purple-100 text-purple-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {user.userType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === "banned" ? "bg-red-100 text-red-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {user.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {user.userType !== "admin" && (
                        <button
                          onClick={() => onUserAction(user.id, "makeAdmin")}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                          title="Make Admin"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      {user.userType === "seeker" && (
                        <button
                          onClick={() => onUserAction(user.id, "makeVolunteer")}
                          className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-1 rounded"
                          title="Make Volunteer"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      {user.status !== "banned" ? (
                        <button
                          onClick={() => onUserAction(user.id, "ban")}
                          className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 p-1 rounded"
                          title="Ban User"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onUserAction(user.id, "unban")}
                          className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1 rounded"
                          title="Unban User"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onUserAction(user.id, "delete")}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Activities Tab Component
function ActivitiesTab({ activities }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activities</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-teal-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {activity.timestamp.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  return (
    <div className="space-y-6">
      {/* Platform Settings */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-600" />
          Platform Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform Name
            </label>
            <input
              type="text"
              defaultValue="Listening Room"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Sessions per Volunteer
            </label>
            <input
              type="number"
              defaultValue="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Duration Limit (minutes)
            </label>
            <input
              type="number"
              defaultValue="60"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
            Save Settings
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Security Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
            </div>
            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Session Timeout</h4>
              <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
            </div>
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">IP Whitelist</h4>
              <p className="text-sm text-gray-600">Restrict admin access to specific IPs</p>
            </div>
            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-blue-600" />
          Notification Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Send email alerts for important events</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">SMS Alerts</h4>
              <p className="text-sm text-gray-600">Send SMS for critical issues</p>
            </div>
            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Browser Notifications</h4>
              <p className="text-sm text-gray-600">Show browser notifications</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          </div>
        </div>
      </div>

      {/* System Maintenance */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Terminal className="w-5 h-5 mr-2 text-blue-600" />
          System Maintenance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
              <p className="text-sm text-gray-600">Temporarily disable platform access</p>
            </div>
            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto Backup</h4>
              <p className="text-sm text-gray-600">Automatically backup data daily</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Log Retention</h4>
              <p className="text-sm text-gray-600">Keep system logs for 30 days</p>
            </div>
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>7 days</option>
              <option>30 days</option>
              <option>90 days</option>
              <option>1 year</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
            Save All Settings
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium">
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

// Moderation Tab Component
function ModerationTab({ moderationQueue, onModerationAction }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Content Moderation Queue
        </h3>
        <div className="space-y-4">
          {moderationQueue.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No items pending moderation</p>
            </div>
          ) : (
            moderationQueue.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-medium">{item.title || 'Untitled Content'}</h4>
                    <p className="text-gray-600 text-sm mt-1">{item.description || 'No description'}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      Reported by: {item.reportedBy || 'System'} • {item.createdAt?.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onModerationAction(item.id, 'approve')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onModerationAction(item.id, 'reject')}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 font-medium"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onModerationAction(item.id, 'escalate')}
                      className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 font-medium"
                    >
                      Escalate
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Reports Tab Component
function ReportsTab({ reports, onGenerateReport }) {
  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Platform Reports
          </h3>
          <button
            onClick={() => onGenerateReport('platform', { period: 'monthly' })}
            className="bg-teal-600/80 text-white px-4 py-2 rounded-lg hover:bg-teal-600 text-sm"
          >
            Generate Report
          </button>
        </div>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reports generated yet</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{report.type} Report</h4>
                    <p className="text-white/60 text-sm">Period: {report.period}</p>
                    <p className="text-white/40 text-xs">Generated: {report.createdAt?.toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600/80 text-white rounded text-sm hover:bg-blue-600">
                      View
                    </button>
                    <button className="px-3 py-1 bg-green-600/80 text-white rounded text-sm hover:bg-green-600">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Notifications Tab Component
function NotificationsTab({ notifications, onSendNotification }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-600" />
            System Notifications
          </h3>
          <button
            onClick={() => onSendNotification('broadcast', { title: 'Test', message: 'Test notification' })}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Send Notification
          </button>
        </div>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-gray-900 font-medium">{notification.title}</h4>
                    <p className="text-gray-600 text-sm">{notification.message}</p>
                    <p className="text-gray-500 text-xs">Sent: {notification.createdAt?.toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    notification.type === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {notification.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// System Logs Tab Component
function SystemLogsTab({ systemLogs }) {
  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Terminal className="w-5 h-5 mr-2" />
          System Logs
        </h3>
        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          {systemLogs.length === 0 ? (
            <div className="text-white/60 text-center py-8">
              <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No system logs available</p>
            </div>
          ) : (
            <div className="space-y-1">
              {systemLogs.map((log) => (
                <div key={log.id} className="flex items-start">
                  <span className="text-white/40 text-xs mr-4 w-20 flex-shrink-0">
                    {log.timestamp?.toLocaleTimeString()}
                  </span>
                  <span className={`mr-4 ${
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warning' ? 'text-yellow-400' :
                    log.level === 'info' ? 'text-blue-400' :
                    'text-white'
                  }`}>
                    [{log.level?.toUpperCase()}]
                  </span>
                  <span className="text-white/80 flex-1">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ stats, sessions, users }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            User Growth
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="text-gray-900 font-bold text-lg">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Today</span>
              <span className="text-green-600 font-bold text-lg">+{stats.newUsersToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Volunteers</span>
              <span className="text-purple-600 font-bold text-lg">{stats.totalVolunteers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Seekers</span>
              <span className="text-blue-600 font-bold text-lg">{stats.totalSeekers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Session Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Sessions</span>
              <span className="text-gray-900 font-bold text-lg">{stats.totalSessions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Now</span>
              <span className="text-yellow-600 font-bold text-lg">{stats.activeSessions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <span className="text-green-600 font-bold text-lg">{stats.completedSessions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Duration</span>
              <span className="text-blue-600 font-bold text-lg">{stats.avgSessionDuration}m</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Platform Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.systemHealth}%</div>
            <div className="text-gray-600 text-sm">System Health</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.platformUptime}%</div>
            <div className="text-gray-600 text-sm">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.userSatisfaction}/5</div>
            <div className="text-gray-600 text-sm">User Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Additional Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Growth Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sessions Today</span>
              <span className="text-blue-600 font-bold text-lg">{stats.sessionsToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Crisis Interventions</span>
              <span className="text-red-600 font-bold text-lg">{stats.crisisInterventions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Volunteer Hours</span>
              <span className="text-green-600 font-bold text-lg">{stats.volunteerHours}h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Response Time</span>
              <span className="text-purple-600 font-bold text-lg">{stats.averageResponseTime}m</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-blue-600" />
            Activity Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancelled Sessions</span>
              <span className="text-red-600 font-bold text-lg">{stats.cancelledSessions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue</span>
              <span className="text-green-600 font-bold text-lg">${stats.revenue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Donations</span>
              <span className="text-blue-600 font-bold text-lg">${stats.donations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Platform Uptime</span>
              <span className="text-green-600 font-bold text-lg">{stats.platformUptime}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
