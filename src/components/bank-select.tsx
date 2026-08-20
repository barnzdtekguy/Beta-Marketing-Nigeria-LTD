'use client';

import { useState } from 'react';
import { NIGERIAN_BANKS } from '@/lib/nigerian-banks';

export function BankSelect({ defaultValue = '' }: { defaultValue?: string }) {
  const [showOther, setShowOther] = useState(defaultValue !== '' && !(NIGERIAN_BANKS as readonly string[]).includes(defaultValue));

  return (
    <div className="space-y-2">
      <select
        name={showOther ? 'bank_name_select' : 'bank_name'}
        defaultValue={showOther ? 'Other' : defaultValue}
        required={!showOther}
        onChange={(e) => setShowOther(e.target.value === 'Other')}
        className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
      >
        <option value="" disabled>
          Select your bank…
        </option>
        {NIGERIAN_BANKS.map((bank) => (
          <option key={bank} value={bank}>
            {bank}
          </option>
        ))}
      </select>

      {showOther && (
        <input
          name="bank_name"
          type="text"
          required
          defaultValue={defaultValue !== 'Other' ? defaultValue : ''}
          placeholder="Enter your bank's name"
          className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
        />
      )}
    </div>
  );
}
