'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search } from 'lucide-react';

export function FiltersBar({
  searchPlaceholder,
  statusOptions,
  showSearch = true,
  secondaryFilter,
}: {
  searchPlaceholder: string;
  statusOptions: { value: string; label: string }[];
  showSearch?: boolean;
  secondaryFilter?: { paramKey: string; options: { value: string; label: string }[] };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete('page'); // any filter change resets pagination
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {showSearch && (
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParams({ search });
            }}
            onBlur={() => updateParams({ search })}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-border bg-white pl-9 pr-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
          />
        </div>
      )}

      {statusOptions.length > 0 && (
        <select
          defaultValue={searchParams.get('status') ?? 'all'}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {secondaryFilter && (
        <select
          defaultValue={searchParams.get(secondaryFilter.paramKey) ?? 'all'}
          onChange={(e) => updateParams({ [secondaryFilter.paramKey]: e.target.value })}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
        >
          {secondaryFilter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
