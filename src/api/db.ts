// SQL 문자열 리터럴로 감싸고 작은따옴표를 이스케이프
export const esc = (s: string) => `'${s.replace(/'/g, "''")}'`;

// DBMS에 SQL 한 줄을 보내고, 실패하면 에러를 던짐
export async function db<T = any>(sql: string): Promise<T> {
  const res = await fetch('/db/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql }),
  });

  const result = await res.json();
  if (!result.ok) throw new Error(result.error.message);
  return result as T;
}
