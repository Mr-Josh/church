import { Route, Routes } from 'react-router-dom';
import { Footer, Header } from './components';
import { Home, About, Pastor, Ministries, Programs, Events, Sermons, Gallery } from './pages/ContentPages';
import { Testimonials, Prayer, Evangelism, Help, Contact, Donate } from './pages/InteractionPages';

export default function PublicApp() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pastor" element={<Pastor />} />
          <Route path="/ministries" element={<Ministries />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/events" element={<Events />} />
          <Route path="/sermons" element={<Sermons />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/prayer" element={<Prayer />} />
          <Route path="/evangelism" element={<Evangelism />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
