import { FormEvent, useEffect, useState } from 'react';
import { Edit3, Loader2, Plus, Trash, Upload, FileDown } from 'lucide-react';
import { UrlItem } from '@/types';

type Props = {
  onChange?: () => void;
};

export default function URLManager({ onChange }: Props) {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [csvText, setCsvText] = useState('');
  const [message, setMessage] = useState('');

  const loadUrls = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/urls?limit=200');
      const data = await res.json();
      setUrls(data.urls || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error cargando URLs';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUrls();
  }, []);

  const addUrl = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl }),
      });
      const data = await res.json();
      if (data.error) setMessage(data.error);
      setNewUrl('');
      await loadUrls();
      onChange?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo agregar';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const importCsv = async () => {
    if (!csvText.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvText }),
      });
      const data = await res.json();
      setMessage(`Importadas: ${data.inserted || 0} de ${data.totalReceived || 0}`);
      setCsvText('');
      await loadUrls();
      onChange?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al importar CSV';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteUrl = async (id: string) => {
    if (!confirm('Eliminar URL?')) return;
    setLoading(true);
    try {
      await fetch(`/api/urls/${id}`, { method: 'DELETE' });
      await loadUrls();
      onChange?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const editUrl = async (id: string, current: string) => {
    const updated = prompt('Editar URL', current);
    if (!updated || updated === current) return;
    setLoading(true);
    try {
      await fetch(`/api/urls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: updated }),
      });
      await loadUrls();
      onChange?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo editar';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card flex h-full flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">URLs</p>
          <h3 className="text-lg font-semibold text-white">Gestiona las URLs a scrapear</h3>
        </div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/urls?format=csv"
          className="btn bg-white/10 text-white hover:bg-white/20"
          title="Exportar CSV"
        >
          <FileDown className="h-4 w-4" />
          Exportar
        </a>
      </div>

      <form onSubmit={addUrl} className="flex flex-col gap-3">
        <label className="text-sm text-white/70">Agregar URL individual</label>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            placeholder="https://tienda.com/producto"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <button
            type="submit"
            className="btn bg-emerald-500 text-white hover:bg-emerald-400 md:w-40"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Agregar
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-white/70">Importar CSV / pegar lista</label>
        <textarea
          className="min-h-[120px] w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
          placeholder="Pega una columna de URLs o un CSV con la primera columna = URL"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={importCsv}
            className="btn bg-white/10 text-white hover:bg-white/20"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Importar CSV
          </button>
          {message && <span className="text-sm text-amber-300">{message}</span>}
        </div>
      </div>

      <div className="mt-2 flex-1 overflow-auto rounded-lg border border-white/5">
        <table className="min-w-full text-sm text-white/80">
          <thead className="bg-white/5 text-left text-xs uppercase text-white/60">
            <tr>
              <th className="px-3 py-2">URL</th>
              <th className="px-3 py-2">Proveedor</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {urls.slice(0, 50).map((u) => (
              <tr key={u.id} className="border-t border-white/5">
                <td className="px-3 py-2 align-top">
                  <div className="line-clamp-2 break-all text-white">{u.url}</div>
                  {u.ultimoError && (
                    <p className="text-xs text-amber-300">Error: {u.ultimoError}</p>
                  )}
                </td>
                <td className="px-3 py-2 align-top">{u.proveedor}</td>
                <td className="px-3 py-2 align-top">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      u.status === 'done'
                        ? 'bg-emerald-500/30 text-emerald-100'
                        : u.status === 'error'
                        ? 'bg-rose-500/30 text-rose-100'
                        : u.status === 'processing'
                        ? 'bg-sky-500/30 text-sky-100'
                        : 'bg-amber-500/30 text-amber-50'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded-lg bg-white/5 p-2 text-white hover:bg-white/10"
                      onClick={() => editUrl(u.id, u.url)}
                      title="Editar URL"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg bg-rose-500/30 p-2 text-white hover:bg-rose-500/50"
                      onClick={() => deleteUrl(u.id)}
                      title="Eliminar"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {urls.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-white/60" colSpan={4}>
                  Aun no hay URLs cargadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
