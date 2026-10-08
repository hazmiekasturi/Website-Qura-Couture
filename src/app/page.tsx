import { VeilIntro } from "@/components/VeilIntro";
import { SmoothScroll, Reveal } from "@/components/SmoothScroll";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Thread } from "@/components/Thread";
import { DesignedAsOne } from "@/components/DesignedAsOne";
import { Lookbook } from "@/components/Lookbook";
import { SketchToGown } from "@/components/SketchToGown";
import { Atelier } from "@/components/Atelier";
import { RealCouples } from "@/components/RealCouples";
import { Planner } from "@/components/Planner";
import { Packages } from "@/components/Packages";
import { Enquiry } from "@/components/Enquiry";
import { Footer } from "@/components/Footer";
import { MobileBar } from "@/components/MobileBar";

export default function Home() {
  return (
    <>
      <VeilIntro />
      <SmoothScroll />
      <Reveal />
      <Header />
      <main style={{ position: "relative" }}>
        <Thread />
        <Hero />
        <DesignedAsOne />
        <Lookbook />
        <SketchToGown />
        <Atelier />
        <RealCouples />
        <Planner />
        <Packages />
        <Enquiry />
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
