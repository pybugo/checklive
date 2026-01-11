import axios from 'axios';

export async function fetchText(url, { timeoutMs = 15000 } = {}) {
  const res = await axios.get(url, {
    timeout: timeoutMs,
    maxRedirects: 5,
    validateStatus: () => true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  const text = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  const finalUrl = res.request?.res?.responseUrl || url;
  return { status: res.status, url: finalUrl, text, headers: res.headers };
}
