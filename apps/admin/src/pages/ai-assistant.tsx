/**
 * AI Assistant Page with Role-Based Permissions
 *
 * This page provides an AI chat interface that:
 * - Displays user's current role and permissions
 * - Shows chat history with message formatting
 * - Handles loading states and errors
 * - Integrates with Firebase for auth and data
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bot,
  Send,
  Loader2,
  User,
  Sparkles,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  MessageSquare,
  Settings,
  History,
  Zap,
  Clock,
  Shield,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Database,
  FileText,
  Users,
  Car,
  DollarSign,
  Building2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
} from "lucide-react";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { ensureFirebaseApp } from "../lib/firebaseClient";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useAuth } from "../state/AuthProvider";

// ============================================
// Types
// ============================================

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: number;
  isStreaming?: boolean;
  redacted?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  userRole?: string;
}

interface UserPermissions {
  role: string;
  permissions: string[];
  dataAccess: string[];
}

interface QuickCommand {
  id: string;
  icon: React.ElementType;
  label: string;
  command: string;
  requiresPermission?: string;
  color: string;
}

// ============================================
// Permission Data
// ============================================

const ROLE_DESCRIPTIONS: Record<string, string> = {
  dispatcher: "Dispatcher - Vehicle scheduling and assignments",
  accountant: "Accountant - Financial records and receipts",
  fleet_manager: "Fleet Manager - Vehicles, drivers, and maintenance",
  admin: "Administrator - Full organization access",
  saas_admin: "SaaS Administrator - Platform-wide access",
};

const ROLE_DATA_ACCESS: Record<string, string[]> = {
  dispatcher: ["Vehicles (view)", "Drivers (view)", "Assignments"],
  accountant: ["Accounting", "Receipts", "Refunds", "Drivers (basic)"],
  fleet_manager: ["Vehicles", "Drivers", "Assignments", "Issues", "Fleet"],
  admin: ["All organization data"],
  saas_admin: ["All platform data across organizations"],
};

const quickCommands: QuickCommand[] = [
  {
    id: "vehicles",
    icon: Car,
    label: "View Vehicles",
    command: "view_vehicles",
    requiresPermission: "vehicles:view",
    color: "text-blue-400 bg-blue-500/10",
  },
  {
    id: "users",
    icon: Users,
    label: "View Users",
    command: "view_users",
    requiresPermission: "users:view",
    color: "text-green-400 bg-green-500/10",
  },
  {
    id: "accounting",
    icon: DollarSign,
    label: "View Accounting",
    command: "view_accounting",
    requiresPermission: "accounting:view",
    color: "text-amber-400 bg-amber-500/10",
  },
  {
    id: "organizations",
    icon: Building2,
    label: "View Organizations",
    command: "view_organizations",
    requiresPermission: "saas:view_all_organizations",
    color: "text-purple-400 bg-purple-500/10",
  },
  {
    id: "report",
    icon: FileText,
    label: "Run Report",
    command: "run_report",
    color: "text-cyan-400 bg-cyan-500/10",
  },
];

// ============================================
// Components
// ============================================

function PermissionBadge({
  permission,
  hasAccess,
}: {
  permission: string;
  hasAccess: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
        hasAccess
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-slate-700/50 text-slate-500 border border-slate-600"
      }`}
    >
      {hasAccess ? (
        <Unlock className="w-3 h-3" />
      ) : (
        <Lock className="w-3 h-3" />
      )}
      {permission}
    </span>
  );
}

function RoleInfoPanel({
  role,
  permissions,
  isExpanded,
  onToggle,
}: {
  role: string;
  permissions: string[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const dataAccess = ROLE_DATA_ACCESS[role] || [];
  const roleDesc = ROLE_DESCRIPTIONS[role] || "Unknown Role";

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Your Role & Permissions
            </h3>
            <p className="text-xs text-slate-400">{roleDesc}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Data Access */}
          <div>
            <h4 className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Database className="w-3 h-3" />
              Data Access
            </h4>
            <div className="flex flex-wrap gap-2">
              {dataAccess.map((access) => (
                <span
                  key={access}
                  className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded-lg text-xs text-slate-300"
                >
                  {access}
                </span>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h4 className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Active Permissions ({permissions.length})
            </h4>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {permissions.slice(0, 12).map((permission) => (
                <PermissionBadge
                  key={permission}
                  permission={permission}
                  hasAccess={true}
                />
              ))}
              {permissions.length > 12 && (
                <span className="text-xs text-slate-500">
                  +{permissions.length - 12} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  onCopy,
}: {
  message: ChatMessage;
  onCopy: (content: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          isUser
            ? "bg-amber-500/20"
            : isSystem
              ? "bg-slate-500/20"
              : "bg-purple-500/20"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-amber-400" />
        ) : isSystem ? (
          <AlertCircle className="w-5 h-5 text-slate-400" />
        ) : (
          <Bot className="w-5 h-5 text-purple-400" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block rounded-2xl px-5 py-3 ${
            isUser
              ? "bg-amber-500/10 border border-amber-500/20"
              : isSystem
                ? "bg-slate-700/50 border border-slate-600"
                : "bg-slate-800 border border-slate-700"
          }`}
        >
          {message.redacted && (
            <div className="flex items-center gap-1 text-xs text-amber-400 mb-2">
              <EyeOff className="w-3 h-3" />
              Some data was redacted for security
            </div>
          )}
          <div
            className={`text-sm leading-relaxed ${isUser ? "text-amber-100" : "text-slate-200"}`}
          >
            {message.isStreaming ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </span>
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div
          className={`flex items-center gap-3 mt-2 text-xs text-slate-500 ${
            isUser ? "justify-end" : ""
          }`}
        >
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.model && (
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {message.model}
            </span>
          )}
          {message.tokens && (
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {message.tokens} tokens
            </span>
          )}
          {!isUser && !message.isStreaming && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
        isActive
          ? "bg-amber-500/10 border border-amber-500/20"
          : "hover:bg-slate-700/50 border border-transparent"
      }`}
      onClick={onClick}
    >
      <MessageSquare
        className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-amber-400" : "text-slate-500"}`}
      />
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-slate-300"}`}
        >
          {conversation.title}
        </div>
        <div className="text-xs text-slate-500 truncate">
          {conversation.lastMessage}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-600 transition-all"
      >
        <Trash2 className="w-3 h-3 text-slate-400" />
      </button>
    </div>
  );
}

function QuickCommandButton({
  command,
  userPermissions,
  onClick,
}: {
  command: QuickCommand;
  userPermissions: string[];
  onClick: () => void;
}) {
  const hasPermission =
    !command.requiresPermission ||
    userPermissions.some(
      (p) => p === command.requiresPermission || p.startsWith("saas:"),
    );

  return (
    <button
      onClick={onClick}
      disabled={!hasPermission}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group ${
        hasPermission
          ? "border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800 cursor-pointer"
          : "border-slate-800 bg-slate-900/50 cursor-not-allowed opacity-50"
      }`}
      title={
        hasPermission
          ? command.label
          : `Requires permission: ${command.requiresPermission}`
      }
    >
      <div className={`p-2 rounded-lg ${command.color}`}>
        <command.icon className="w-4 h-4" />
      </div>
      <span
        className={`text-sm ${hasPermission ? "text-slate-300 group-hover:text-white" : "text-slate-500"}`}
      >
        {command.label}
      </span>
      {!hasPermission && <Lock className="w-3 h-3 text-slate-600 ml-auto" />}
    </button>
  );
}

// ============================================
// Main Component
// ============================================

export default function AIAssistantPage() {
  const { user: authUser, role } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showRoleInfo, setShowRoleInfo] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gemini-pro");
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Determine user role for display
  const displayRole =
    role === "superadmin"
      ? "saas_admin"
      : role === "admin"
        ? "admin"
        : role || "viewer";

  // Set default permissions based on role
  useEffect(() => {
    const rolePermissionsMap: Record<string, string[]> = {
      dispatcher: [
        "vehicles:view",
        "drivers:view",
        "vehicle_assignments:view",
        "ai_chat:access",
      ],
      accountant: [
        "accounting:view",
        "receipts:view",
        "refunds:view",
        "ai_chat:access",
      ],
      fleet_manager: [
        "vehicles:view",
        "vehicles:create",
        "vehicles:update",
        "drivers:view",
        "drivers:create",
        "drivers:update",
        "fleet:view",
        "fleet:manage",
        "ai_chat:access",
      ],
      admin: [
        "vehicles:view",
        "vehicles:create",
        "vehicles:update",
        "vehicles:delete",
        "drivers:view",
        "drivers:create",
        "drivers:update",
        "drivers:delete",
        "users:view",
        "users:create",
        "users:update",
        "users:delete",
        "accounting:view",
        "organization:view",
        "organization:update",
        "ai_chat:access",
        "ai_chat:view_sensitive_data",
      ],
      saas_admin: [
        "vehicles:view",
        "vehicles:create",
        "vehicles:update",
        "vehicles:delete",
        "drivers:view",
        "drivers:create",
        "drivers:update",
        "drivers:delete",
        "users:view",
        "users:create",
        "users:update",
        "users:delete",
        "accounting:view",
        "organization:view",
        "organization:update",
        "saas:view_all_organizations",
        "saas:manage_organizations",
        "saas:view_all_data",
        "ai_chat:access",
        "ai_chat:view_sensitive_data",
      ],
      superadmin: [
        "saas:view_all_organizations",
        "saas:manage_organizations",
        "saas:view_all_data",
        "ai_chat:access",
        "ai_chat:view_sensitive_data",
      ],
    };

    setUserPermissions(
      rolePermissionsMap[displayRole] ||
        rolePermissionsMap[role || "viewer"] ||
        [],
    );
  }, [displayRole, role]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  useEffect(() => {
    if (!authUser) return;

    try {
      const conversationsQuery = query(
        collection(db, "ai_conversations"),
        where("userId", "==", authUser.uid),
        orderBy("timestamp", "desc"),
        limit(20),
      );

      const unsubscribe = onSnapshot(
        conversationsQuery,
        (snapshot) => {
          const convs = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || "New Conversation",
              lastMessage: data.lastMessage || "",
              timestamp: data.timestamp?.toDate?.() || new Date(),
              messageCount: data.messageCount || 0,
              userRole: data.userRole,
            };
          });
          setConversations(convs);
          setError(null);
        },
        (err) => {
          console.error("Error loading conversations:", err);
          setError("Failed to load conversation history");
        },
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up conversations listener:", err);
    }
  }, [authUser]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    try {
      const messagesQuery = query(
        collection(db, "ai_conversations", activeConversationId, "messages"),
        orderBy("timestamp", "asc"),
      );

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const msgs = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              role: data.role as "user" | "assistant" | "system",
              content: data.content || "",
              timestamp: data.timestamp?.toDate?.() || new Date(),
              model: data.model,
              tokens: data.tokens,
              redacted: data.redacted,
            };
          });
          setMessages(msgs);
        },
        (err) => {
          console.error("Error loading messages:", err);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up messages listener:", err);
    }
  }, [activeConversationId]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const streamingId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: streamingId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);

    try {
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error("Firebase not initialized");

      const functions = getFunctions(app);
      const processAIChatMessage = httpsCallable<
        {
          message: string;
          conversationId?: string;
          model?: string;
        },
        {
          response: string;
          tokens: number;
          conversationId: string;
          model: string;
          permissions: string[];
          dataRedacted: boolean;
        }
      >(functions, "processAIChatMessage");

      const result = await processAIChatMessage({
        message: userMessage.content,
        conversationId: activeConversationId || undefined,
        model: selectedModel,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingId
            ? {
                ...msg,
                content: result.data.response,
                isStreaming: false,
                model: result.data.model,
                tokens: result.data.tokens,
                redacted: result.data.dataRedacted,
              }
            : msg,
        ),
      );

      if (!activeConversationId && result.data.conversationId) {
        setActiveConversationId(result.data.conversationId);
      }

      // Update permissions if returned
      if (result.data.permissions && result.data.permissions.length > 0) {
        setUserPermissions(result.data.permissions);
      }
    } catch (err: unknown) {
      console.error("Chat error:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to get response. Please try again.";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingId
            ? {
                ...msg,
                content: `Error: ${errorMessage}`,
                isStreaming: false,
                model: "error",
              }
            : msg,
        ),
      );

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute quick command
  const executeQuickCommand = async (command: QuickCommand) => {
    setInput(`Execute command: ${command.command}`);
    inputRef.current?.focus();
  };

  // Start new conversation
  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  // Delete conversation
  const deleteConversation = async (id: string) => {
    try {
      const { app } = ensureFirebaseApp();
      if (!app) return;

      const functions = getFunctions(app);
      const deleteAIConversation = httpsCallable(
        functions,
        "deleteAIConversation",
      );

      await deleteAIConversation({ conversationId: id });

      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      setError("Failed to delete conversation");
    }
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Check if user has AI chat access
  const hasAIChatAccess =
    userPermissions.includes("ai_chat:access") ||
    role === "admin" ||
    role === "superadmin";

  if (!hasAIChatAccess) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-slate-900 rounded-2xl border border-slate-700">
        <div className="text-center p-8">
          <div className="p-4 rounded-2xl bg-red-500/10 mb-6 inline-block">
            <Lock className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Access Denied
          </h2>
          <p className="text-slate-400 max-w-md">
            Your current role ({displayRole}) does not have permission to access
            the AI Assistant. Please contact your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">AI Assistant</h1>
        <p className="text-slate-400">
          Chat with AI while respecting your role-based permissions
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex h-[calc(100vh-280px)] min-h-[600px] bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
        {/* Sidebar */}
        {showHistory && (
          <div className="w-80 bg-slate-800/50 border-r border-slate-700 flex flex-col">
            {/* Role Info Panel */}
            <div className="p-4 border-b border-slate-700">
              <RoleInfoPanel
                role={displayRole}
                permissions={userPermissions}
                isExpanded={showRoleInfo}
                onToggle={() => setShowRoleInfo(!showRoleInfo)}
              />

              <button
                onClick={startNewConversation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                New Chat
              </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onClick={() => setActiveConversationId(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                  />
                ))
              )}
            </div>

            {/* Model Selector */}
            <div className="p-4 border-t border-slate-700">
              <label className="text-xs text-slate-500 mb-2 block">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gemini-1.5-flash">Gemini Flash</option>
              </select>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors lg:hidden"
              >
                <History className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10">
                  <Bot className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    AI Assistant
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Online - Role: {displayRole}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={startNewConversation}
                className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="New conversation"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors hidden lg:block"
              >
                <History className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="p-4 rounded-2xl bg-purple-500/10 mb-6">
                  <Bot className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  How can I help you today?
                </h3>
                <p className="text-slate-500 text-center max-w-md mb-8">
                  I'm your AI assistant with role-based access controls. I can
                  only provide information you're authorized to access based on
                  your {displayRole} role.
                </p>

                {/* Quick Commands */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
                  {quickCommands.map((command) => (
                    <QuickCommandButton
                      key={command.id}
                      command={command}
                      userPermissions={userPermissions}
                      onClick={() => executeQuickCommand(command)}
                    />
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
                  <Info className="w-3 h-3" />
                  <span>
                    Commands are filtered based on your permissions. Locked
                    items require additional access.
                  </span>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onCopy={copyToClipboard}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  rows={1}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none overflow-hidden"
                  style={{ maxHeight: "200px" }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="flex items-center justify-center w-12 h-12 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl text-slate-900 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Responses filtered by {displayRole} permissions
              </span>
              <span>Powered by {selectedModel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
