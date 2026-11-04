import KalshiSimulator from "./KalshiSimulator";
import ShortsEngineCard from "./ShortsEngineCard";
import ExperiencePipeline from "./ExperiencePipeline";

export default function Projects() {
  return (
    <section id="projects" className="relative py-24 md:py-36">
      <div className="wrap">
        <p className="eyebrow">03 / Projects and experience</p>
        <h2 className="f-display mt-4 max-w-[12ch] text-[clamp(2.4rem,7vw,5rem)] font-extrabold leading-[0.92]">
          Shipped, tested, audited.
        </h2>
        <div className="mt-12 md:mt-16">
          <KalshiSimulator />
          <ShortsEngineCard />
          <ExperiencePipeline />
        </div>
      </div>
    </section>
  );
}
