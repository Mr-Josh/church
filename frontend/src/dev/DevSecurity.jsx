import React, { useEffect, useState } from 'react';
import { churchApi } from '../services/churchApi';

export default function DevSecurity() {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { churchApi.dev.security().then((r) => setData(r.data)).catch((e) => setError(e.message)); }, []);
  const items = data ? [['ADMINISTRATEURS', data.roles?.admin ?? 0], ['DÉVELOPPEURS', data.roles?.developer ?? 0], ['COMPTES ACTIFS', data.active_accounts ?? 0], ['COMPTES INACTIFS', data.inactive_accounts ?? 0], ['AUDIT DISPONIBLE', data.audit_log?.available ? 'Oui' : 'Non'], ['ACCÈS DONNÉES ÉGLISE', data.church_data_write_access ? 'Oui' : 'Non']] : [];
  return <div className="dev-page"><div className="dev-page-heading"><div><span>SECURITY</span><h2>Sécurité et accès</h2><p>Vue technique des accès, rôles et protections de la console.</p></div></div>{error && <div className="dev-error">{error}</div>}<div className="dev-stat-grid">{items.map(([label,value]) => <article className="dev-stat" key={label}><small>{label}</small><strong>{String(value)}</strong></article>)}</div><div className="dev-panel"><h3>Règle de séparation</h3><p className="dev-muted">Les développeurs peuvent administrer les comptes développeur. Les données détaillées de l'église restent réservées à l'espace administrateur.</p></div></div>;
}
