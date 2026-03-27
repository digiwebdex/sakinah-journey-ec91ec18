import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, MapPin, Shield, Plane, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import heroKaaba from "@/assets/hero-kaaba-golden.jpg";
import heroMedina from "@/assets/hero-medina.jpg";
import heroHotel from "@/assets/hero-hotel.jpg";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useLanguage } from "@/i18n/LanguageContext";

const heroSlides = [
  { image: heroKaaba, alt: "Holy Kaaba at Masjid al-Haram during golden sunset" },
  { image: heroMedina, alt: "Prophet's Mosque Masjid an-Nabawi in Medina" },
  { image: heroHotel, alt: "Premium hotel near Haram with luxury amenities" },
];

const HeroSection = () => {
  const { data: content } = useSiteContent("hero");
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const lc = content?.[language];
  const badge = lc?.badge || t("hero.badge");
  const ctaPrimary = lc?.cta_primary || t("hero.ctaPrimary");
  const ctaSecondary = lc?.cta_secondary || t("hero.ctaSecondary");
  const stats = lc?.stats || [
    { value: "15+", label: t("hero.stat.years") },
    { value: "10K+", label: t("hero.stat.pilgrims") },
    { value: "50+", label: t("hero.stat.packages") },
    { value: "4.9★", label: t("hero.stat.rating") },
  ];

  const defaultIcons = [Shield, Star, Plane, MapPin];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goTo = useCallback((dir: number) => {
    setCurrentSlide((prev) => (prev + dir + heroSlides.length) % heroSlides.length);
  }, []);

  return (
    <section id="home" className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden">
      {/* Background Images with Ken Burns effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={heroSlides[currentSlide].image}
            alt={heroSlides[currentSlide].alt}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,10%)]/70 via-[hsl(220,25%,10%)]/40 to-[hsl(220,25%,10%)]/80" />

      {/* Decorative Islamic geometric corner patterns */}
      <div className="absolute top-0 left-0 w-40 h-40 opacity-10">
        <svg viewBox="0 0 200 200" className="w-full h-full text-primary">
          <path d="M0 0 L200 0 L100 100 Z" fill="currentColor" opacity="0.3" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-40 h-40 opacity-10 rotate-90">
        <svg viewBox="0 0 200 200" className="w-full h-full text-primary">
          <path d="M0 0 L200 0 L100 100 Z" fill="currentColor" opacity="0.3" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Slide Navigation */}
      <button onClick={() => goTo(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center text-white hover:bg-primary/40 transition-all">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={() => goTo(1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center text-white hover:bg-primary/40 transition-all">
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? "bg-primary w-10" : "bg-white/40 w-4 hover:bg-white/60"}`}
          />
        ))}
      </div>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-gold z-10" />

      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-primary/15 backdrop-blur-xl border border-primary/30 rounded-full px-6 py-2.5 mb-10"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary text-xs font-semibold tracking-[0.25em] uppercase">{badge}</span>
        </motion.div>

        {/* Quranic Verse */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-3xl mx-auto mb-14"
        >
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-20 sm:w-28 bg-gradient-to-r from-transparent to-primary/40" />
            <div className="w-8 h-8 rounded-full border border-primary/40 flex items-center justify-center">
              <Star className="h-3 w-3 text-primary fill-primary/40" />
            </div>
            <div className="h-px w-20 sm:w-28 bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-relaxed mb-6"
            dir="rtl"
            style={{ fontFamily: "var(--font-arabic)" }}
          >
            وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl sm:text-2xl md:text-3xl font-semibold italic text-gradient-gold leading-relaxed"
          >
            "আর তোমরা আল্লাহর সন্তুষ্টির জন্য হজ্জ ও ওমরাহ পূর্ণ কর"
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-sm text-white/50 mt-4 tracking-widest"
          >
            — সূরা আল-বাকারা: ১৯৬
          </motion.p>

          {/* Decorative divider bottom */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-20 sm:w-28 bg-gradient-to-r from-transparent to-primary/40" />
            <div className="w-8 h-8 rounded-full border border-primary/40 flex items-center justify-center">
              <Star className="h-3 w-3 text-primary fill-primary/40" />
            </div>
            <div className="h-px w-20 sm:w-28 bg-gradient-to-l from-transparent to-primary/40" />
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="flex flex-wrap gap-4 justify-center mb-16 sm:mb-20"
        >
          <a
            href="#packages"
            className="group bg-gradient-gold text-primary-foreground font-semibold px-10 py-4 rounded-xl text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300 inline-flex items-center gap-2"
          >
            {ctaPrimary}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#contact"
            className="border border-primary/40 text-white font-semibold px-10 py-4 rounded-xl text-sm hover:bg-primary/10 hover:border-primary/60 backdrop-blur-sm transition-all duration-300 inline-flex items-center"
          >
            {ctaSecondary}
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
        >
          <div className="bg-[hsl(220,25%,10%)]/60 backdrop-blur-2xl border border-primary/15 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat: any, i: number) => {
              const IconComp = defaultIcons[i % defaultIcons.length];
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
                  className={`flex items-center gap-3 ${i < stats.length - 1 ? "md:border-r md:border-primary/10" : ""} md:pr-4`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <IconComp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-heading font-bold text-white leading-none">{stat.value}</p>
                    <p className="text-[11px] text-white/50 mt-1">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
