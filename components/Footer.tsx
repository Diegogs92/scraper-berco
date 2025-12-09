'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Footer() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [resultText, setResultText] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) =>
  {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus('sending');
    setResultText('Enviando...');

    const formData = new FormData();
    formData.append('access_key', '24fd8500-82cb-430e-9baf-e822e4608c65');
    formData.append('name', user?.nombre || 'Usuario Total Scrap');
    formData.append('email', user?.email || 'sin-email@totalscrap.local');
    formData.append('message', message);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setStatus('success');
        setResultText('Comentario enviado. Gracias!');
        setMessage('');
        setTimeout(() => {
          setIsModalOpen(false);
          setStatus('idle');
          setResultText('');
        }, 1200);
      } else {
        setStatus('error');
        setResultText('Error al enviar. Intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error enviando comentario', err);
      setStatus('error');
      setResultText('Error de conexion.');
    }
  };

  return (
    <footer
      id="comentarios"
      className="mt-10 border-t border-white/10 bg-[var(--nav-bg)]/80 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="text-sm text-white/70 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-white">Total Scrap</span>
          <span className="text-white/40">|</span>
          <span>Desarrollado por DGS Solutions</span>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn bg-[#FF715B] hover:bg-[#d65d4b] text-white shadow-md shadow-[#FF715B]/30 hover:shadow-lg rounded-full px-5 py-2 text-sm font-semibold"
        >
          Deja tu comentario
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="card relative w-full max-w-md bg-[var(--card)] p-6 border border-white/15 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-3 top-3 text-white/70 hover:text-white"
              aria-label="Cerrar"
            >
              ×
            </button>
            <h3 className="text-xl font-semibold text-white mb-2">Dejanos tu comentario</h3>
            <p className="text-sm text-white/70 mb-4">
              Contanos tu opinion o sugerencia. Te responderemos a la brevedad.
            </p>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="block text-sm text-white/80">
                Comentario
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 outline-none"
                  rows={4}
                  placeholder="Escribe tu mensaje aqui..."
                  required
                />
              </label>
              {resultText && (
                <p className={`text-sm ${status === 'error' ? 'text-[#FF715B]' : 'text-white/70'}`}>
                  {resultText}
                </p>
              )}
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setMessage('');
                    setStatus('idle');
                    setResultText('');
                  }}
                  className="btn bg-white/10 text-white hover:bg-white/20"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!message.trim() || status === 'sending'}
                  className="btn bg-[#1EA896] hover:bg-[#147a6a] text-white shadow-md shadow-[#1EA896]/25 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
