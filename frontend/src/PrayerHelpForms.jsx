import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { churchApi } from './services/churchApi';

function FormField({ label, name, value, onChange, type='text', required=false, placeholder='' }) {
  return <label className="form-field"><span>{label}{required ? ' *' : ''}</span><input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required}/></label>;
}

function RequestShell({ eyebrow, title, text, children }) {
  return <><section className="page-hero"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></div><div className="hero-ornament">✦</div></section><section className="section"><div className="container"><div className="request-layout">{children}</div></div></section></>;
}

export function PrayerRequest() {
  const [form, setForm] = useState({name:'',phone:'',email:'',subject:'',message:'',is_confidential:false,is_urgent:false});
  const [state,setState]=useState({loading:false,success:'',error:''});
  const change=e=>setForm(v=>({...v,[e.target.name]:e.target.type==='checkbox'?e.target.checked:e.target.value}));
  const submit=async e=>{e.preventDefault();setState({loading:true,success:'',error:''});try{await churchApi.createPrayerRequest(form);setForm({name:'',phone:'',email:'',subject:'',message:'',is_confidential:false,is_urgent:false});setState({loading:false,success:'Votre demande de prière a bien été envoyée. Notre équipe pourra la consulter avec confidentialité.',error:''});}catch(err){setState({loading:false,success:'',error:err?.message||'Impossible d’envoyer la demande. Veuillez réessayer.'});}};
  return <RequestShell eyebrow="PRIÈRE & ACCOMPAGNEMENT" title="Demander une prière" text="Partagez votre besoin de prière. Si vous le souhaitez, votre demande peut être traitée comme confidentielle."><form className="request-form" onSubmit={submit}><div className="form-grid"><FormField label="Nom complet" name="name" value={form.name} onChange={change} required placeholder="Votre nom"/><FormField label="Téléphone" name="phone" value={form.phone} onChange={change} required placeholder="+237 ..."/><FormField label="E-mail" name="email" value={form.email} onChange={change} type="email" placeholder="vous@example.com"/><FormField label="Sujet" name="subject" value={form.subject} onChange={change} required placeholder="Sujet de votre demande"/></div><label className="form-field"><span>Votre demande de prière *</span><textarea name="message" value={form.message} onChange={change} rows="7" required placeholder="Décrivez votre besoin de prière..."></textarea></label><div className="form-checks"><label><input type="checkbox" name="is_confidential" checked={form.is_confidential} onChange={change}/> Demande confidentielle</label><label><input type="checkbox" name="is_urgent" checked={form.is_urgent} onChange={change}/> Demande urgente</label></div>{state.success&&<div className="form-success">{state.success}</div>}{state.error&&<div className="form-error">{state.error}</div>}<button className="btn" disabled={state.loading}>{state.loading?'Envoi en cours…':'Envoyer ma demande de prière →'}</button></form><aside className="request-aside"><h3>Besoin d’aide immédiate ?</h3><p>Pour un accompagnement plus direct, utilisez également notre formulaire d’assistance.</p><Link className="btn outline" to="/help">Demander de l’aide →</Link></aside></RequestShell>;
}

export function HelpRequest() {
  const [form,setForm]=useState({name:'',phone:'',message:''});
  const [state,setState]=useState({loading:false,success:'',error:''});
  const change=e=>setForm(v=>({...v,[e.target.name]:e.target.value}));
  const submit=async e=>{e.preventDefault();setState({loading:true,success:'',error:''});try{await churchApi.createHelpRequest(form);setForm({name:'',phone:'',message:''});setState({loading:false,success:'Votre demande d’aide a bien été envoyée. L’équipe pourra revenir vers vous.',error:''});}catch(err){setState({loading:false,success:'',error:err?.message||'Impossible d’envoyer la demande. Veuillez réessayer.'});}};
  return <RequestShell eyebrow="ASSISTANCE" title="Demander de l’aide" text="Expliquez-nous votre besoin et laissez-nous vos coordonnées afin que l’équipe puisse vous répondre."><form className="request-form" onSubmit={submit}><div className="form-grid"><FormField label="Nom complet" name="name" value={form.name} onChange={change} placeholder="Votre nom"/><FormField label="Téléphone" name="phone" value={form.phone} onChange={change} required placeholder="+237 ..."/></div><label className="form-field"><span>Comment pouvons-nous vous aider ? *</span><textarea name="message" value={form.message} onChange={change} rows="8" required placeholder="Décrivez votre besoin..."></textarea></label>{state.success&&<div className="form-success">{state.success}</div>}{state.error&&<div className="form-error">{state.error}</div>}<button className="btn" disabled={state.loading}>{state.loading?'Envoi en cours…':'Envoyer ma demande d’aide →'}</button></form><aside className="request-aside"><h3>Vous préférez WhatsApp ?</h3><p>Vous pouvez également contacter directement le ministère.</p><a className="btn outline" href="https://wa.me/237600000000">Contacter sur WhatsApp →</a><p><Link to="/prayer">Vous souhaitez plutôt demander une prière ?</Link></p></aside></RequestShell>;
}
