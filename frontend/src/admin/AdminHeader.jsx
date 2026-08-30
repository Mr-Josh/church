import React from "react";
import { Link, useLocation } from "react-router-dom";

export const pageMeta={
 "/admin":["TABLEAU DE BORD","Bonjour Pasteur","Voici ce qui se passe dans votre ministère aujourd’hui."],
 "/admin/prayer-requests":["ADMINISTRATION","Demandes de prière","Les sujets envoyés par les visiteurs."],
 "/admin/help-requests":["ADMINISTRATION","Demandes d’aide","Les personnes qui demandent un accompagnement."],
 "/admin/testimonials":["ADMINISTRATION","Témoignages","Consultez et modérez les témoignages reçus."],
 "/admin/content":["ADMINISTRATION","Contenu du site","Gérez les éléments visibles sur le site public."],
 "/admin/ministries":["ADMINISTRATION","Ministères","Gérez les ministères publiés sur le site."],
 "/admin/programs":["ADMINISTRATION","Programmes","Gérez les programmes et horaires."],
 "/admin/events":["ADMINISTRATION","Événements","Créez, planifiez, publiez et archivez les événements du ministère."],
 "/admin/settings":["ADMINISTRATION","Informations de l’église","Gérez les informations affichées sur le site."],
};
export default function AdminHeader({onMenu}){
 const{pathname}=useLocation();const[eyebrow,title,description]=pageMeta[pathname]||pageMeta["/admin"];const isDashboard=pathname==="/admin";
 return <header className={`dashboard-header admin-static-header ${isDashboard?"is-dashboard-header":"is-inner-header"}`}><div className="header-title"><button className="mobile-menu" aria-label="Ouvrir le menu" onClick={onMenu}>☰</button><div className="admin-header-copy">{isDashboard?<><h1 className="admin-header-primary">{eyebrow}</h1><p className="admin-header-secondary">{title}</p></>:<><p className="admin-header-eyebrow">{eyebrow}</p><h1 className="admin-header-primary">{title}</h1></>}<p className="admin-header-description">{description}</p></div></div><div className="header-tools"><button className="notification" aria-label="Notifications">♧</button><Link to="/admin/settings" className="pastor-profile" aria-label="Ouvrir les informations de l’église"><span className="pastor-avatar">NA</span><div><strong>Missionnaire</strong><span>Narcisse Arenthes</span></div><b>⌄</b></Link></div></header>;
}
