import { useState, useEffect } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Star,
  Send,
  Sparkles,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Phone,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ensureFirebaseApp } from '../lib/firebaseClient';
import { useAuth } from '../state/AuthProvider';

// Types
interface FeedbackAlert {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  rating: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  feedback: string;
  source: 'google' | 'yelp' | 'direct' | 'survey';
  bookingId?: string;
  status: 'new' | 'in_progress' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  assignedTo?: string;
  aiSuggestion?: string;
  response?: string;
  respondedAt?: Date;
}

// Mock data
const mockAlerts: FeedbackAlert[] = [
  {
    id: '1',
    customerId: 'c1',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    customerPhone: '(312) 555-0123',
    rating: 2,
    sentiment: 'negative',
    feedback: 'The driver was 15 minutes late for our airport pickup. Very stressful experience as we almost missed our flight.',
    source: 'google',
    bookingId: 'BK-2026-0115',
    status: 'new',
    priority: 'high',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    customerId: 'c2',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@company.com',
    rating: 1,
    sentiment: 'negative',
    feedback: 'Vehicle was not clean and the AC was not working properly. Expected much better for a luxury service.',
    source: 'yelp',
    bookingId: 'BK-2026-0114',
    status: 'in_progress',
    priority: 'critical',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    assignedTo: 'Manager',
    aiSuggestion: 'Dear Sarah, We sincerely apologize for the subpar experience. Vehicle cleanliness and comfort are our top priorities, and we clearly fell short. We would like to offer you a complimentary ride and have taken immediate action with our fleet maintenance team. Please contact us directly so we can make this right.',
  },
  {
    id: '3',
    customerId: 'c3',
    customerName: 'Michael Chen',
    customerEmail: 'm.chen@gmail.com',
    rating: 3,
    sentiment: 'neutral',
    feedback: 'Service was okay, but communication could be improved. Received confirmation but no driver updates.',
    source: 'survey',
    status: 'new',
    priority: 'medium',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: '4',
    customerId: 'c4',
    customerName: 'Emily Davis',
    customerEmail: 'emily.d@email.com',
    rating: 5,
    sentiment: 'positive',
    feedback: 'Absolutely wonderful service! Marcus was professional, punctual, and made our wedding day transportation perfect.',
    source: 'google',
    bookingId: 'BK-2026-0112',
    status: 'resolved',
    priority: 'low',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    response: 'Thank you so much for the kind words, Emily! We are thrilled we could be part of your special day.',
    respondedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
  },
  {
    id: '5',
    customerId: 'c5',
    customerName: 'Robert Wilson',
    customerEmail: 'r.wilson@business.com',
    rating: 2,
    sentiment: 'negative',
    feedback: 'Charged more than the quoted price without explanation. Need clarity on pricing.',
    source: 'direct',
    bookingId: 'BK-2026-0113',
    status: 'escalated',
    priority: 'critical',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    assignedTo: 'Billing Manager',
  },
];

