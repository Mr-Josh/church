import { useEffect, useState } from 'react';
import { CTA, SectionTitle } from './components';
import { mediaUrl, churchApi } from '../services/churchApi';
import './event-gallery.css';

const labels={upcoming:'À VENIR',ongoing:'EN COURS',past:'ACTION RÉALISÉE'};
const formatDate=value=>value?new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'';
const asset=value=>value&&value.startsWith('/uploads/')?mediaUrl(value):value;

function coverFor(event){
  if(event.cover) return event.cover;
  const image=event.image||'';
  return {desktop:image,standard:image,mobile:image,thumbnail:image};
}

function hideBrokenImage(event){event.currentTarget.onerror=null;event.currentTarget.style.display='none';}

function EventBlock({event,priority=false}){
  const [galleryOpen,setGalleryOpen]=useState(false),[gallery,setGallery]=useState([]),[galleryLoading,setGalleryLoading]=useState(false),[galleryError,setGalleryError]=useState('');
  const cover=coverFor(event);
  const loadGallery=async()=>{
    if(galleryOpen){setGalleryOpen(false);return;}
    if(!gallery.length&&event.photo_count>0){
      setGalleryLoading(true);setGalleryError('');
      try{const payload=await churchApi.event(event.slug);const detail=payload?.data||payload;if(Array.isArray(detail?.photos))setGallery(detail.photos);else setGallery([]);}
      catch(error){setGalleryError(error.message||'Impossible de charger la galerie.');}
      finally{setGalleryLoading(false);}
    }
    setGalleryOpen(true);
  };
  return <article className="event-gallery-block">
    <picture className="event-cover">
      <source media="(max-width: 768px)" srcSet={asset(cover.mobile||cover.standard||cover.desktop)}/>
      <img src={asset(cover.standard||cover.desktop)} srcSet={`${asset(cover.mobile||cover.standard||cover.desktop)} 768w, ${asset(cover.standard||cover.desktop)} 1280w, ${asset(cover.desktop||cover.standard)} 1600w`} sizes="(max-width: 768px) 100vw, min(100vw, 1200px)" loading={priority?'eager':'lazy'} fetchPriority={priority?'high':undefined} decoding="async" alt={event.title||'Couverture de l’événement'} onError={hideBrokenImage}/>
    </picture>
    <div className="event-gallery-copy"><span className="gold-label">{labels[event.event_state]||'ACTION DE TERRAIN'}</span><h2>{event.title}</h2><p>{event.description}</p><div className="event-meta">{event.location&&<span>{event.location}</span>}<span>{formatDate(event.start_at)}</span>{event.end_at&&event.event_state==='ongoing'&&<span>Jusqu’au {formatDate(event.end_at)}</span>}</div></div>
    {event.photo_count>0&&<div className="event-gallery-toggle"><button type="button" className="btn outline" onClick={loadGallery}>{galleryOpen?'Masquer les photos':`Voir les photos (${event.photo_count})`}</button></div>}
    {galleryOpen&&<div className="event-gallery-scroll" aria-label={`Photos de ${event.title}`}>
      {galleryLoading&&<p className="event-gallery-status">Chargement de la galerie...</p>}
      {galleryError&&<p className="event-gallery-status event-gallery-error">{galleryError}</p>}
      {!galleryLoading&&!galleryError&&gallery.map(photo=>{const media=photo.media||{full:photo.image,thumbnail:photo.thumbnail||photo.image};return <figure className="event-gallery-photo" key={`${event.id}-${photo.id}`}><a className="event-gallery-photo-link" href={asset(media.full||photo.image)} target="_blank" rel="noreferrer"><img src={asset(media.thumbnail||photo.thumbnail||photo.image)} alt={photo.caption||`Photo de ${event.title}`} loading="lazy" decoding="async" onError={hideBrokenImage}/></a>{photo.caption&&<figcaption>{photo.caption}</figcaption>}</figure>})}
      {!galleryLoading&&!galleryError&&!gallery.length&&<p className="event-gallery-status">Aucune photo disponible.</p>}
    </div>}
  </article>;
}

export default function EventsPage(){
  const[events,setEvents]=useState([]),[loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;churchApi.events().then(p=>{const d=Array.isArray(p)?p:p?.data;if(active&&Array.isArray(d))setEvents(d)}).catch(()=>{}).finally(()=>active&&setLoading(false));return()=>{active=false}},[]);
  const upcoming=events.filter(e=>e.event_state==='upcoming'),ongoing=events.filter(e=>e.event_state==='ongoing'),past=events.filter(e=>e.event_state==='past');
  let priorityUsed=false;
  const renderEvents=list=>list.map(e=>{const priority=!priorityUsed&&(e.is_featured||e.event_state!=='past');if(priority)priorityUsed=true;return <EventBlock event={e} priority={priority} key={e.id}/>});
  return <><section className="section page-title-simple"><div className="container"><SectionTitle eyebrow="GOSPEL BREAK CHAIN MINISTRY" title="ÉVÉNEMENTS & ACTIONS DE TERRAIN" text="Découvrez les prochains rendez-vous, les actions actuellement menées et les témoignages en images des missions déjà réalisées."/></div></section><section className="section"><div className="container events-gallery-list">{loading&&<p className="event-empty">Chargement des événements...</p>}{!loading&&upcoming.length>0&&<section className="event-group"><SectionTitle eyebrow="PROCHAINEMENT" title="Événements à venir" text="Les prochains rendez-vous du ministère."/>{renderEvents(upcoming)}</section>}{!loading&&ongoing.length>0&&<section className="event-group"><SectionTitle eyebrow="EN CE MOMENT" title="Événement en cours" text="Les actions actuellement sur le terrain."/>{renderEvents(ongoing)}</section>}{!loading&&past.length>0&&<section className="event-group"><SectionTitle eyebrow="HISTORIQUE" title="Actions réalisées" text="Retrouvez les actions passées et leurs photos."/>{renderEvents(past)}</section>}{!loading&&!events.length&&<p className="event-empty">Aucun événement publié pour le moment.</p>}<div className="event-gallery-cta"><h2>Une action à soutenir</h2><p>La mission continue. Vous pouvez porter ces actions dans la prière ou contribuer à leur réalisation.</p><div><CTA to="/prayer">Prier pour la mission</CTA><CTA dark to="/donate">Soutenir la mission</CTA></div></div></div></section></>}
