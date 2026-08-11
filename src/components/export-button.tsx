'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, Loader2 } from 'lucide-react';
import { exportToCsv, exportToExcel, type ExportRow } from '@/lib/export';

/**
 * Exports the FULL filtered result set (not just the current page) by
 * calling `fetchUrl`, which should return `{ rows: ExportRow[] }` for the
 * same search/status filters currently applied on the page.
 */
export function ExportButton({
  filenameBase,
  fetchUrl,
}: {
  filenameBase: string;
  fetchUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function handleExport(format: 'csv' | 'excel') {
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error('Export request failed');
      const { rows } = (await res.json()) as { rows: ExportRow[] };

      if (format === 'csv') exportToCsv(filenameBase, rows);
      else exportToExcel(filenameBase, rows);
    } catch {
      // Keep this non-blocking — a failed export shouldn't disrupt the page.
      // In production, surface a toast here instead.
      alert("Couldn't export right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm text-text hover:bg-black/[0.02] transition disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={14} strokeWidth={1.8} className="animate-spin" />
        ) : (
          <Download size={14} strokeWidth={1.8} />
        )}
        Export
        <ChevronDown size={14} strokeWidth={1.8} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-40 rounded-lg border border-border bg-white shadow-panel py-1 z-20">
          <button
            className="w-full text-left px-3 py-2 text-sm text-text hover:bg-black/[0.03]"
            onClick={() => handleExport('csv')}
          >
            Export as CSV
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm text-text hover:bg-black/[0.03]"
            onClick={() => handleExport('excel')}
          >
            Export as Excel
          </button>
        </div>
      )}
    </div>
  );
}
