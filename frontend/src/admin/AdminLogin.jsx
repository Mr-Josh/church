import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { churchApi } from '../services/churchApi';

export default function AdminLogin() {
  const navigate = useNavigate(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  const submit=async event=>{event.preventDefault();setError('');setLoading(true);try{await churchApi.login({email,password});navigate('/admin');}catch(err){setError(err?.message||'Impossible de se connecter.');}finally{setLoading(false);}};
  return <main className="admin-login-page"><section className="admin-login-card"><Link to="/" className="admin-back">← Retour au site</Link><p className="eyebrow">ESPACE PASTEUR</p><h1>Administration</h1><p>Connectez-vous pour gérer le contenu de Gospel Break Chain Ministry.</p><form onSubmit={submit} className="form-stack"><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/></label><label>Mot de passe<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>{error&&<div className="form-error">{error}</div>}<button className="btn primary" type="submit" disabled={loading}>{loading?'Connexion...':'Se connecter'}</button></form></section></main>;
}
