import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Footer, Header } from './components';
import { Home, About /*, Programs, Events*/ } from './pages/ContentPages';
import { Testimonials, Prayer, Evangelism, Help, Donate } from './pages/InteractionPages';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export default function PublicApp() {
  return (
    <div className="public-site">
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          {/* <Route path="/programs" element={<Programs />} /> */}
          {/* <Route path="/events" element={<Events />} /> */}
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/prayer" element={<Prayer />} />
          <Route path="/evangelism" element={<Evangelism />} />
          <Route path="/help" element={<Help />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
