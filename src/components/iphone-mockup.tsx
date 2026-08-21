import { Copy, Users2, Wallet } from 'lucide-react';

/**
 * A tilted, 3D-styled iPhone 16 frame (pure CSS/Tailwind — no external
 * image assets) showing a miniature replica of the realtor dashboard:
 * stat cards, the referral code + link card, and a couple of referred
 * contacts. Used on the landing page to make "share your referral link"
 * tangible before someone creates an account.
 */
export function IPhoneDashboardMockup({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ perspective: '2200px' }}>
      <div
        className="absolute inset-0 -z-10 blur-3xl"
        style={{
          background: 'radial-gradient(60% 60% at 50% 40%, rgba(235,49,55,0.28) 0%, rgba(235,49,55,0) 70%)',
        }}
      />

      <div
        className="animate-float relative mx-auto w-[260px] sm:w-[290px]"
        style={{ transform: 'rotateY(-16deg) rotateX(6deg) rotateZ(1deg)', transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute -bottom-6 left-1/2 h-10 w-[210px] -translate-x-1/2 rounded-full blur-2xl"
          style={{ background: 'rgba(18,14,13,0.35)' }}
        />

        <div
          className="relative rounded-[3.1rem] p-[3px]"
          style={{
            background: 'linear-gradient(155deg, #4b4744 0%, #221f1e 35%, #100e0d 65%, #3a3634 100%)',
            boxShadow: '0 40px 80px -20px rgba(18,14,13,0.55), 0 15px 30px -10px rgba(18,14,13,0.4)',
          }}
        >
          <div className="absolute -left-[3px] top-[108px] h-6 w-[3px] rounded-l bg-[#2a2725]" />
          <div className="absolute -left-[3px] top-[146px] h-11 w-[3px] rounded-l bg-[#2a2725]" />
          <div className="absolute -left-[3px] top-[200px] h-11 w-[3px] rounded-l bg-[#2a2725]" />
          <div className="absolute -right-[3px] top-[158px] h-16 w-[3px] rounded-r bg-[#2a2725]" />

          <div className="relative overflow-hidden rounded-[2.85rem] bg-black p-1.5">
            <div className="relative overflow-hidden rounded-[2.4rem] bg-paper" style={{ aspectRatio: '9 / 19.5' }}>
              <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-text">
                <span>9:41</span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-text" />
                  <span className="h-1.5 w-3 rounded-full bg-text" />
                </span>
              </div>

              <div className="absolute left-1/2 top-2.5 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black" />

              <div className="px-4 pt-5">
                <p className="font-display text-[13px] text-text">Welcome back, Ada</p>
                <p className="mt-0.5 text-[10px] text-text-muted">Here&apos;s how your referrals are doing.</p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-border bg-card p-2.5 shadow-card">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-soft text-brand-dark">
                      <Users2 size={12} strokeWidth={2} />
                    </div>
                    <p className="mt-2 font-display text-base text-text">12</p>
                    <p className="text-[9px] text-text-muted">Referred</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-2.5 shadow-card">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-soft text-amber">
                      <Wallet size={12} strokeWidth={2} />
                    </div>
                    <p className="mt-2 font-display text-base text-text">₦480k</p>
                    <p className="text-[9px] text-text-muted">Earned</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-border bg-card p-3 shadow-card">
                  <p className="text-[9px] text-text-muted">Your referral code</p>
                  <p className="mt-1 rounded-md bg-black/[0.03] px-2 py-1.5 font-mono text-[10px] text-text">
                    ADA-7F21
                  </p>

                  <p className="mt-2.5 text-[9px] text-text-muted">Your referral link</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="min-w-0 flex-1 truncate rounded-md border border-border bg-white px-2 py-1.5 text-[9px] text-text-muted">
                      betamarketing.com/?ref=ADA-7F21
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-md bg-ink px-2 py-1.5 text-white">
                      <Copy size={9} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5">
                  {['Wale A.', 'Chidinma O.'].map((name) => (
                    <div
                      key={name}
                      className="flex items-center justify-between rounded-lg border border-border bg-card px-2.5 py-2"
                    >
                      <span className="text-[9px] font-medium text-text">{name}</span>
                      <span className="rounded-full bg-success-soft px-1.5 py-0.5 text-[8px] font-medium text-success">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 30%)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
