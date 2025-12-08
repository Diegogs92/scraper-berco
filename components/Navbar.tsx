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
    <nav className="card sticky top-0 z-40 mb-6">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-bold text-white">Scraper Berco</h1>
              <p className="text-xs text-white/60 hidden sm:block">
                Monitoreo de precios
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#16DB93] to-[#598392] text-white shadow-lg shadow-[#16DB93]/20'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <PriceAlertsBadge onSelect={() => onSectionChange('evolucion')} />
            <ThemeToggle />
            <div className="hidden md:block">
              <UserMenu />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
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
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-2">
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#16DB93] to-[#598392] text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-white/10">
              <UserMenu />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
