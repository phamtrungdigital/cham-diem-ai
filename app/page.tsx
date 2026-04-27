import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import ScoreShowcase from "@/components/landing/ScoreShowcase";
import ProductExperience from "@/components/landing/ProductExperience";
import CtaBanner from "@/components/landing/CtaBanner";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col">
        <Hero />
        <ScoreShowcase />
        <ProductExperience />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
