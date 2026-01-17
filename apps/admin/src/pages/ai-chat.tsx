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
  ChevronDown,
  History,
  Zap,
  Brain,
  Code,
  FileText,
  Image,
  Languages,
  Search,
  Lightbulb,
  AlertCircle,
  Clock,
  X,
} from "lucide-react";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  getDocs,
  where,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { ensureFirebaseApp } from "../lib/firebaseClient";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";

// Types
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: number;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface QuickAction {
  id: string;
  icon: React.ElementType;
  label: string;
  prompt: string;
  color: string;
}

// Quick action suggestions
const quickActions: QuickAction[] = [
  {
    id: "content",
    icon: FileText,
    label: "Generate Content",
    prompt:
      "Generate SEO-optimized content for a luxury limousine service page about ",
    color: "text-amber-400 bg-amber-500/10",
  },
  {
    id: "analyze",
    icon: Search,
    label: "Analyze Data",
    prompt: "Analyze the following data and provide insights: ",
    color: "text-cyan-400 bg-cyan-500/10",
  },
  {
    id: "code",
    icon: Code,
    label: "Write Code",
    prompt: "Write TypeScript code for ",
    color: "text-emerald-400 bg-emerald-500/10",
  },
  {
    id: "translate",
    icon: Languages,
    label: "Translate",
    prompt: "Translate the following text to Spanish: ",
    color: "text-purple-400 bg-purple-500/10",
  },
  {
    id: "summarize",
    icon: Lightbulb,
    label: "Summarize",
    prompt: "Summarize the following content concisely: ",
    color: "text-rose-400 bg-rose-500/10",
  },
  {
    id: "ideas",
    icon: Brain,
    label: "Brainstorm",
    prompt: "Brainstorm creative ideas for ",
    color: "text-indigo-400 bg-indigo-500/10",
  },
];

// Message Bubble Component
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

// Conversation List Item
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

// Main AI Chat Component
export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gemini-pro");
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // Load user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Load conversations from Firestore
  useEffect(() => {
    if (!user) return;

    const conversationsQuery = query(
      collection(db, "chat_conversations"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(20),
    );

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const convs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "New Conversation",
          lastMessage: data.lastMessage || "",
          timestamp: data.timestamp?.toDate?.() || new Date(),
          messageCount: data.messageCount || 0,
        };
      });
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [user]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, "chat_conversations", activeConversationId, "messages"),
      orderBy("timestamp", "asc"),
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role as "user" | "assistant" | "system",
          content: data.content || "",
          timestamp: data.timestamp?.toDate?.() || new Date(),
          model: data.model,
          tokens: data.tokens,
        };
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
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

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Add streaming placeholder
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
      // Call Gemini via Cloud Function
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error("Firebase not initialized");

      const functions = getFunctions(app);
      const chatWithAI = httpsCallable<
        { message: string; conversationId?: string; model?: string },
        { response: string; tokens: number; conversationId: string }
      >(functions, "chatWithAI");

      const result = await chatWithAI({
        message: userMessage.content,
        conversationId: activeConversationId || undefined,
        model: selectedModel,
      });

      // Update with real response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingId
            ? {
                ...msg,
                content: result.data.response,
                isStreaming: false,
                model: selectedModel,
                tokens: result.data.tokens,
              }
            : msg,
        ),
      );

      // Set active conversation if new
      if (!activeConversationId && result.data.conversationId) {
        setActiveConversationId(result.data.conversationId);
      }
    } catch (error: any) {
      console.error("Chat error:", error);

      // Fallback to local response
      const fallbackResponse = generateLocalResponse(userMessage.content);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingId
            ? {
                ...msg,
                content: fallbackResponse,
                isStreaming: false,
                model: "local-fallback",
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Local fallback response
  const generateLocalResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! I'm your AI assistant for Royal Carriage. I can help you with content generation, data analysis, code writing, and more. How can I assist you today?";
    }

    if (lowerMessage.includes("content") || lowerMessage.includes("seo")) {
      return `I can help you generate SEO-optimized content for Royal Carriage. Here's a sample:

**Luxury Airport Transportation in Chicago**

Experience the finest in luxury ground transportation with Royal Carriage Limousine. Our professional chauffeurs and immaculate fleet ensure you arrive at O'Hare or Midway in style and comfort.

**Why Choose Royal Carriage:**
- 24/7 availability
- Professional, licensed chauffeurs
- Real-time flight tracking
- Meet-and-greet service
- Premium vehicles

Contact us today for a quote on your next airport transfer!`;
    }

    if (lowerMessage.includes("analyze") || lowerMessage.includes("data")) {
      return `I can analyze your data. Please share the specific data or metrics you'd like me to look at, and I'll provide insights on:

- **Trends**: Identify patterns over time
- **Comparisons**: Compare different segments
- **Anomalies**: Spot unusual values
- **Recommendations**: Suggest improvements

What data would you like me to analyze?`;
    }

    if (lowerMessage.includes("code") || lowerMessage.includes("function")) {
      return `I can help you write code. Here's an example TypeScript function:

\`\`\`typescript
async function fetchBookings(customerId: string) {
  const bookingsRef = collection(db, 'bookings');
  const q = query(
    bookingsRef,
    where('customerId', '==', customerId),
    orderBy('pickupDate', 'desc'),
    limit(10)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
\`\`\`

What specific code would you like me to write?`;
    }

    return `I received your message: "${message}"

I'm your AI assistant for Royal Carriage. I can help with:
- **Content Generation**: SEO pages, blog posts, descriptions
- **Data Analysis**: Metrics, trends, insights
- **Code Writing**: TypeScript, React, Firebase
- **Translation**: Multiple languages
- **Summarization**: Condense long texts

What would you like help with?`;
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
      await deleteDoc(doc(db, "chat_conversations", id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  // Handle quick action
  const handleQuickAction = (action: QuickAction) => {
    setInput(action.prompt);
    inputRef.current?.focus();
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Sidebar - Conversation History */}
      {showHistory && (
        <div className="w-72 bg-slate-800/50 border-r border-slate-700 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-700">
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
              <option value="gemini-flash">Gemini Flash</option>
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
                  Online - {selectedModel}
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
            <button className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
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
                I'm your AI assistant for Royal Carriage. I can help with
                content generation, data analysis, code writing, and much more.
              </p>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800 transition-all group`}
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white">
                      {action.label}
                    </span>
                  </button>
                ))}
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
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>Powered by {selectedModel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChat;
