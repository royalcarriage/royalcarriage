import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Terminal,
  Cpu,
  Activity,
  Zap,
  Database,
  Cloud,
  GitBranch,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Play,
  Pause,
  BarChart3,
  TrendingUp,
  Bot,
  Sparkles,
  Server,
  Wifi,
  WifiOff,
  Clock,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, collection, query, orderBy, limit, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';

// Types
interface CommandHistoryItem {
  id: string;
  command: string;
  output: string;
  status: 'success' | 'error' | 'pending';
  timestamp: Date;
  type: 'firebase' | 'gemini' | 'git' | 'system';
}

interface AIMetric {
  timestamp: string;
  requests: number;
  latency: number;
  tokens: number;
  cost: number;
}

interface SystemStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  latency: number;
  lastCheck: Date;
}

// Mock data for AI metrics
const generateMockMetrics = (): AIMetric[] => {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(now.getTime() - (23 - i) * 3600000).toLocaleTimeString('en-US', { hour: '2-digit' }),
    requests: Math.floor(Math.random() * 500) + 100,
    latency: Math.floor(Math.random() * 200) + 50,
    tokens: Math.floor(Math.random() * 50000) + 10000,
    cost: Math.random() * 5 + 0.5,
  }));
};

const modelUsageData = [
  { name: 'Gemini Pro', value: 45, color: '#8b5cf6' },
  { name: 'Gemini Flash', value: 30, color: '#06b6d4' },
  { name: 'GPT-4', value: 15, color: '#10b981' },
  { name: 'Claude', value: 10, color: '#f59e0b' },
];

const functionCallsData = [
  { name: 'Content Gen', calls: 1250, success: 1180 },
  { name: 'SEO Analysis', calls: 890, success: 875 },
  { name: 'Image Gen', calls: 456, success: 432 },
  { name: 'Translation', calls: 320, success: 315 },
  { name: 'Sentiment', calls: 180, success: 178 },
];

