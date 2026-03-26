import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, BookOpen, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

import thumbUmrah from "@/assets/thumb-umrah.jpg";
import thumbHajj from "@/assets/thumb-hajj.jpg";
import thumbTawaf from "@/assets/thumb-tawaf.jpg";
import thumbIhram from "@/assets/thumb-ihram.jpg";
import thumbMadinah from "@/assets/thumb-madinah.jpg";
import thumbMakkahHotel from "@/assets/thumb-makkah-hotel.jpg";

interface GuideStep {
  bn: string;
  en: string;
}

interface TutorialGuide {
  titleBn: string;
  titleEn: string;
  thumbnail: string;
  src: string;
  descBn: string;
  descEn: string;
  steps: GuideStep[];
}

const tutorials: TutorialGuide[] = [
  {
    titleBn: "ওমরাহ কীভাবে করবেন - সম্পূর্ণ গাইড",
    titleEn: "How to Perform Umrah - Complete Guide",
    thumbnail: thumbUmrah,
    src: "/videos/umrah-guide.mp4",
    descBn: "ওমরাহ পালনের সম্পূর্ণ ধাপে ধাপে নির্দেশিকা। মীকাত থেকে শুরু করে তাওয়াফ, সাঈ এবং হলক পর্যন্ত সব কিছু শিখুন।",
    descEn: "Complete step-by-step guide to performing Umrah. Learn everything from Miqat to Tawaf, Sa'i, and Halq.",
    steps: [
      { bn: "১. নিয়ত করুন এবং ইহরাম বাঁধুন - মীকাত থেকে ইহরামের কাপড় পরিধান করুন এবং তালবিয়া পড়ুন", en: "1. Make intention and enter Ihram - Wear Ihram garments from Miqat and recite Talbiyah" },
      { bn: "২. মসজিদুল হারামে প্রবেশ করুন - ডান পা দিয়ে প্রবেশ করুন এবং দোয়া পড়ুন", en: "2. Enter Masjid al-Haram - Enter with right foot and recite the dua" },
      { bn: "৩. তাওয়াফ করুন - কাবা ঘরের চারপাশে ৭ বার প্রদক্ষিণ করুন, হাজরে আসওয়াদ থেকে শুরু করুন", en: "3. Perform Tawaf - Circle the Kaaba 7 times counter-clockwise, starting from Hajar al-Aswad" },
      { bn: "৪. মাকামে ইবরাহিমে ২ রাকাত নামাজ পড়ুন", en: "4. Pray 2 Rak'ahs at Maqam Ibrahim" },
      { bn: "৫. জমজমের পানি পান করুন", en: "5. Drink Zamzam water" },
      { bn: "৬. সাফা ও মারওয়া পাহাড়ের মধ্যে ৭ বার সাঈ করুন", en: "6. Perform Sa'i - Walk 7 times between Safa and Marwah hills" },
      { bn: "৭. চুল কাটুন (হলক/তাকসীর) - পুরুষরা মাথা মুণ্ডন বা চুল ছোট করুন, মহিলারা আঙ্গুলের এক জোড়া পরিমাণ চুল কাটুন", en: "7. Shave or trim hair (Halq/Taqsir) - Men shave head or trim, women cut a fingertip's length" },
    ],
  },
  {
    titleBn: "হজ্জ ধাপে ধাপে - পূর্ণ টিউটোরিয়াল",
    titleEn: "Hajj Step by Step - Full Tutorial",
    thumbnail: thumbHajj,
    src: "/videos/hajj-guide.mp4",
    descBn: "হজ্জের পাঁচ দিনের সম্পূর্ণ বিবরণ। ৮ জিলহজ্জ থেকে ১৩ জিলহজ্জ পর্যন্ত প্রতিটি ধাপ বিস্তারিত জানুন।",
    descEn: "Complete description of the five days of Hajj. Learn every step in detail from 8th to 13th Dhul Hijjah.",
    steps: [
      { bn: "১. ৮ জিলহজ্জ (ইয়াওমুত তারবিয়াহ) - ইহরাম বেঁধে মিনায় যান, সেখানে যোহর, আসর, মাগরিব, ইশা ও ফজর নামাজ পড়ুন", en: "1. 8th Dhul Hijjah (Yawm at-Tarwiyah) - Enter Ihram, go to Mina, pray Dhuhr through Fajr" },
      { bn: "২. ৯ জিলহজ্জ (ইয়াওমুল আরাফা) - আরাফাতের ময়দানে অবস্থান করুন, দোয়া করুন - এটি হজ্জের সবচেয়ে গুরুত্বপূর্ণ দিন", en: "2. 9th Dhul Hijjah (Day of Arafah) - Stand at Arafat, make dua - the most important day of Hajj" },
      { bn: "৩. সূর্যাস্তের পর মুজদালিফায় যান, মাগরিব ও ইশা একত্রে পড়ুন, কংকর সংগ্রহ করুন", en: "3. After sunset go to Muzdalifah, combine Maghrib & Isha, collect pebbles" },
      { bn: "৪. ১০ জিলহজ্জ (ইয়াওমুন নাহর) - বড় জামারায় ৭টি কংকর নিক্ষেপ, কোরবানি, মাথা মুণ্ডন, তাওয়াফে ইফাদাহ", en: "4. 10th Dhul Hijjah (Yawm an-Nahr) - Stone Jamrat al-Aqabah (7 pebbles), sacrifice, shave, Tawaf al-Ifadah" },
      { bn: "৫. ১১-১৩ জিলহজ্জ (আইয়ামে তাশরীক) - তিন জামারায় কংকর নিক্ষেপ, মিনায় রাত্রিযাপন", en: "5. 11th-13th Dhul Hijjah (Ayyam at-Tashriq) - Stone all three Jamarat, stay in Mina" },
      { bn: "৬. তাওয়াফে বিদা (বিদায়ী তাওয়াফ) সম্পন্ন করুন", en: "6. Perform Tawaf al-Wida (Farewell Tawaf)" },
    ],
  },
  {
    titleBn: "তাওয়াফের সময় দোয়া - আমাদের সাথে শিখুন",
    titleEn: "Duas During Tawaf - Learn With Us",
    thumbnail: thumbTawaf,
    src: "/videos/tawaf-dua.mp4",
    descBn: "তাওয়াফের প্রতিটি চক্করে কী দোয়া পড়বেন তা শিখুন। আরবি উচ্চারণ ও বাংলা অর্থসহ।",
    descEn: "Learn what duas to recite in each round of Tawaf. With Arabic pronunciation and translation.",
    steps: [
      { bn: "১. হাজরে আসওয়াদের কাছে: 'বিসমিল্লাহি আল্লাহু আকবার' বলুন", en: "1. At Hajar al-Aswad: Say 'Bismillahi Allahu Akbar'" },
      { bn: "২. রুকনে ইয়ামানি ও হাজরে আসওয়াদের মধ্যে: 'রাব্বানা আতিনা ফিদ্দুনিয়া হাসানাতাও ওয়া ফিল আখিরাতি হাসানাতাও ওয়া কিনা আজাবান্নার'", en: "2. Between Rukn al-Yamani and Hajar al-Aswad: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhab an-nar'" },
      { bn: "৩. তাওয়াফের সময় যেকোনো দোয়া ও যিকির করা যায় - কুরআন তিলাওয়াত, ইস্তিগফার, দরূদ শরীফ", en: "3. During Tawaf you can make any dua and dhikr - Quran recitation, Istighfar, Durood" },
      { bn: "৪. তাওয়াফ শেষে মাকামে ইবরাহিমে দুই রাকাত নামাজে সূরা কাফিরুন ও সূরা ইখলাস পড়ুন", en: "4. After Tawaf pray 2 Rak'ahs at Maqam Ibrahim - recite Surah Kafirun and Surah Ikhlas" },
      { bn: "৫. জমজমের পানি পান করার সময় দোয়া করুন - আল্লাহর কাছে উপকারী জ্ঞান, প্রশস্ত রিজিক ও সকল রোগ থেকে আরোগ্য চান", en: "5. Make dua when drinking Zamzam - Ask Allah for beneficial knowledge, abundant provision, and cure from all diseases" },
    ],
  },
  {
    titleBn: "ইহরামের নিয়ম ও নির্দেশিকা",
    titleEn: "Ihram Rules & Guidelines",
    thumbnail: thumbIhram,
    src: "/videos/ihram-guide.mp4",
    descBn: "ইহরামের কাপড় পরিধান, নিষিদ্ধ কাজ এবং গুরুত্বপূর্ণ নিয়মাবলী সম্পর্কে জানুন।",
    descEn: "Learn about wearing Ihram garments, prohibited acts, and important rules.",
    steps: [
      { bn: "১. গোসল করুন এবং পরিষ্কার হোন - সুগন্ধি ব্যবহার করতে পারেন ইহরাম বাঁধার আগে", en: "1. Take a bath and clean yourself - You may use fragrance before entering Ihram" },
      { bn: "২. পুরুষদের জন্য: সেলাইবিহীন দুই টুকরো সাদা কাপড় পরুন। মহিলাদের জন্য: স্বাভাবিক ঢিলেঢালা পোশাক, শুধু মুখ ও হাত খোলা রাখুন", en: "2. Men: Wear two unstitched white cloths. Women: Normal loose clothing, keep face and hands uncovered" },
      { bn: "৩. ইহরাম অবস্থায় নিষিদ্ধ: সুগন্ধি ব্যবহার, নখ কাটা, চুল কাটা, ঝগড়া করা, শিকার করা", en: "3. Prohibited in Ihram: Using fragrance, cutting nails, cutting hair, arguing, hunting" },
      { bn: "৪. তালবিয়া বারবার পড়তে থাকুন: 'লাব্বাইকা আল্লাহুম্মা লাব্বাইক...'", en: "4. Keep reciting Talbiyah: 'Labbaika Allahumma Labbaik...'" },
      { bn: "৫. মীকাত অতিক্রম করার আগে অবশ্যই ইহরাম বাঁধতে হবে", en: "5. You must enter Ihram before crossing the Miqat" },
    ],
  },
  {
    titleBn: "মদীনা জিয়ারত - সম্পূর্ণ ট্যুর",
    titleEn: "Madinah Ziyarat - Complete Tour",
    thumbnail: thumbMadinah,
    src: "/videos/madinah-tour.mp4",
    descBn: "মদীনা মুনাওয়ারার গুরুত্বপূর্ণ স্থানসমূহ পরিদর্শনের সম্পূর্ণ গাইড।",
    descEn: "Complete guide to visiting important places in Madinah Munawwarah.",
    steps: [
      { bn: "১. মসজিদে নববীতে নামাজ পড়ুন - এখানে এক রাকাত নামাজ অন্যত্র ১০০০ রাকাতের সমান", en: "1. Pray in Masjid an-Nabawi - One prayer here equals 1000 prayers elsewhere" },
      { bn: "২. রিয়াদুল জান্নাহ (জান্নাতের বাগান) - সবুজ কার্পেটের এলাকায় নামাজ পড়ার চেষ্টা করুন", en: "2. Riyadh ul-Jannah (Garden of Paradise) - Try to pray in the green carpet area" },
      { bn: "৩. রাসূলুল্লাহ (সা.) এর রওজা মোবারক জিয়ারত করুন - সালাম দিন আদবের সাথে", en: "3. Visit the blessed grave of Prophet Muhammad (PBUH) - Give Salam with respect" },
      { bn: "৪. জান্নাতুল বাকী কবরস্থান জিয়ারত করুন", en: "4. Visit Jannatul Baqi cemetery" },
      { bn: "৫. মসজিদে কুবা পরিদর্শন করুন - এখানে ২ রাকাত নামাজ এক ওমরাহর সমান সওয়াব", en: "5. Visit Masjid Quba - 2 Rak'ahs here equal the reward of one Umrah" },
      { bn: "৬. উহুদ পাহাড় ও শুহাদায়ে উহুদ জিয়ারত করুন", en: "6. Visit Mount Uhud and the martyrs of Uhud" },
    ],
  },
  {
    titleBn: "মক্কা হোটেল - কী আশা করবেন",
    titleEn: "Makkah Hotels - What to Expect",
    thumbnail: thumbMakkahHotel,
    src: "/videos/makkah-hotel.mp4",
    descBn: "মক্কার হোটেলগুলোতে কী ধরনের সুবিধা পাবেন, হারাম থেকে দূরত্ব এবং প্রস্তুতি সম্পর্কে জানুন।",
    descEn: "Learn about facilities in Makkah hotels, distance from Haram, and preparation tips.",
    steps: [
      { bn: "১. হোটেল নির্বাচনে হারাম শরীফ থেকে দূরত্ব সবচেয়ে গুরুত্বপূর্ণ - কাছের হোটেল বেশি সুবিধাজনক", en: "1. Distance from Haram is most important in hotel selection - closer hotels are more convenient" },
      { bn: "২. বেশিরভাগ হোটেলে বুফে খাবার, লন্ড্রি সার্ভিস এবং ২৪/৭ রুম সার্ভিস পাওয়া যায়", en: "2. Most hotels offer buffet meals, laundry service, and 24/7 room service" },
      { bn: "৩. জমজমের পানি সাধারণত প্রতিটি ফ্লোরে পাওয়া যায়", en: "3. Zamzam water is usually available on every floor" },
      { bn: "৪. নামাজের সময় হোটেল থেকে হারামে যাওয়ার রুট আগে থেকে জেনে রাখুন", en: "4. Know the route from hotel to Haram for prayer times in advance" },
      { bn: "৫. মূল্যবান জিনিসপত্র হোটেলের সেফে রাখুন, সাথে সবসময় হোটেল কার্ড রাখুন", en: "5. Keep valuables in hotel safe, always carry hotel card with you" },
    ],
  },
];

