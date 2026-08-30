import { useEffect, useMemo, useState } from 'react';
import { CTA, SectionTitle } from './components';
import { churchApi } from '../services/churchApi';
import { eventGallery } from './eventGallery';
import './event-gallery.css';

const labels={upcoming:'À VENIR',ongoing:'EN COURS',past:'ACTION RÉALISÉE'};
function formatDate(value){if(!value)return '';return new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}
function EventBlock({event}){return <article className="event-gallery-block"><div className="event-gallery-copy"><span className="gold-label">{labels[event.event_state]||'ACTION DE TERRAIN'}</span><h2>{event.title||event.eventTitle}</h2><p>{event.description}</p><div className="event-meta"><span>{event.location||'Lieu non renseigné'}</span>{(event.start_at||event.event_date)&&<span>{formatDate(event.start_at||event.event_date)}</span>}</div></div>{Array.isArray(event.photos)&&event.photos.length>0&&<div className="event-gallery-scroll" aria-label={`Photos de ${event.title||event.eventTitle}`}>{event.photos.map((photo)=><figure className="event-gallery-photo" key={`${event.id||event.eventTitle}-${photo.id||photo.image}`}><div className="event-gallery-photo-image" role="img" aria-label={photo.caption||''} style={{backgroundImage:`url(${photo.image})`,backgroundPosition:photo.position||'center'}}/><figcaption>{photo.caption}</figcaption></figure>)}</div>}</article>}
export default function EventsPage(){
 const[events,setEvents]=useState([]),[loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;churchApi.events().then(payload=>{const data=Array.isArray(payload)?payload:payload?.data;if(active&&Array.isArray(data))setEvents(data)}).catch(()=>{}).finally(()=>active&&setLoading(false));return()=>{active=false}},[]);
 const fallback=useMemo(()=>eventGallery.map((event,i)=>({...event,event_state:'past',id:`legacy-${i}`})),[]);
 const visible=events.length?events:fallback;const upcoming=visible.filter(e=>e.event_state==='upcoming');const ongoing=visible.filter(e=>e.event_state==='ongoing');const past=visible.filter(e=>e.event_state==='past');
 return <><section className="section page-title-simple"><div className="container"><SectionTitle eyebrow="GOSPEL BREAK CHAIN MINISTRY" title="ÉVÉNEMENTS & ACTIONS DE TERRAIN" text="Découvrez les prochains rendez-vous, les actions actuellement menées et les témoignages en images des missions déjà réalisées."/></div></section><section className="section"><div className="container events-gallery-list">
 {loading?<p className="event-empty">Chargement des événements...</p>:null}
 {!loading&&upcoming.length>0&&<section className="event-group"><SectionTitle eyebrow="PROCHAINEMENT" title="Événements à venir" text="Les prochains rendez-vous du ministère."/>{upcoming.map(event=><EventBlock event={event} key={event.id}/>)}</section>}
 {!loading&&ongoing.length>0&&<section className="event-group"><SectionTitle eyebrow="EN CE MOMENT" title="Événement en cours" text="Les actions actuellement sur le terrain."/>{ongoing.map(event=><EventBlock event={event} key={event.id}/>)}</section>}
 {!loading&&past.length>0&&<section className="event-group"><SectionTitle eyebrow="HISTORIQUE" title="Actions réalisées" text="Retrouvez les actions passées et leurs photos."/>{past.map(event=><EventBlock event={event} key={event.id}/>)}</section>}
 {!loading&&!upcoming.length&&!ongoing.length&&!past.length&&<p className="event-empty">Aucun événement publié pour le moment.</p>}
 <div className="event-gallery-cta"><h2>Une action à soutenir</h2><p>La mission continue. Vous pouvez porter ces actions dans la prière ou contribuer à leur réalisation.</p><div><CTA to="/prayer">Prier pour la mission</CTA><CTA dark to="/donate">Soutenir la mission</CTA></div></div>
 </div></section></>;
}
