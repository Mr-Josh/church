import React, { useEffect, useState } from 'react';
import { churchApi } from '../services/churchApi';

export default function DevSession() {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { churchApi.dev.session().then((r) => setData(r.data)).catch((e) => setError(e.message)); }, []);
  const user = data?.user;
  const rows = [['Nom', user?.name], ['Email', user?.email], ['Rôle', user?.role], ['ID utilisateur', user?.id], ['Session', data?.session_status], ['Mécanisme', 'Cookie de session PHP']];
  return <div className="dev-page"><div className="dev-page-heading"><div><span>SECURITY / SESSION</span><h2>Session actuelle</h2><p>Informations minimales sur la session technique actuellement authentifiée.</p></div></div>{error && <div className="dev-error">{error}</div>}<div className="dev-panel"><table><tbody>{rows.map(([label,value]) => <tr key={label}><th>{label}</th><td>{value ?? '—'}</td></tr>)}</tbody></table></div></div>;
}
