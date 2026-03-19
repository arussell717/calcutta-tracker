'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: '🏠 Home', emoji: '🏠' },
  { href: '/leaderboard', label: '🏆 Leaderboard', emoji: '🏆' },
  { href: '/teams', label: '👥 Teams', emoji: '👥' },
  { href: '/bracket', label: '🏀 Bracket', emoji: '🏀' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Top header */}
      <header className="bg-[#12121f] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏀</span>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Calcutta Tracker</h1>
              <p className="text-xs text-gray-400">2026 March Madness</p>
            </div>
          </Link>
          <div className="hidden sm:flex gap-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#12121f] border-t border-gray-800 z-50">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs ${
                pathname === item.href
                  ? 'text-indigo-400'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span>{item.label.split(' ')[1]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
