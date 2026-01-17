import React from 'react';

export default function LoginForm() {
  return (
    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Admin Sign In</h2>

      <label className="block text-sm text-slate-600">Email</label>
      <input className="w-full p-2 mt-1 mb-3 border rounded" type="email" placeholder="admin@royalcarriagelimo.com" />

      <label className="block text-sm text-slate-600">Password</label>
      <input className="w-full p-2 mt-1 mb-4 border rounded" type="password" placeholder="••••••••" />

      <button className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 mb-2">Sign in</button>

      <button className="w-full border border-slate-300 py-2 rounded mb-2">Sign in with Google</button>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <button className="underline">Forgot password?</button>
        <button className="underline">Request access</button>
      </div>

      <div className="mt-4 text-xs text-slate-500">
        <p><strong>Button labels:</strong></p>
        <ul className="list-disc ml-4">
          <li><strong>Sign in</strong>: authenticate using email/password (placeholder)</li>
          <li><strong>Sign in with Google</strong>: start Google OAuth (placeholder)</li>
          <li><strong>Forgot password?</strong>: opens password reset flow</li>
          <li><strong>Request access</strong>: starts admin onboarding request</li>
        </ul>
      </div>
    </div>
  );
}
