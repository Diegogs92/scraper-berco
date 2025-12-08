'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, Link as LinkIcon, Play, Eye } from 'lucide-react';

type Props = {
  forceShow?: boolean;
  onClose?: () => void;
};

export default function OnboardingGuide({ forceShow, onClose }: Props = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Mostrar guía si es la primera vez o si se fuerza
    if (forceShow) {
      setIsVisible(true);
    } else {
      const hasSeenGuide = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenGuide) {
        setIsVisible(true);
      }
    }
  }, [forceShow]);

  const steps = [
    {
      icon: LinkIcon,
      title: '1. Agrega URLs',
      description: 'Pega las URLs de los productos que quieres monitorear',
      color: 'emerald',
    },
    {
      icon: Play,
      title: '2. Ejecuta el Scraper',
      description: 'Haz clic en "Ejecutar Scraping" para obtener los datos',
      color: 'sky',
    },
    {
      icon: Eye,
      title: '3. Revisa Resultados',
      description: 'Ve los precios y compara entre proveedores',
      color: 'purple',
    },
  ];

  const handleClose = () => {
    if (!forceShow) {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card w-full max-w-2xl p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#16DB93] to-[#598392] mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido al Scraper!</h2>
          <p className="text-white/70">Es muy simple usar el sistema. Solo 3 pasos:</p>
        </div>

        <div className="space-y-4 mb-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            return (
              <div
                key={idx}
                className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-white/10 scale-105' : 'bg-white/5'
                }`}
                onMouseEnter={() => setCurrentStep(idx)}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 flex items-center justify-center`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-white/70">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#16DB93] to-[#598392] text-white font-semibold rounded-xl hover:from-[#16DB93] hover:to-sky-700 transition-all duration-200 shadow-lg shadow-[#16DB93]/20"
          >
            ¡Entendido, empecemos!
          </button>
        </div>

        <p className="text-center text-xs text-white/50 mt-4">
          Puedes ver esta guía nuevamente desde el menú de ayuda
        </p>
      </div>
    </div>
  );
}
