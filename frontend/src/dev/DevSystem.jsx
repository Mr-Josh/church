import React, { useEffect, useState } from 'react';
import { churchApi } from '../services/churchApi';

export default function DevSystem() {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { churchApi.dev.summary().then((r) => setData(r.data)).catch((e) => setError(e.message)); }, []);
  const system = data?.system; const db = data?.database; const app = data?.application;
  const rows = [['Application', app?.name], ['Environnement', app?.environment], ['PHP', system?.php], ['Serveur', system?.server], ['Base', db?.engine], ['Version DB', db?.version], ['Connexion DB', db?.connected ? 'Operational' : 'Unavailable']];
  return <div className="dev-page"><div className="dev-page-heading"><div><span>APPLICATION / SYSTEM</span><h2>Système</h2><p>Informations techniques de l'environnement d'exécution.</p></div></div>{error && <div className="dev-error">{error}</div>}<div className="dev-panel"><table><tbody>{rows.map(([label,value]) => <tr key={label}><th>{label}</th><td>{value || '—'}</td></tr>)}</tbody></table></div></div>;
}
