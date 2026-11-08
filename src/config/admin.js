// Admin access, prepared for a future hidden admin dashboard.
//
// Who is an admin is set at build time with VITE_ADMIN_EMAIL_SHA256: a comma-separated list of
// SHA-256 hashes of lower-case email addresses. Only hashes are used, so this open-source repo and the
// published bundle never contain an admin's email address. See .env.example for how to make a hash.
//
// IMPORTANT: this check runs in the browser, so it can only decide whether to SHOW an admin screen.
// It is not a security boundary. Real admin data (statistics from many users) must come from a server
// that verifies a signed-in identity (for example an OAuth ID token) and checks the same hash list
// on its side. The app has no such server yet, and today every user's data stays on their own device.

const parseHashes = (raw) =>
  String(raw || '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter((h) => /^[0-9a-f]{64}$/.test(h));

export const ADMIN_EMAIL_HASHES = parseHashes(import.meta.env?.VITE_ADMIN_EMAIL_SHA256);

export const adminConfigured = () => ADMIN_EMAIL_HASHES.length > 0;

// SHA-256 of the normalised (trimmed, lower-case) email, as hex
export async function hashEmail(email) {
  const data = new TextEncoder().encode(String(email || '').trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// True when this email is on the admin list. Pass only an email that a sign-in provider has verified.
export async function isAdminEmail(email) {
  if (!email || !adminConfigured()) return false;
  return ADMIN_EMAIL_HASHES.includes(await hashEmail(email));
}
