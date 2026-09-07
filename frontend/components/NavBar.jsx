"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setEmail(sessionStorage.getItem('email') || localStorage.getItem('email') || 'officer@gov.in');
    setRole(sessionStorage.getItem('role') || localStorage.getItem('role') || '');
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    router.push('/login');
  };

  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Upload Scan', path: '/upload' },
    { name: 'History', path: '/history' },
    ...(role === 'admin' ? [{ name: 'Rules Config', path: '/rules' }] : []),
    { name: 'Settings', path: '/settings' }
  ];

  if (pathname === '/login') return null;

  return (
    <nav className="w-full h-[calc(64px+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 bg-[#1E3A8A] shadow-[0_4px_20px_rgba(30,58,138,0.3)] transition-colors duration-500 border-b border-[#1E3A8A]">
      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center shrink-0 mr-1">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="State Emblem of India" 
            className="h-9 w-auto object-contain brightness-0 invert opacity-90"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-sans tracking-[0.05em] text-white/80 uppercase mb-0.5 font-medium">उपभोक्ता मामले विभाग • Dept. of Consumer Affairs</span>
          <span className="font-semibold tracking-tight text-[17px] text-white leading-none">MetroLens <span className="font-normal text-white/80 text-[15px]">Legal Metrology</span></span>
        </div>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-6">
        {links.map(l => (
          <Link key={l.name} href={l.path} className={`text-[14px] transition-colors ${pathname.includes(l.path) ? 'text-white font-semibold' : 'text-white/70 hover:text-white'}`}>
            {l.name}
          </Link>
        ))}
      </div>

      {/* Desktop Right Side */}
      <div className="hidden md:flex items-center gap-4">
        <span className="text-[13px] text-white/70">{email}</span>
        <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 !py-1.5 !px-3 !text-[13px] !rounded-full transition-colors">Log out</button>
      </div>

      {/* Hamburger Removed for Mobile Bottom Nav */}
    </nav>
  );
}


