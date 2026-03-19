'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: '🏀 Scores' },
  { href: '/leaderboard', label: '🏆 Leaderboard' },
  { href: '/teams', label: '📋 Teams' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-lg font-bold text-white flex items-center gap-2">
            🏀 <span className="hidden sm:inline">2026 Calcutta Tracker</span>
            <span className="sm:hidden">Calcutta</span>
          </Link>
          <div className="flex gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
