import React from 'react';

export default function LeftSidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-100 h-screen p-4">
      <div className="mb-6 font-bold">Navigation</div>
      <nav className="flex flex-col gap-2 text-sm">
        <button className="text-left p-2 rounded hover:bg-slate-800">Overview — Dashboard overview, KPIs</button>
        <button className="text-left p-2 rounded hover:bg-slate-800">Fleet Management — Vehicles & assignments</button>
        <button className="text-left p-2 rounded hover:bg-slate-800">Drivers — Driver profiles & status</button>
        <button className="text-left p-2 rounded hover:bg-slate-800">Schedule — Bookings & assignments</button>
        <button className="text-left p-2 rounded hover:bg-slate-800">AI Command Center — Run AI jobs & terminal</button>
        <button className="text-left p-2 rounded hover:bg-slate-800">Deploy — Deploy hosting/functions</button>
        <button className="text-left p-2 rounded hover:bg-slate-800">Chat — Internal chat & AI assistant</button>
        <button className="text-left p-2 rounded hover:bg-slate-800">Settings — Organization & RBAC</button>
      </nav>

      <div className="mt-6 text-xs text-slate-400">
        <p className="font-semibold">Notes</p>
        <p>Buttons are visual placeholders, mapped to backend actions:</p>
        <ul className="list-disc ml-4">
          <li><strong>Deploy</strong>: triggers Firebase deploy (hosting/functions)</li>
          <li><strong>AI Command Center</strong>: opens CLI/terminal to run cloud functions</li>
          <li><strong>Chat</strong>: opens ai_chat_sessions collection UI</li>
        </ul>
      </div>
    </aside>
  );
}
