import React, { useEffect, useState } from 'react';
import { churchApi } from '../services/churchApi';

export default function DevDiagnostics() {
  const [checks, setChecks] = useState([]);
  const [error, setError] = useState('');
  const load = () => churchApi.dev.diagnostics().then((r) => setChecks(r.data?.checks || [])).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  return <div className="dev-page">
    <div className="dev-page-heading"><div><span>OPERATIONS / DIAGNOSTICS</span><h2>Diagnostic</h2><p>Vérification rapide des composants critiques de l'application.</p></div><button className="dev-outline-button" onClick={load}>Relancer</button></div>
    {error && <div className="dev-error">{error}</div>}
    <div className="dev-panel"><div className="dev-table-wrap"><table><thead><tr><th>Contrôle</th><th>État</th><th>Détail</th></tr></thead><tbody>{checks.map((c) => <tr key={c.name}><td>{c.name}</td><td><span className={`dev-badge dev-badge-${c.status}`}>{c.status === 'ok' ? 'OK' : 'Attention'}</span></td><td>{c.detail}</td></tr>)}</tbody></table></div></div>
  </div>;
}
