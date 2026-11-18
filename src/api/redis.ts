export async function redis<T = unknown>(command: string, ...args: string[]): Promise<T> {
  const res = await fetch('/redis/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, args }),
  });
  const body = await res.json();
  if (!body.ok) throw new Error(body.error.message);
  return body.result;
}