'use client';

interface KpiCardProps {
  title: string;
  value: number;
  subtitle?: string;
  color?: 'red' | 'amber' | 'blue' | 'green' | 'slate';
}

export function KpiCard({
  title,
  value,
  subtitle,
  color = 'slate',
}: KpiCardProps) {
  const palette: Record<string, { border: string; bg: string; text: string }> =
    {
      red: {
        border: '#FCA5A5',
        bg: '#FEF2F2',
        text: '#991B1B',
      },
      amber: {
        border: '#FCD34D',
        bg: '#FFFBEB',
        text: '#92400E',
      },
      blue: {
        border: '#93C5FD',
        bg: '#EFF6FF',
        text: '#1D4ED8',
      },
      green: {
        border: '#6EE7B7',
        bg: '#ECFDF5',
        text: '#166534',
      },
      slate: {
        border: '#E5E7EB',
        bg: '#F9FAFB',
        text: '#111827',
      },
    };

  const p = palette[color];

  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${p.border}`,
        backgroundColor: p.bg,
        padding: '10px 12px',
        minWidth: 160,
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#6B7280',
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: p.text,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 11,
            marginTop: 2,
            color: '#6B7280',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
