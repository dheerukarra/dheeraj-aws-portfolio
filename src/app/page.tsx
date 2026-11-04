import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Superpowers from "@/components/Superpowers";
import Projects from "@/components/Projects";
import CreativeFeature from "@/components/CreativeFeature";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Superpowers />
        <Projects />
        <CreativeFeature />
      </main>
      <Footer />
    </>
  );
}
