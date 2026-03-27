import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronLeft, ChevronRight, Image as ImageIcon, Video } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";

type GalleryItem = {
  type: "image" | "video";
  src: string;
};

type TabType = "all" | "images" | "videos";

const defaultItems: GalleryItem[] = [
  { type: "image", src: "/gallery/image-1.jpeg" },
  { type: "image", src: "/gallery/image-2.jpeg" },
  { type: "image", src: "/gallery/image-3.jpeg" },
  { type: "image", src: "/gallery/image-4.jpeg" },
  { type: "image", src: "/gallery/image-5.jpeg" },
  { type: "image", src: "/gallery/image-6.jpeg" },
  { type: "image", src: "/gallery/image-7.jpeg" },
  { type: "image", src: "/gallery/image-8.webp" },
];

const tabs: { key: TabType; labelBn: string; labelEn: string; icon: typeof ImageIcon }[] = [
  { key: "all", labelBn: "সব", labelEn: "All", icon: ImageIcon },
  { key: "images", labelBn: "ছবি", labelEn: "Photos", icon: ImageIcon },
  { key: "videos", labelBn: "ভিডিও", labelEn: "Videos", icon: Video },
];

export default function GallerySection() {
  const { language } = useLanguage();
  const { data: content } = useSiteContent("gallery");
  const bn = language === "bn";
  const lc = content?.[language];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const sectionLabel = lc?.section_label || (bn ? "স্মৃতি" : "Memories");
  const heading = lc?.heading || (bn ? "আমাদের " : "Our ");
  const headingHighlight = lc?.heading_highlight || (bn ? "গ্যালারি" : "Gallery");
  const description = lc?.description || (bn ? "হজ্জ ও ওমরাহ যাত্রার বিশেষ মুহূর্তগুলো আমাদের গ্যালারিতে দেখুন।" : "Explore special moments from our Hajj & Umrah journeys.");

  const items: GalleryItem[] = content?.items || defaultItems;

  const filtered = useMemo(() => {
    if (activeTab === "all") return items;
    if (activeTab === "images") return items.filter((i) => i.type === "image");
    return items.filter((i) => i.type === "video");
  }, [activeTab, items]);

  const open = useCallback((i: number) => setActiveIndex(i), []);
  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () => setActiveIndex((c) => (c !== null && c > 0 ? c - 1 : filtered.length - 1)),
    [filtered.length]
  );
  const next = useCallback(
    () => setActiveIndex((c) => (c !== null && c < filtered.length - 1 ? c + 1 : 0)),
    [filtered.length]
  );

  return (
    <section id="gallery" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 islamic-pattern opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-primary text-xs font-semibold tracking-[0.3em] uppercase">{sectionLabel}</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 mb-4">
            {heading}<span className="text-gradient-gold">{headingHighlight}</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-primary/30" />
            <div className="w-2 h-2 rounded-full bg-primary/50" />
            <div className="h-px w-12 bg-primary/30" />
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">{description}</p>
        </motion.div>

        <div className="flex justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setActiveIndex(null); }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground border-primary shadow-gold"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {bn ? tab.labelBn : tab.labelEn}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-border hover:border-primary/40 hover:shadow-luxury transition-all"
                onClick={() => open(i)}
              >
                {item.type === "image" ? (
                  <img
                    src={item.src}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={item.src}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-[hsl(220,25%,10%)]/0 group-hover:bg-[hsl(220,25%,10%)]/40 transition-colors flex items-center justify-center">
                  {item.type === "video" ? (
                    <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-gold opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                      <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[hsl(220,25%,10%)]/95 z-50 flex items-center justify-center p-4"
            onClick={close}
          >
            <button onClick={close} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <X className="h-5 w-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <ChevronRight className="h-6 w-6" />
            </button>
            <motion.div
              key={activeIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full max-h-[85vh] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {filtered[activeIndex].type === "image" ? (
                <img src={filtered[activeIndex].src} alt={`Gallery ${activeIndex + 1}`} className="w-full h-full object-contain max-h-[85vh]" />
              ) : (
                <video src={filtered[activeIndex].src} controls autoPlay playsInline className="w-full max-h-[85vh]" />
              )}
            </motion.div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
              {activeIndex + 1} / {filtered.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
