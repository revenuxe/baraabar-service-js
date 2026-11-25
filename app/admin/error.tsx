'use client';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="admin-recovery"><section className="admin-recovery-card" role="alert"><span className="admin-recovery-label">BARAABAR ADMIN</span><h1>Your workspace could not load</h1><p>Try again, or reload the page to start a fresh connection. If the problem continues, return to sign in.</p>{error.digest && <p className="admin-recovery-reference">Error reference: {error.digest}</p>}<div className="admin-recovery-actions"><button className="admin-primary" onClick={reset}>Try again</button><button className="admin-secondary" onClick={() => window.location.reload()}>Reload page</button><a className="admin-secondary" href="/admin/login">Sign in</a></div></section></main>;
}
