import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import Hero from "../components/landing/Hero.jsx";
import HowItWorks from "../components/landing/HowItWorks.jsx";
import FeaturedGuides from "../components/landing/FeaturedGuides.jsx";
import PopularAttractions from "../components/landing/PopularAttractions.jsx";
import StatsSection from "../components/landing/StatsSection.jsx";
import Testimonials from "../components/landing/Testimonials.jsx";
import Gallery from "../components/landing/Gallery.jsx";
import Conservation from "../components/landing/Conservation.jsx";
import Partners from "../components/landing/Partners.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <FeaturedGuides />
      <PopularAttractions />
      <StatsSection />
      <Testimonials />
      <Gallery />
      <Conservation />
      <Partners />
      <Footer />
    </div>
  );
}
