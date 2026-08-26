import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Footer, Header } from './components';
import MinistryHome from './MinistryHome';
import PrayerPage from './PrayerPage';
import { Programs, Events } from './pages/ContentPages';
import { Testimonials, Evangelism, Help, Donate } from './pages/InteractionPages';
import { useScrollReveal } from './useScrollReveal';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }, [pathname]);
  return null;
}

function MotionObserver() {
  useScrollReveal();
  return null;
}

export default function PublicApp() {
  return <div className="public-site"><ScrollToTop /><MotionObserver /><Header /><main><Routes>
    <Route path="/" element={<MinistryHome />} />
    <Route path="/programs" element={<Programs />} />
    <Route path="/events" element={<Events />} />
    <Route path="/testimonials" element={<Testimonials />} />
    <Route path="/prayer" element={<PrayerPage />} />
    <Route path="/evangelism" element={<Evangelism />} />
    <Route path="/help" element={<Help />} />
    <Route path="/donate" element={<Donate />} />
    <Route path="*" element={<MinistryHome />} />
  </Routes></main><Footer /></div>;
}