// Alert Card Component
function AlertCard({
  alert,
  onGenerateSuggestion,
  onRespond,
  onEscalate,
  onResolve,
  isGenerating,
}: {
  alert: FeedbackAlert;
  onGenerateSuggestion: (id: string) => void;
  onRespond: (id: string, response: string) => void;
  onEscalate: (id: string) => void;
  onResolve: (id: string) => void;
  isGenerating: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [responseText, setResponseText] = useState(alert.aiSuggestion || '');

  const getSentimentColor = () => {
    switch (alert.sentiment) {
      case 'positive': return 'text-emerald-400 bg-emerald-500/10';
      case 'negative': return 'text-red-400 bg-red-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  const getPriorityColor = () => {
    switch (alert.priority) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getStatusColor = () => {
    switch (alert.status) {
      case 'resolved': return 'text-emerald-400 bg-emerald-500/10';
      case 'escalated': return 'text-red-400 bg-red-500/10';
      case 'in_progress': return 'text-amber-400 bg-amber-500/10';
      default: return 'text-cyan-400 bg-cyan-500/10';
    }
  };

  const getSourceIcon = () => {
    switch (alert.source) {
      case 'google': return '🌐';
      case 'yelp': return '⭐';
      case 'survey': return '📋';
      default: return '💬';
    }
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border ${
      alert.priority === 'critical' ? 'border-red-500/50' :
      alert.priority === 'high' ? 'border-orange-500/30' : 'border-slate-700'
    } overflow-hidden`}>
      {/* Header */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`p-2 rounded-xl ${getSentimentColor()}`}>
          {alert.sentiment === 'positive' ? (
            <ThumbsUp className="w-5 h-5" />
          ) : alert.sentiment === 'negative' ? (
            <ThumbsDown className="w-5 h-5" />
          ) : (
            <MessageSquare className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{alert.customerName}</span>
            <span className="text-slate-500">{getSourceIcon()}</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${star <= alert.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-400 truncate">{alert.feedback}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor()}`}>
            {alert.priority.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {alert.status.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(alert.createdAt)}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-700 p-4 space-y-4">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-slate-500" />
              <a href={`mailto:${alert.customerEmail}`} className="text-cyan-400 hover:underline">
                {alert.customerEmail}
              </a>
            </div>
            {alert.customerPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-500" />
                <span className="text-slate-300">{alert.customerPhone}</span>
              </div>
            )}
            {alert.bookingId && (
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="w-4 h-4 text-slate-500" />
                <span className="text-slate-300">Booking: {alert.bookingId}</span>
              </div>
            )}
          </div>

          {/* Full Feedback */}
          <div className="bg-slate-700/30 rounded-xl p-4">
            <p className="text-slate-300">{alert.feedback}</p>
          </div>

          {/* AI Suggestion Section */}
          {alert.status !== 'resolved' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  AI Response Suggestion
                </h4>
                <button
                  onClick={() => onGenerateSuggestion(alert.id)}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-lg text-sm hover:bg-purple-600/30 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                placeholder="AI-generated response will appear here, or write your own..."
                className="w-full h-32 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {/* Previous Response */}
          {alert.response && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">Response Sent</span>
                {alert.respondedAt && (
                  <span className="text-xs text-slate-500">{timeAgo(alert.respondedAt)}</span>
                )}
              </div>
              <p className="text-sm text-slate-300">{alert.response}</p>
            </div>
          )}

          {/* Actions */}
          {alert.status !== 'resolved' && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onRespond(alert.id, responseText)}
                disabled={!responseText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Send Response
              </button>
              {alert.status !== 'escalated' && (
                <button
                  onClick={() => onEscalate(alert.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600/20 text-orange-400 rounded-xl text-sm hover:bg-orange-600/30 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Escalate
                </button>
              )}
              <button
                onClick={() => onResolve(alert.id)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-xl text-sm hover:bg-slate-500 transition-colors ml-auto"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Resolved
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main Component
export function FeedbackAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<FeedbackAlert[]>(mockAlerts);
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'escalated' | 'resolved'>('all');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [useRealData, setUseRealData] = useState(false);

  // Load real data from Firestore
  useEffect(() => {
    if (!useRealData) return;

    const feedbackQuery = query(
      collection(db, 'feedback'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(feedbackQuery, (snapshot) => {
      const realAlerts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          customerId: data.customerId || '',
          customerName: data.customerName || 'Unknown',
          customerEmail: data.customerEmail || '',
          customerPhone: data.customerPhone,
          rating: data.rating || 3,
          sentiment: data.sentiment || 'neutral',
          feedback: data.feedback || '',
          source: data.source || 'direct',
          bookingId: data.bookingId,
          status: data.status || 'new',
          priority: data.priority || 'medium',
          createdAt: data.createdAt?.toDate() || new Date(),
          assignedTo: data.assignedTo,
          aiSuggestion: data.aiSuggestion,
          response: data.response,
          respondedAt: data.respondedAt?.toDate(),
        } as FeedbackAlert;
      });

      if (realAlerts.length > 0) {
        setAlerts(realAlerts);
      }
    });

    return () => unsubscribe();
  }, [useRealData]);

  const filteredAlerts = alerts.filter(alert => {
    if (filter !== 'all' && alert.status !== filter) return false;
    if (sentimentFilter !== 'all' && alert.sentiment !== sentimentFilter) return false;
    return true;
  });

  const stats = {
    total: alerts.length,
    new: alerts.filter(a => a.status === 'new').length,
    inProgress: alerts.filter(a => a.status === 'in_progress').length,
    escalated: alerts.filter(a => a.status === 'escalated').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    negative: alerts.filter(a => a.sentiment === 'negative').length,
  };

  const handleGenerateSuggestion = async (id: string) => {
    setGeneratingId(id);

    try {
      // Try using Gemini via Cloud Function
      const { app } = ensureFirebaseApp();
      if (app) {
        const functions = getFunctions(app);
        const quickAIAction = httpsCallable<
          { action: string; content: string },
          { result: string; tokens: number }
        >(functions, 'quickAIAction');

        const alert = alerts.find(a => a.id === id);
        if (alert) {
          const result = await quickAIAction({
            action: 'generate',
            content: `Write a professional, empathetic customer service response to this feedback from ${alert.customerName}: "${alert.feedback}". The response should apologize if appropriate, address their concerns, and offer a solution.`,
          });

          setAlerts(prev =>
            prev.map(a => (a.id === id ? { ...a, aiSuggestion: result.data.result } : a))
          );

          // Update Firestore if using real data
          if (useRealData) {
            await updateDoc(doc(db, 'feedback', id), {
              aiSuggestion: result.data.result,
            });
          }

          setGeneratingId(null);
          return;
        }
      }
    } catch (error) {
      console.warn('Cloud Function failed, using fallback:', error);
    }

    // Fallback to local generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const alert = alerts.find(a => a.id === id);
    if (alert) {
      const suggestion = `Dear ${alert.customerName},

Thank you for taking the time to share your feedback. We sincerely apologize for the experience you described. At Royal Carriage, we hold ourselves to the highest standards, and we clearly fell short in this instance.

We have shared your feedback with our operations team and have taken immediate steps to address the issues you mentioned. We would be honored to have the opportunity to provide you with the exceptional service you deserve.

Please contact us directly at (312) 555-0000, and we would like to offer you a complimentary upgrade on your next ride as a gesture of our commitment to your satisfaction.

Warm regards,
The Royal Carriage Team`;

      setAlerts(prev =>
        prev.map(a => (a.id === id ? { ...a, aiSuggestion: suggestion } : a))
      );
    }
    setGeneratingId(null);
  };

  const handleRespond = async (id: string, response: string) => {
    // Update local state
    setAlerts(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, status: 'resolved', response, respondedAt: new Date() }
          : a
      )
    );

    // Update Firestore if using real data
    if (useRealData) {
      try {
        await updateDoc(doc(db, 'feedback', id), {
          status: 'resolved',
          response,
          respondedAt: Timestamp.now(),
          respondedBy: user?.email,
        });

        // Log activity
        await addDoc(collection(db, 'activity_log'), {
          type: 'content',
          message: `Responded to feedback from ${alerts.find(a => a.id === id)?.customerName}`,
          status: 'success',
          userId: user?.uid,
          timestamp: Timestamp.now(),
        });
      } catch (error) {
        console.error('Error updating feedback:', error);
      }
    }
  };

  const handleEscalate = async (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'escalated', assignedTo: 'Manager' } : a))
    );

    if (useRealData) {
      try {
        await updateDoc(doc(db, 'feedback', id), {
          status: 'escalated',
          assignedTo: 'Manager',
          escalatedAt: Timestamp.now(),
          escalatedBy: user?.email,
        });

        await addDoc(collection(db, 'activity_log'), {
          type: 'system',
          message: `Escalated feedback from ${alerts.find(a => a.id === id)?.customerName}`,
          status: 'pending',
          userId: user?.uid,
          timestamp: Timestamp.now(),
        });
      } catch (error) {
        console.error('Error escalating feedback:', error);
      }
    }
  };

  const handleResolve = async (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'resolved' } : a))
    );

    if (useRealData) {
      try {
        await updateDoc(doc(db, 'feedback', id), {
          status: 'resolved',
          resolvedAt: Timestamp.now(),
          resolvedBy: user?.email,
        });

        await addDoc(collection(db, 'activity_log'), {
          type: 'content',
          message: `Resolved feedback from ${alerts.find(a => a.id === id)?.customerName}`,
          status: 'success',
          userId: user?.uid,
          timestamp: Timestamp.now(),
        });
      } catch (error) {
        console.error('Error resolving feedback:', error);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Toggle real data mode
    setUseRealData(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-amber-400" />
            Feedback Alerts
          </h1>
          <p className="text-slate-400 mt-1">Monitor and respond to customer feedback with AI assistance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-slate-400">Total Alerts</div>
        </div>
        <div className="bg-gradient-to-br from-cyan-900/30 to-slate-900 rounded-xl p-4 border border-cyan-700/30">
          <div className="text-2xl font-bold text-cyan-400">{stats.new}</div>
          <div className="text-sm text-slate-400">New</div>
        </div>
        <div className="bg-gradient-to-br from-amber-900/30 to-slate-900 rounded-xl p-4 border border-amber-700/30">
          <div className="text-2xl font-bold text-amber-400">{stats.inProgress}</div>
          <div className="text-sm text-slate-400">In Progress</div>
        </div>
        <div className="bg-gradient-to-br from-red-900/30 to-slate-900 rounded-xl p-4 border border-red-700/30">
          <div className="text-2xl font-bold text-red-400">{stats.escalated}</div>
          <div className="text-sm text-slate-400">Escalated</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900 rounded-xl p-4 border border-emerald-700/30">
          <div className="text-2xl font-bold text-emerald-400">{stats.resolved}</div>
          <div className="text-sm text-slate-400">Resolved</div>
        </div>
        <div className="bg-gradient-to-br from-red-900/30 to-slate-900 rounded-xl p-4 border border-red-700/30">
          <div className="text-2xl font-bold text-red-400">{stats.negative}</div>
          <div className="text-sm text-slate-400">Negative</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Status:</span>
          <div className="flex gap-1">
            {(['all', 'new', 'in_progress', 'escalated', 'resolved'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filter === status
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Sentiment:</span>
          <div className="flex gap-1">
            {(['all', 'negative', 'neutral', 'positive'] as const).map(sentiment => (
              <button
                key={sentiment}
                onClick={() => setSentimentFilter(sentiment)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  sentimentFilter === sentiment
                    ? sentiment === 'negative'
                      ? 'bg-red-600 text-white'
                      : sentiment === 'positive'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-slate-300">No alerts matching your filters</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onGenerateSuggestion={handleGenerateSuggestion}
              onRespond={handleRespond}
              onEscalate={handleEscalate}
              onResolve={handleResolve}
              isGenerating={generatingId === alert.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default FeedbackAlerts;
