import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') ?? 'Zuro';
  const subtitle =
    searchParams.get('subtitle') ??
    'Production-ready backend modules for Express + TypeScript with no framework lock-in.';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f172a 0%, #111827 50%, #1f2937 100%)',
          color: '#f8fafc',
          padding: '72px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              fontWeight: 800,
            }}
          >
            Z
          </div>
          <div style={{ fontSize: '40px', fontWeight: 700 }}>Zuro</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <p style={{ margin: 0, fontSize: '58px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em' }}>{title}</p>
          <p style={{ margin: 0, fontSize: '28px', lineHeight: 1.4, color: '#cbd5e1' }}>{subtitle}</p>
        </div>

        <p style={{ margin: 0, fontSize: '24px', color: '#93c5fd' }}>zuro-cli.devbybriyan.com</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
