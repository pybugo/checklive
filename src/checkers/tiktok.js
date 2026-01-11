import { fetchText } from './http.js';

/**
 * TikTok check SỐNG/DIE giống Facebook: chỉ cần truy cập được profile public.
 * - 404 => DIE
 * - 200 nhưng có text "Couldn't find this account" / "Không tìm thấy..." => DIE
 * - Redirect/login wall/anti-bot => UNKNOWN
 * - còn lại => OK
 */
const DIE_PATTERNS = [
  /couldn\'t find this account/i,
  /couldn't find this account/i,
  /user not found/i,
  /Không tìm thấy/i,
  /account not found/i,
];

const UNKNOWN_PATTERNS = [
  /verify to continue/i,
  /captcha/i,
  /access denied/i,
  /forbidden/i,
];

export async function checkTikTok({ url }) {
  const page = await fetchText(url, { timeoutMs: 15000 });

  if (page.status === 404) return { status: 'DIE', reason: 'http_404' };
  if (page.status === 429) return { status: 'UNKNOWN', reason: 'rate_limited_429' };
  if (page.status >= 500) return { status: 'UNKNOWN', reason: `http_${page.status}` };

  const text = page.text || '';
  if (DIE_PATTERNS.some(r => r.test(text))) return { status: 'DIE', reason: 'not_found_text' };

  // if tiktok redirects to something weird, mark unknown
  if (UNKNOWN_PATTERNS.some(r => r.test(text))) return { status: 'UNKNOWN', reason: 'anti_bot' };
  if (/\/login/i.test(page.url)) return { status: 'UNKNOWN', reason: 'redirect_login' };

  if (page.status >= 400) return { status: 'UNKNOWN', reason: `http_${page.status}` };
  return { status: 'OK', reason: `http_${page.status}` };
}
