import React from 'react';
import TopBar from '../components/TopBar';
import LeftSidebar from '../components/LeftSidebar';
import RightPanel from '../components/RightPanel';
import LoginForm from '../components/ui/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="flex">
        <LeftSidebar />

        <main className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-center">
              <LoginForm />
            </div>

            <div className="hidden md:block">
              <div className="bg-white p-6 rounded shadow">
                <h3 className="font-semibold mb-2">Dashboard preview</h3>
                <p className="text-sm text-slate-600 mb-4">Visual placeholders for the admin interface. Buttons are annotated below.</p>

                <div className="space-y-3 text-sm">
                  <div className="p-3 border rounded">
                    <strong>Top bar</strong>: global search, notifications, quick actions (deploy, run AI jobs)
                  </div>
                  <div className="p-3 border rounded">
                    <strong>Left nav</strong>: Overview, Fleet, Drivers, Schedule, AI Command Center, Deploy, Chat, Settings
                  </div>
                  <div className="p-3 border rounded">
                    <strong>Right panel</strong>: Live feed, health, mini charts, chat assistant
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <RightPanel />
      </div>
    </div>
  );
}
