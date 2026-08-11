'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export function RegistrationsChart({ data }: { data: { date: string; count: number }[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="registrationsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EB3137" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#EB3137" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#E4E7EE" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 10,
            border: '1px solid #E4E7EE',
            fontSize: 12,
            boxShadow: '0 4px 24px rgba(16,19,28,0.08)',
          }}
          labelStyle={{ color: '#14161F', fontWeight: 500 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Registrations"
          stroke="#EB3137"
          strokeWidth={2}
          fill="url(#registrationsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
