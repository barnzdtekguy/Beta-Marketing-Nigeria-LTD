import { Field } from '@/components/field';
import { AutoDismissError } from '@/components/auto-dismiss-error';

const COPY = {
  investor: {
    heading: 'Tell us what you want to invest in',
    prompt: 'What kind of property or return are you looking for?',
    placeholder: 'e.g. I want to invest in rental properties in Abuja with strong yield potential...',
    button: 'Send my investment enquiry',
  },
  buyer: {
    heading: 'Tell us what you\u2019re looking to buy',
    prompt: 'What are you looking for?',
    placeholder: 'e.g. I am looking for a 3-bedroom apartment in Lekki, budget around \u20a680m...',
    button: 'Send my enquiry',
  },
} as const;

export function InquiryForm({
  type,
  refCode,
  referrerName,
  success,
  error,
}: {
  type: 'investor' | 'buyer';
  refCode: string;
  referrerName: string | null;
  success: boolean;
  error: string | null;
}) {
  const copy = COPY[type];

  return (
    <div className="bg-card border border-border rounded-xl shadow-panel p-6">
      <h1 className="font-display text-xl text-text">{copy.heading}</h1>
      <p className="mt-1 text-sm text-text-muted">
        {referrerName ? (
          <>
            You were referred by <span className="font-medium text-text">{referrerName}</span>. Your
            enquiry will be shared with them and our team.
          </>
        ) : (
          "Share a few details and our team will reach out shortly."
        )}
      </p>

      <form action="/api/inquiries" method="post" className="mt-6 space-y-4">
        <input type="hidden" name="ref" value={refCode} />
        <input type="hidden" name="inquiry_type" value={type} />
        <input type="hidden" name="redirect_to" value={`/${type}`} />

        <Field id="full_name" name="full_name" label="Full name" type="text" placeholder="Jane Smith" required />
        <Field id="phone" name="phone" label="Phone number" type="tel" placeholder="+234 801 234 5678" required />
        <Field id="email" name="email" label="Email" type="email" placeholder="jane@example.com" required />

        <div>
          <label htmlFor="request_details" className="block text-xs font-medium text-text-muted mb-1.5">
            {copy.prompt}
          </label>
          <textarea
            id="request_details"
            name="request_details"
            required
            rows={4}
            placeholder={copy.placeholder}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
          />
        </div>

        <AutoDismissError message={error} paramKey="inquiry_error" />
        {success && (
          <p className="rounded-lg border border-success/20 bg-success-soft px-3 py-2 text-sm text-success">
            Your enquiry has been sent successfully. We&apos;ll be in touch soon.
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-brand text-white text-sm font-medium py-2.5 hover:bg-brand-dark transition"
        >
          {copy.button}
        </button>
      </form>
    </div>
  );
}
