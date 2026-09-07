"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const storedEmail = sessionStorage.getItem('email') || localStorage.getItem('email');
    const storedRole = sessionStorage.getItem('role') || localStorage.getItem('role');

    if (token) {
      setIsAuthenticated(true);
      setEmail(storedEmail || 'officer@doca.gov.in');
      setRole(storedRole || 'officer');
    } else {
      setIsAuthenticated(false);
      setEmail('');
      setRole('');
    }
  }, [pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    router.push('/login');
  };

  const authLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'New Inspection', path: '/upload' },
    { name: 'Inspection Ledger', path: '/history' },
    { name: 'Statutory Rules', path: '/rules' },
    { name: 'Settings', path: '/settings' }
  ];

  const publicLinks = [
    { name: 'Portal Home', path: '/' },
    { name: 'Statutory Rules (2011)', path: '/rules' },
    { name: 'About System', path: '/about' }
  ];

  const links = isAuthenticated ? authLinks : publicLinks;

  if (pathname === '/login') return null;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Official Government Tricolor Ribbon */}
      <div className="w-full h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] shrink-0" />

      <nav className="w-full h-[calc(64px+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] flex items-center justify-between px-4 md:px-8 bg-[#0B1F3A] shadow-[0_4px_20px_rgba(11,31,58,0.35)] border-b border-blue-950 transition-colors">
        
        {/* Brand & National Identity */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="flex items-center justify-center shrink-0">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="State Emblem of India" 
            className="h-9 w-auto object-contain brightness-0 invert opacity-95 group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="flex flex-col justify-center text-left">
          <span className="text-[10px] font-sans tracking-[0.05em] text-amber-300 uppercase leading-none mb-1 font-semibold">
            उपभोक्ता मामले विभाग • Dept. of Consumer Affairs
          </span>
          <span className="font-bold tracking-tight text-[17px] text-white leading-none">
            MetroLens <span className="font-normal text-slate-300 text-[14px]">Legal Metrology</span>
          </span>
        </div>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-6">
        {links.map(l => (
          <Link 
            key={l.name} 
            href={l.path} 
            className={`text-[13px] font-medium transition-colors ${
              pathname === l.path 
                ? 'text-amber-400 font-semibold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {l.name}
          </Link>
        ))}
      </div>

      {/* Desktop Right Actions */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-mono text-slate-300 hidden sm:inline-block bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
              {email}
            </span>
            <button 
              onClick={handleLogout} 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 py-1.5 px-3.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <Link 
              href="/login" 
              className="bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/20 py-1.5 px-3.5 text-xs font-semibold rounded-lg transition-colors"
            >
              Officer Sign In
            </Link>
            <Link 
              href="/upload" 
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 px-3.5 text-xs rounded-lg shadow-sm transition-all"
            >
              Start Inspection
            </Link>
          </div>
        )}
      </div>

    </nav>
    </header>
  );
}