export default function VideoGuideSection() {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);

  return (
    <section id="videos" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-primary text-sm font-medium tracking-[0.3em] uppercase">
            {bn ? "শিখুন" : "Learn"}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 mb-4">
            {bn ? "ভিডিও টিউটোরিয়াল ও " : "Video Tutorials & "}
            <span className="text-gradient-gold">{bn ? "গাইড" : "Guides"}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {bn
              ? "আমাদের শিক্ষামূলক ভিডিও কন্টেন্ট দিয়ে আপনার যাত্রার জন্য প্রস্তুত হোন।"
              : "Prepare for your journey with our educational video content."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tutorials.map((tutorial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-gold transition-all"
            >
              {/* Thumbnail */}
              <div
                className="relative h-48 overflow-hidden bg-muted cursor-pointer"
                onClick={() => setPlayingIndex(i)}
              >
                <img
                  src={tutorial.thumbnail}
                  alt={bn ? tutorial.titleBn : tutorial.titleEn}
                  loading="lazy"
                  width={1024}
                  height={576}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-primary-foreground ml-1" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-heading text-sm font-semibold leading-snug mb-2">
                  {bn ? tutorial.titleBn : tutorial.titleEn}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {bn ? tutorial.descBn : tutorial.descEn}
                </p>

                {/* Expand Guide Button */}
                <button
                  onClick={() => setExpandedGuide(expandedGuide === i ? null : i)}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {bn ? "ধাপে ধাপে গাইড দেখুন" : "View Step-by-Step Guide"}
                  {expandedGuide === i ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                <AnimatePresence>
                  {expandedGuide === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2 border-t border-border pt-3">
                        {tutorial.steps.map((step, si) => (
                          <div key={si} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <p className="text-xs text-foreground/80 leading-relaxed">
                              {bn ? step.bn : step.en}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {playingIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setPlayingIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl rounded-xl overflow-hidden bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPlayingIndex(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="aspect-video bg-black flex items-center justify-center">
                <div className="text-center text-white/70 p-8">
                  <Play className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <h3 className="font-heading font-semibold text-lg text-white mb-2">
                    {bn ? tutorials[playingIndex].titleBn : tutorials[playingIndex].titleEn}
                  </h3>
                  <p className="text-sm text-white/60">
                    {bn ? "ভিডিও শীঘ্রই আসছে..." : "Video coming soon..."}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-card">
                <h3 className="font-heading font-semibold">
                  {bn ? tutorials[playingIndex].titleBn : tutorials[playingIndex].titleEn}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {bn ? tutorials[playingIndex].descBn : tutorials[playingIndex].descEn}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
