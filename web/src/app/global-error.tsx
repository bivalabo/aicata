'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ja">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>エラーが発生しました</h2>
          <button onClick={() => reset()}>もう一度試す</button>
        </div>
      </body>
    </html>
  )
}
