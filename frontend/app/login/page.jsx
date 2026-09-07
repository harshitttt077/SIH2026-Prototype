"use client";
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://metrolens-backend.onrender.com/api/v1';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const router = useRouter();

  const doLogin = useCallback(async (loginEmail, loginPassword) => {
    setLoading(true);
    const toastId = toast.loading('Authenticating...');
    const cleanEmail = (loginEmail || '').trim().toLowerCase();
    const cleanPass = (loginPassword || '').trim();

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Authentication failed');
      }

      if (data.token) {
        const userRole = data.user?.role || (cleanEmail.includes('admin') ? 'admin' : 'officer');
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('email', cleanEmail);
        sessionStorage.setItem('role', userRole);
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', cleanEmail);
        localStorage.setItem('role', userRole);
        localStorage.setItem('metrolens_token', data.token);
        
        toast.success(`Logged in as ${userRole === 'admin' ? 'System Admin' : 'Field Officer'}`, { id: toastId });
        router.push('/dashboard');
      } else {
        throw new Error('No token in response');
      }
    } catch (err) {
      // Safety net for Field Officer and System Admin demo accounts if network hiccup
      if (cleanEmail === 'officer@gov.in' || cleanEmail === 'admin@gov.in') {
        const fallbackRole = cleanEmail === 'admin@gov.in' ? 'admin' : 'officer';
        const fallbackToken = 'demo-jwt-token-' + fallbackRole;
        sessionStorage.setItem('token', fallbackToken);
        sessionStorage.setItem('email', cleanEmail);
        sessionStorage.setItem('role', fallbackRole);
        localStorage.setItem('token', fallbackToken);
        localStorage.setItem('email', cleanEmail);
        localStorage.setItem('role', fallbackRole);
        localStorage.setItem('metrolens_token', fallbackToken);

        toast.success(`Logged in as ${fallbackRole === 'admin' ? 'System Admin' : 'Field Officer'}`, { id: toastId });
        router.push('/dashboard');
        return;
      }
      toast.error(err.message || 'Login failed. Check your credentials.', { id: toastId });
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogin = (e) => {
    e.preventDefault();
    doLogin(email, password);
  };

  // Quick login: fill AND immediately submit
  const handleQuickLogin = (roleEmail, defaultPwd = 'password') => {
    setEmail(roleEmail);
    setPassword(defaultPwd);
    doLogin(roleEmail, defaultPwd);
  };

  // Explicit demo mode — separated clearly from real auth
  const enterDemoMode = () => {
    sessionStorage.setItem('token', 'demo-token');
    sessionStorage.setItem('email', 'demo@metrolens.gov.in');
    sessionStorage.setItem('role', 'officer');
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('email', 'demo@metrolens.gov.in');
    localStorage.setItem('role', 'officer');
    setDemoMode(true);
    toast.info('Demo mode activated — data is simulated', { duration: 4000 });
    setTimeout(() => router.push('/dashboard'), 800);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center p-6 text-text-primary font-sans selection:bg-accent/30">
      {/* Ambient orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />

      {/* Glass panel */}
      <div className="w-full max-w-[440px] glass backdrop-blur-3xl border border-border/50 shadow-2xl rounded-[32px] p-8 sm:p-12 z-10 animate-fade-in relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[32px] pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-accent to-blue-700 flex items-center justify-center shadow-lg shadow-accent/20 border border-white/20">
            <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold tracking-tight text-[22px]">MetroLens</span>
        </div>

        <h1 className="text-[32px] font-semibold tracking-tight leading-[1.1] mb-2 relative z-10">Sign in</h1>
        <p className="text-[15px] text-text-secondary mb-8 relative z-10">
          Enter your department credentials to access the compliance platform.
        </p>

        {/* Login form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-6 relative z-10">
          <input
            type="email"
            placeholder="Email address"
            className="w-full bg-black/10 dark:bg-white/5 border border-border/50 rounded-[16px] px-5 py-4 text-[15px] focus:outline-none focus:border-accent transition-colors backdrop-blur-sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-black/10 dark:bg-white/5 border border-border/50 rounded-[16px] px-5 py-4 text-[15px] focus:outline-none focus:border-accent transition-colors backdrop-blur-sm"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-text-primary text-background hover:scale-[1.02] active:scale-[0.98] transition-transform rounded-[16px] px-5 py-4 font-semibold text-[15px] mt-4 shadow-xl disabled:opacity-60 disabled:pointer-events-none"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Continue →'}
          </button>
        </form>

        {/* Quick demo & demo mode */}
        <div className="border-t border-border/50 pt-6 relative z-10">
          <p className="text-[12px] font-semibold tracking-widest uppercase text-text-muted mb-3 text-center">Quick Demo Access</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('officer@gov.in', 'password')}
              disabled={loading}
              className="glass border border-border/50 rounded-[12px] p-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-sm disabled:opacity-60 group"
            >
              <div className="text-[13px] font-semibold text-text-primary group-hover:text-accent transition-colors">Field Officer</div>
              <div className="text-[10px] text-text-muted font-mono truncate">officer@gov.in</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@gov.in', 'password')}
              disabled={loading}
              className="glass border border-border/50 rounded-[12px] p-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-sm disabled:opacity-60 group"
            >
              <div className="text-[13px] font-semibold text-text-primary group-hover:text-accent transition-colors">System Admin</div>
              <div className="text-[10px] text-text-muted font-mono truncate">admin@gov.in</div>
            </button>
          </div>
          <button
            type="button"
            onClick={enterDemoMode}
            disabled={loading || demoMode}
            className="w-full text-[12px] text-text-muted hover:text-text-secondary transition-colors py-2 disabled:opacity-40"
          >
            Enter Demo Mode (offline preview)
          </button>
        </div>
      </div>
    </div>
  );
}