import React from 'react';

export default function RightPanel() {
  return (
    <aside className="w-96 bg-white p-4 border-l h-screen overflow-y-auto">
      <div className="mb-4">
        <h3 className="font-semibold">Live Feed</h3>
        <div className="text-xs text-slate-500">Realtime deploy logs, function status, and alerts</div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-sm">System Health</h4>
        <div className="mt-2 bg-slate-100 p-3 rounded">
          <div className="text-xs text-slate-600">Firestore: ● ONLINE (35ms)</div>
          <div className="text-xs text-slate-600">Functions: ● ONLINE (65ms)</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-sm">Mini Chart — Active Bookings</h4>
        <div className="h-24 bg-gradient-to-r from-emerald-200 to-emerald-400 rounded mt-2 flex items-center justify-center text-sm text-slate-700">Chart placeholder</div>
      </div>

      <div>
        <h4 className="font-medium text-sm">Chat / Assistant</h4>
        <div className="mt-2 border rounded p-2 text-sm text-slate-600">Open AI chat (connects to ai_chat_sessions)</div>
        <button className="mt-2 w-full bg-slate-800 text-white py-2 rounded">Open Chat</button>
      </div>
    </aside>
  );
}
