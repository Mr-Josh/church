import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { churchApi } from '../services/churchApi';
import './admin.css';

function resolveRole(payload) {
  const role = payload?.role || payload?.user?.role || payload?.data?.role || payload?.data?.user?.role;
  return String(role || 'admin').toLowerCase();
}

export default function AdminLogin(){
  const navigate=useNavigate();
  const location=useLocation();
  const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[showPassword,setShowPassword]=useState(false),[error,setError]=useState(''),[loading,setLoading]=useState(false);
  const submit=async event=>{
    event.preventDefault();setError('');setLoading(true);
    try{
      const payload=await churchApi.login({email,password});
      const role=resolveRole(payload);
      sessionStorage.setItem('church-auth-role', role);
      const destination=role==='developer'||role==='dev'?'/dev':'/admin';
      navigate(location.state?.from || destination, {replace:true});
    }catch(err){setError(err?.message||'Impossible de se connecter.')}finally{setLoading(false)}
  };
  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Link to="/" className="admin-back">← Retour au site</Link>
        <p className="eyebrow">ESPACE ADMINISTRATION</p>
        <h1>Connexion</h1>
        <p>Connectez-vous pour accéder à votre espace d’administration.</p>
        <form onSubmit={submit} className="form-stack">
          <label>
            Email
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/>
          </label>
          <label>
            Mot de passe
            <div className="password-input-wrap">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/>
              <button type="button" className="password-toggle-btn" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </label>
          {error&&<div className="form-error">{error}</div>}
          <button className="btn primary" type="submit" disabled={loading}>{loading?'Connexion...':'Se connecter'}</button>
        </form>
      </section>
    </main>
  );
}
