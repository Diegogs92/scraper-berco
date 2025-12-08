'use client';

import { useState } from 'react';
import { Link2, FileText, TrendingUp, Menu, X } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import PriceAlertsBadge from './PriceAlertsBadge';

type NavSection = 'urls' | 'resultados' | 'evolucion';

type Props = {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
};

export default function Navbar({ activeSection, onSectionChange }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'urls' as NavSection, label: 'URLs', icon: Link2 },
    { id: 'resultados' as NavSection, label: 'Resultados', icon: FileText },
    { id: 'evolucion' as NavSection, label: 'Evolución', icon: TrendingUp },
  ];

  return (
    <nav className="sticky top-0 z-40 mb-6 bg-[#111214]/90 backdrop-blur-lg border border-white/10 rounded-xl shadow-md">
      <div className="px-4 py-3 md:px-6 md:py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <Logo className="h-9 w-9 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Scraper Berco</h1>
              <p className="text-xs text-white/50 hidden sm:block mt-0.5">
                Monitoreo de precios
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-[#f97316]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-2 right-2 -bottom-1 h-6 bg-[#f97316]/20 blur-md rounded-full -z-10"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <PriceAlertsBadge onSelect={() => onSectionChange('evolucion')} />
            <div className="h-6 w-px bg-white/10"></div>
            <ThemeToggle />
            <div className="hidden md:block">
              <UserMenu />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-6 pt-6 border-t border-white/10 space-y-3 animate-slide-up">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#16DB93] to-[#598392] text-white shadow-lg shadow-[#16DB93]/25'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-3 border-t border-white/10">
              <UserMenu />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
