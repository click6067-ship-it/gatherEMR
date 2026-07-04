const KEY = 'gatheremr_sid';

/** Anonymous browser session id — no login. Stable per browser via localStorage. */
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let sid = localStorage.getItem(KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(KEY, sid);
  }
  return sid;
}
