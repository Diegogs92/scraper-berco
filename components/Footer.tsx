'use client';

export default function Footer() {
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
          onClick={() => {
            const target = document.getElementById('comentarios-form');
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
          }}
          className="btn bg-[#FF715B] hover:bg-[#d65d4b] text-white shadow-md shadow-[#FF715B]/30 hover:shadow-lg rounded-full px-5 py-2 text-sm font-semibold"
        >
          Dejá tu comentario
        </button>
      </div>
    </footer>
  );
}
