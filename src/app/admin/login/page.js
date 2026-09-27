'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin'); // Redirect to dashboard!
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      
      {/* Soft background decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border p-10 rounded-3xl shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary mx-auto rounded-full flex items-center justify-center mb-4">
            {/* Cute Lotus/Spa Icon */}
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25c-.7 3.3-2.8 6.1-5.7 7.7-1.4.8-2.9 1.2-4.5 1.5 2.5 1.3 5.4 1.5 8.2.5 1.3-.4 2.6-1.1 3.7-2.1l-1.7-7.6zm0 0c.7 3.3 2.8 6.1 5.7 7.7 1.4.8 2.9 1.2 4.5 1.5-2.5 1.3-5.4 1.5-8.2.5-1.3-.4-2.6-1.1-3.7-2.1l1.7-7.6z"/>
              <path d="M12 13.5c-3.5 0-6.8 1.5-9 4.1 2.3-1.6 5.1-2.4 8-2.1.3 0 .7.1 1 .2.3-.1.7-.2 1-.2 2.9-.3 5.7.5 8 2.1-2.2-2.6-5.5-4.1-9-4.1z"/>
              <path d="M12 15c-2.3 0-4.5.8-6.3 2.2 2 .5 4.1.8 6.3.8s4.3-.3 6.3-.8c-1.8-1.4-4-2.2-6.3-2.2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Log in to manage Aroma Spa appointments</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 ml-1">Username</label>
            <input
              type="text"
              required
              className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="e.g. aroma"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 ml-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 text-sm text-center rounded-xl font-medium animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-2xl font-bold text-lg transition-all shadow-lg ${
              isLoading 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : 'bg-primary text-primary-foreground hover:opacity-90 hover:shadow-primary/25 hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? 'Checking...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}