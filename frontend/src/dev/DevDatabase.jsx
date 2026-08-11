import React, { useEffect, useState } from 'react';
import { churchApi } from '../services/churchApi';

export default function DevDatabase() {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { churchApi.dev.database().then((r) => setData(r.data)).catch((e) => setError(e.message)); }, []);
  return <div className="dev-page">
    <div className="dev-page-heading"><div><span>APPLICATION / DATABASE</span><h2>Base de données</h2><p>État structurel de la base partagée, sans accès aux données pastorales.</p></div></div>
    {error && <div className="dev-error">{error}</div>}
    <div className="dev-panel"><div className="dev-table-head"><strong>{data?.database || 'MySQL'}</strong><span>{data?.tables?.length ?? '—'} tables détectées</span></div>
      <div className="dev-table-wrap"><table><thead><tr><th>Table</th><th>Lignes</th><th>Moteur</th><th>Collation</th></tr></thead><tbody>{(data?.tables || []).map((t) => <tr key={t.name}><td><code>{t.name}</code></td><td>{t.rows}</td><td>{t.engine}</td><td>{t.collation}</td></tr>)}</tbody></table></div>
    </div>
  </div>;
}