// Terminal Component
function AITerminal({
  onCommand
}: {
  onCommand: (cmd: string, type: CommandHistoryItem['type']) => Promise<string>
}) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const detectCommandType = (cmd: string): CommandHistoryItem['type'] => {
    if (cmd.startsWith('firebase ') || cmd.startsWith('fb ')) return 'firebase';
    if (cmd.startsWith('gemini ') || cmd.startsWith('ai ')) return 'gemini';
    if (cmd.startsWith('git ')) return 'git';
    return 'system';
  };

  const executeCommand = async () => {
    if (!input.trim() || isProcessing) return;

    const cmd = input.trim();
    const type = detectCommandType(cmd);
    const newItem: CommandHistoryItem = {
      id: Date.now().toString(),
      command: cmd,
      output: '',
      status: 'pending',
      timestamp: new Date(),
      type,
    };

    setHistory(prev => [...prev, newItem]);
    setInput('');
    setIsProcessing(true);

    try {
      const output = await onCommand(cmd, type);
      setHistory(prev =>
        prev.map(item =>
          item.id === newItem.id
            ? { ...item, output, status: 'success' }
            : item
        )
      );
    } catch (error) {
      setHistory(prev =>
        prev.map(item =>
          item.id === newItem.id
            ? { ...item, output: String(error), status: 'error' }
            : item
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const getTypeColor = (type: CommandHistoryItem['type']) => {
    switch (type) {
      case 'firebase': return 'text-orange-400';
      case 'gemini': return 'text-purple-400';
      case 'git': return 'text-green-400';
      default: return 'text-cyan-400';
    }
  };

  const getTypeIcon = (type: CommandHistoryItem['type']) => {
    switch (type) {
      case 'firebase': return <Database className="w-4 h-4" />;
      case 'gemini': return <Sparkles className="w-4 h-4" />;
      case 'git': return <GitBranch className="w-4 h-4" />;
      default: return <Terminal className="w-4 h-4" />;
    }
  };

  return (
    <div className={`bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-slate-400 text-sm font-mono">AI Command Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistory([])}
            className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
            title="Clear history"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={historyRef}
        className={`font-mono text-sm p-4 overflow-y-auto ${isExpanded ? 'h-[calc(100vh-180px)]' : 'h-64'}`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Welcome Message */}
        <div className="text-slate-500 mb-4">
          <div className="text-amber-400 mb-2">Royal Carriage AI Command Center v1.0</div>
          <div>Available commands:</div>
          <div className="ml-4 text-slate-600">
            <div><span className="text-orange-400">firebase</span> / <span className="text-orange-400">fb</span> - Firebase CLI commands</div>
            <div><span className="text-purple-400">gemini</span> / <span className="text-purple-400">ai</span> - Gemini AI commands</div>
            <div><span className="text-green-400">git</span> - Git operations</div>
            <div><span className="text-cyan-400">system</span> - System diagnostics</div>
          </div>
          <div className="mt-2 text-slate-600">Type 'help' for full command list.</div>
        </div>

        {/* Command History */}
        {history.map(item => (
          <div key={item.id} className="mb-3">
            <div className="flex items-center gap-2">
              <span className={getTypeColor(item.type)}>{getTypeIcon(item.type)}</span>
              <span className="text-slate-500">$</span>
              <span className="text-white">{item.command}</span>
              {item.status === 'pending' && (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin ml-2" />
              )}
            </div>
            {item.output && (
              <div className={`ml-6 mt-1 ${item.status === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
                <pre className="whitespace-pre-wrap">{item.output}</pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-t border-slate-700">
        <span className="text-green-400 font-mono">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && executeCommand()}
          placeholder="Enter command..."
          disabled={isProcessing}
          className="flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder:text-slate-600"
        />
        <button
          onClick={executeCommand}
          disabled={isProcessing || !input.trim()}
          className="p-2 text-amber-400 hover:text-amber-300 disabled:text-slate-600 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// System Status Card
function SystemStatusCard({ system }: { system: SystemStatus }) {
  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'offline': return 'bg-red-500';
      case 'degraded': return 'bg-amber-500';
    }
  };

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'online': return <Wifi className="w-4 h-4 text-emerald-400" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-red-400" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(system.status)}
          <span className="text-white font-medium">{system.name}</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${getStatusColor(system.status)} animate-pulse`} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">Latency</span>
        <span className="text-white">{system.latency}ms</span>
      </div>
      <div className="flex items-center justify-between text-sm mt-1">
        <span className="text-slate-400">Last check</span>
        <span className="text-slate-300">{system.lastCheck.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

// Metric Card
function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
}) {
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl bg-amber-500/10">
          <Icon className="w-5 h-5 text-amber-400" />
        </div>
        <span className={`text-sm font-medium ${trendColor}`}>{change}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
    </div>
  );
}

// Activity Feed Item
function ActivityItem({
  type,
  message,
  time,
  status,
}: {
  type: 'ai' | 'deploy' | 'content' | 'system';
  message: string;
  time: string;
  status: 'success' | 'error' | 'pending';
}) {
  const getIcon = () => {
    switch (type) {
      case 'ai': return <Bot className="w-4 h-4 text-purple-400" />;
      case 'deploy': return <Cloud className="w-4 h-4 text-cyan-400" />;
      case 'content': return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'system': return <Server className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending': return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />;
    }
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-700/50 last:border-0">
      <div className="p-2 rounded-lg bg-slate-700/50">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{message}</p>
        <p className="text-xs text-slate-500 mt-0.5">{time}</p>
      </div>
      {getStatusIcon()}
    </div>
  );
}

// Main Component
export function AICommandCenter() {
  const [metrics] = useState<AIMetric[]>(generateMockMetrics());
  const [systems, setSystems] = useState<SystemStatus[]>([
    { name: 'Firebase', status: 'online', latency: 45, lastCheck: new Date() },
    { name: 'Gemini AI', status: 'online', latency: 120, lastCheck: new Date() },
    { name: 'Git/GitHub', status: 'online', latency: 85, lastCheck: new Date() },
    { name: 'Cloud Functions', status: 'online', latency: 65, lastCheck: new Date() },
    { name: 'Firestore', status: 'online', latency: 35, lastCheck: new Date() },
    { name: 'Storage', status: 'online', latency: 50, lastCheck: new Date() },
  ]);
  const [activities, setActivities] = useState([
    { type: 'ai' as const, message: 'Generated content for 12 location pages', time: '2 min ago', status: 'success' as const },
    { type: 'deploy' as const, message: 'Deployed admin dashboard to production', time: '15 min ago', status: 'success' as const },
    { type: 'content' as const, message: 'SEO analysis completed for wedding services', time: '23 min ago', status: 'success' as const },
    { type: 'system' as const, message: 'Database backup completed', time: '1 hour ago', status: 'success' as const },
    { type: 'ai' as const, message: 'Sentiment analysis on 45 reviews', time: '2 hours ago', status: 'success' as const },
  ]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Calculate totals
  const totalRequests = metrics.reduce((sum, m) => sum + m.requests, 0);
  const avgLatency = Math.round(metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length);
  const totalTokens = metrics.reduce((sum, m) => sum + m.tokens, 0);
  const totalCost = metrics.reduce((sum, m) => sum + m.cost, 0).toFixed(2);

  // Handle terminal commands
  const handleCommand = async (cmd: string, type: CommandHistoryItem['type']): Promise<string> => {
    // Simulate command processing
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    // Command handlers
    if (cmd === 'help') {
      return `Available Commands:
────────────────────────────────────────
Firebase Commands:
  firebase deploy --only functions    Deploy Cloud Functions
  firebase deploy --only hosting      Deploy static hosting
  fb list                            List all Firebase projects
  fb functions:log                   View function logs

Gemini/AI Commands:
  gemini generate <prompt>           Generate content with Gemini
  ai analyze <text>                  Analyze text sentiment
  ai summarize <content>             Summarize content
  ai translate <text> --to=<lang>    Translate content

Git Commands:
  git status                         Show git status
  git log --oneline -5               Show recent commits
  git pull                           Pull latest changes
  git push                           Push changes

System Commands:
  system status                      Show all system statuses
  system metrics                     Display current metrics
  clear                              Clear terminal
────────────────────────────────────────`;
    }

    if (cmd === 'clear') {
      return '';
    }

    if (cmd === 'system status') {
      return `System Status Report
────────────────────────────────────────
Firebase:        ● ONLINE   (45ms)
Gemini AI:       ● ONLINE   (120ms)
Git/GitHub:      ● ONLINE   (85ms)
Cloud Functions: ● ONLINE   (65ms)
Firestore:       ● ONLINE   (35ms)
Storage:         ● ONLINE   (50ms)
────────────────────────────────────────
All systems operational.`;
    }

    if (cmd.startsWith('firebase deploy') || cmd.startsWith('fb deploy')) {
      return `Deploying to Firebase...

✔ functions: Finished running predeploy script.
i  functions: preparing functions directory...
i  functions: packaged 64 functions
✔ functions[generateContent] deploy complete
✔ functions[analyzeContent] deploy complete
✔ functions[importCSV] deploy complete
... (61 more functions)

✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/royalcarriagelimoseo
Hosting URL: https://royalcarriagelimoseo.web.app`;
    }

    if (cmd.startsWith('gemini generate') || cmd.startsWith('ai generate')) {
      const prompt = cmd.replace(/^(gemini|ai)\s+generate\s*/, '');
      return `Generating content with Gemini Pro...

Prompt: "${prompt || 'No prompt provided'}"

Generated Response:
────────────────────────────────────────
Royal Carriage Limousine offers premium luxury transportation
services throughout the Chicago metropolitan area. Our fleet
of executive vehicles provides first-class comfort for airport
transfers, corporate events, weddings, and special occasions.

Experience the difference of professional chauffeur service
with our commitment to punctuality, safety, and elegance.
────────────────────────────────────────

Tokens used: 2,450
Latency: 1.2s
Model: gemini-pro`;
    }

    if (cmd === 'git status') {
      return `On branch ai/integration-sync
Your branch is ahead of 'origin/ai/integration-sync' by 4 commits.

Changes not staged for commit:
  modified:   apps/admin/src/pages/ai-command-center.tsx

Untracked files:
  apps/admin/src/components/AICharts.tsx

no changes added to commit`;
    }

    if (cmd === 'git log --oneline -5') {
      return `639130223 feat(enterprise): integrate gemini-workspace CSV import
52dee86c1 auto-commit
a0a476bc0 docs: update TICKETS.md with completion
a8f2d74ca feat(enterprise): complete P2.2, P2.3
695d01d05 chore(env): add CLAUDE_API_KEY`;
    }

    if (cmd === 'system metrics') {
      return `Current Metrics
────────────────────────────────────────
Total Requests (24h):    ${totalRequests.toLocaleString()}
Avg Latency:             ${avgLatency}ms
Total Tokens:            ${totalTokens.toLocaleString()}
Estimated Cost:          $${totalCost}
────────────────────────────────────────
Active Functions:        64
Content Generated:       1,250 pages
Images Optimized:        432
Translations:            315`;
    }

    if (cmd.startsWith('fb list') || cmd.startsWith('firebase list')) {
      return `Firebase Projects:
────────────────────────────────────────
┌─────────────────────────┬──────────────┐
│ Project ID              │ Status       │
├─────────────────────────┼──────────────┤
│ royalcarriagelimoseo    │ ● Active     │
│ chicagoairportblackcar  │ ● Linked     │
│ chicago-partybus        │ ● Linked     │
└─────────────────────────┴──────────────┘`;
    }

    // Default response for unknown commands
    return `Command executed: ${cmd}
Type 'help' for available commands.`;
  };

  // Refresh system status
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      setSystems(prev =>
        prev.map(s => ({
          ...s,
          latency: Math.max(20, s.latency + Math.floor(Math.random() * 20) - 10),
          lastCheck: new Date(),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-amber-400" />
            AI Command Center
          </h1>
          <p className="text-slate-400 mt-1">Unified control panel for all AI systems and operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
              isAutoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-700/50 border-slate-600 text-slate-400'
            }`}
          >
            {isAutoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isAutoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button className="p-2 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Requests (24h)"
          value={totalRequests.toLocaleString()}
          change="+12.5%"
          icon={Activity}
          trend="up"
        />
        <MetricCard
          title="Avg Latency"
          value={`${avgLatency}ms`}
          change="-8.2%"
          icon={Zap}
          trend="down"
        />
        <MetricCard
          title="Total Tokens"
          value={`${(totalTokens / 1000).toFixed(1)}K`}
          change="+24.8%"
          icon={Cpu}
          trend="up"
        />
        <MetricCard
          title="Estimated Cost"
          value={`$${totalCost}`}
          change="+5.3%"
          icon={BarChart3}
          trend="up"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal - Takes 2 columns */}
        <div className="lg:col-span-2">
          <AITerminal onCommand={handleCommand} />
        </div>

        {/* Activity Feed */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Live Activity
            </h3>
            <span className="text-xs text-slate-500">Updated just now</span>
          </div>
          <div className="space-y-1">
            {activities.map((activity, i) => (
              <ActivityItem key={i} {...activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Volume Chart */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            AI Request Volume (24h)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={metrics}>
              <defs>
                <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#requestGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Latency Chart */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Response Latency (24h)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Usage Pie Chart */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Model Usage
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={modelUsageData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {modelUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {modelUsageData.map((model, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: model.color }} />
                <span className="text-sm text-slate-300">{model.name}</span>
                <span className="text-sm text-slate-500 ml-auto">{model.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Function Calls Bar Chart */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-emerald-400" />
            Function Calls
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={functionCallsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 12 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="calls" fill="#6366f1" radius={[0, 4, 4, 0]} />
              <Bar dataKey="success" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* System Status Grid */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-slate-400" />
            System Status
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {systems.map((system, i) => (
              <SystemStatusCard key={i} system={system} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AICommandCenter;
