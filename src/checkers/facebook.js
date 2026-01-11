import { fetchText } from './http.js';

const DIE_PATTERNS = [
  /content isn\'t available/i,
  /this content isn\'t available/i,
  /page isn\'t available/i,
  /Trang này không khả dụng/i,
  /Nội dung hiện không khả dụng/i,
  /Liên kết bạn theo dõi có thể đã bị hỏng/i,
  /Sorry, this page isn\'t available/i,
];

const UNKNOWN_PATTERNS = [
  /log in to facebook/i,
  /đăng nhập facebook/i,
  /you must log in/i,
  /checkpoint/i,
];

export async function checkFacebook({ url }) {
  const page = await fetchText(url, { timeoutMs: 15000 });

  if (page.status === 404) return { status: 'DIE', reason: 'http_404' };
  if (page.status === 429) return { status: 'UNKNOWN', reason: 'rate_limited_429' };
  if (page.status >= 500) return { status: 'UNKNOWN', reason: `http_${page.status}` };

  const text = page.text || '';
  if (DIE_PATTERNS.some(r => r.test(text))) return { status: 'DIE', reason: 'unavailable_text' };
  if (UNKNOWN_PATTERNS.some(r => r.test(text))) return { status: 'UNKNOWN', reason: 'login_wall' };
  if (/\/login\//i.test(page.url)) return { status: 'UNKNOWN', reason: 'redirect_login' };

  if (page.status >= 400) return { status: 'UNKNOWN', reason: `http_${page.status}` };
  return { status: 'OK', reason: `http_${page.status}` };
}
