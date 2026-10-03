import Header from "./components/Header";
import Hero from "./components/Hero";
import FirstScrollStatement from "./components/FirstScrollStatement";
import FeaturedWork from "./components/FeaturedWork";
import ServicesPreview from "./components/ServicesPreview";
import Trust from "./components/Trust";
import Internships from "./components/Internships";
import Founder from "./components/Founder";
import FinalCTA from "./components/FinalCTA";
import Connect from "./components/Connect";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-base font-body text-white">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <FirstScrollStatement />
        <FeaturedWork />
        <ServicesPreview />
        <Trust />
        <Internships />
        <Founder />
        <FinalCTA />
        <Connect />
      </main>
      <Footer />
    </div>
  );
}
