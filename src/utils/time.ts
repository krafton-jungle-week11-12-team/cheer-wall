// 남은 시간(ms)을 "분:초"로 바꿈 (예: 1781000 → "29:41"). 음수는 00:00
export function formatRemaining(ms: number): string {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// 만료 시각이 없거나(Redis에서 사라짐) 이미 지났으면 만료
export function isExpired(expiresAt: number | null, now: number): boolean {
  return expiresAt === null || expiresAt <= now;
}
