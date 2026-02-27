import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, XCircle, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const steps = [
  {
    num: "০১",
    titleBn: "ইহরাম (ফরজ)",
    titleEn: "Ihram (Fard)",
    descBn: "ওমরাহ পালন করার জন্য ইহরাম অপরিহার্য। ইহরামের পোশাক পরার জন্য কিছু ধাপ অনুসরণ করতে হয়:",
    descEn: "Ihram is essential for performing Umrah. Follow these steps to wear the Ihram garment:",
    itemsBn: [
      "পরিষ্কার-পরিচ্ছন্ন হয়ে গোসল বা অজু করা",
      "মিকাতের আগে বা মিকাতে ইহরামের কাপড় পরে নেওয়া",
      "ইহরামের নিয়তে দুই রাকাত নামাজ আদায় করা",
      "ওমরাহর নিয়ত করার পর এক বা তিনবার তালবিয়া পড়া",
    ],
    itemsEn: [
      "Take a bath or perform wudu",
      "Wear Ihram clothes before or at the Miqat",
      "Pray two rakat of Ihram prayer",
      "Recite Talbiyah once or three times after making the intention",
    ],
    duaBn: "লাব্বাইকা আলাহুম্মা লাব্বাইক, লাব্বাইকা লা শারিকা লাকা লাব্বাইক, ইন্নাল হামদা ওয়ান নি'মাতা লাকা ওয়াল মুলক, লা শারিকা লাকা।",
    duaEn: "Labbaik Allahumma Labbaik, Labbaika La Sharika Laka Labbaik, Innal Hamda Wan Ni'mata Laka Wal Mulk, La Sharika Lak.",
  },
  {
    num: "০২",
    titleBn: "তাওয়াফ (ফরজ)",
    titleEn: "Tawaf (Fard)",
    descBn: "ওমরাহ পালনের জন্য তাওয়াফ করা আবশ্যক। তাওয়াফ করার প্রস্তুতি:",
    descEn: "Tawaf is mandatory for Umrah. Preparation for Tawaf:",
    itemsBn: [
      "তাওয়াফের নিয়ত করা",
      "অজু করা",
      "ইহরামের চাদর সঠিকভাবে ডান কাঁধে পেঁচিয়ে নিয়ে বাম কাঁধের ওপর রাখা",
      "হাজরে আসওয়াদকে সামনে রেখে তার ডান পাশ বরাবর দাঁড়ানো",
    ],
    itemsEn: [
      "Make intention for Tawaf",
      "Perform wudu",
      "Wrap the Ihram cloth correctly over right shoulder",
      "Stand facing Hajr-e-Aswad on its right side",
    ],
    footerBn: "ভিড় না থাকলে হাজরে আসওয়াদ চুম্বন করে তাওয়াফ শুরু করা। 'বিসমিল্লাহি আল্লাহু আকবার' বলা। এভাবে সাত চক্করে তাওয়াফ শেষ করা।",
    footerEn: "If not crowded, kiss Hajr-e-Aswad to start Tawaf. Say 'Bismillahi Allahu Akbar'. Complete seven circuits.",
  },
  {
    num: "০৩",
    titleBn: "সায়ি (ওয়াজিব)",
    titleEn: "Sa'i (Wajib)",
    descBn: "সায়ি করার পদ্ধতি:",
    descEn: "Steps for Sa'i:",
    itemsBn: [
      "সাফা পাহাড়ের কাছে গিয়ে কাবা শরিফের দিকে মুখ করে দাঁড়ানো",
      "দোয়ার মতো হাত তুলে তিনবার তাকবির বলা",
      "মারওয়া পাহাড়ের কাছে পৌঁছালে তাকবির বলা",
      "দুই পাহাড়ের মাঝে সাতবার দৌঁড়ানো",
    ],
    itemsEn: [
      "Go to Mount Safa and face the Kaaba",
      "Raise hands in dua and say Takbir three times",
      "Walk/run to Mount Marwah and say Takbir",
      "Complete seven rounds between the two hills",
    ],
  },
  {
    num: "০৪",
    titleBn: "চুল মুন্ডন করা (ওয়াজিব)",
    titleEn: "Shaving/Trimming Hair (Wajib)",
    descBn: "পুরুষের ক্ষেত্রে সম্পূর্ণ মাথা মুণ্ডন করা উত্তম। তবে কেউ চাইলে চুল ছাঁটতেও পারে। মহিলাদের ক্ষেত্রে চুল এক ইঞ্চি পরিমাণ কেটে ফেলা।",
    descEn: "For men, shaving the head completely is preferred, though trimming is also acceptable. For women, trim about one inch of hair.",
    itemsBn: [],
    itemsEn: [],
  },
];

const dosBn = [
  "নফল তাওয়াফ বেশি করা",
  "অধিক পরিমাণ জমজমের পানি পান করা",
  "হাতিমে সালাত আদায় করা",
  "মাকামে ইবরাহিমে সালাত আদায় করা",
  "হাজরে আসওয়াদ চুমু খাওয়া",
  "কাবা ঘর ধরে দোয়া করা",
  "মুলতাযাম ধরে দোয়া করা",
];

const dosEn = [
  "Perform extra Nafl Tawaf",
  "Drink Zamzam water abundantly",
  "Pray at Hateem",
  "Pray at Maqam-e-Ibrahim",
  "Kiss the Hajr-e-Aswad",
  "Make dua holding the Kaaba",
  "Make dua at Multazam",
];

const dontsBn = [
  "সহবাস করা",
  "দাঁড়ি বা গোফ কাটা ও মুন্ডন করা",
  "চুল বা নখ কাটা",
  "লোম তোলা",
  "সুগন্ধি বা পারফিউম ব্যবহার করা",
  "ঝগড়া করা",
  "গালাগালি করা",
  "পশু শিকার করা",
  "গাছের পাতা ছেঁড়া",
  "খারাপ কথা বলা",
];

const dontsEn = [
  "Intimacy",
  "Trimming beard or mustache",
  "Cutting hair or nails",
  "Removing body hair",
  "Using perfume or fragrance",
  "Quarreling",
  "Using foul language",
  "Hunting animals",
  "Tearing tree leaves",
  "Speaking ill",
];

export default function GuidelineSection() {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  return (
    <section id="guideline" className="py-20 bg-background islamic-pattern">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-primary text-sm font-medium tracking-[0.3em] uppercase">
            {bn ? "ওমরাহ গাইডলাইন" : "Umrah Guideline"}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 mb-4">
            {bn ? "ওমরাহ পালনে " : "Umrah "}
            <span className="text-gradient-gold">{bn ? "করণীয় ও বর্জনীয়" : "Do's & Don'ts"}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {bn
              ? "ওমরাহ একটি আধ্যাত্মিক যাত্রা। এটি এমন একটি সুযোগ যা বিশ্বের ধর্মপ্রাণ মুসলমানদের একত্রিত করে।"
              : "Umrah is a spiritual journey that brings together devout Muslims from around the world."}
          </p>
        </motion.div>

        {/* Step-by-step guide */}
        <div className="max-w-4xl mx-auto mb-16">
          <h3 className="font-heading text-xl font-bold mb-6 text-center">
            {bn ? "স্টেপ বাই স্টেপ ওমরাহ গাইডলাইন" : "Step by Step Umrah Guide"}
          </h3>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-2xl font-heading font-bold text-primary flex-shrink-0 w-10">
                    {step.num}
                  </span>
                  <h4 className="font-heading text-lg font-semibold flex-1">
                    {bn ? step.titleBn : step.titleEn}
                  </h4>
                  {expandedStep === i ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {expandedStep === i && (
                  <div className="px-5 pb-5 pt-0 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-3 mt-3">
                      {bn ? step.descBn : step.descEn}
                    </p>
                    {(bn ? step.itemsBn : step.itemsEn).length > 0 && (
                      <ul className="space-y-2 mb-3">
                        {(bn ? step.itemsBn : step.itemsEn).map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-foreground/80">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {step.duaBn && (
                      <div className="bg-secondary/50 rounded-lg p-4 text-sm italic text-primary/90 border-l-4 border-primary">
                        {bn ? step.duaBn : step.duaEn}
                      </div>
                    )}
                    {step.footerBn && (
                      <p className="text-sm text-muted-foreground mt-3">
                        {bn ? step.footerBn : step.footerEn}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dos and Don'ts */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "hsl(var(--emerald))" }}>
              <CheckCircle2 className="h-5 w-5" />
              {bn ? "ওমরাহ পালনে করণীয়" : "Do's During Umrah"}
            </h3>
            <ul className="space-y-3">
              {(bn ? dosBn : dosEn).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--emerald))" }} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              {bn ? "ওমরাহ পালনে বর্জনীয়" : "Don'ts During Umrah"}
            </h3>
            <ul className="space-y-3">
              {(bn ? dontsBn : dontsEn).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs text-muted-foreground text-center mt-8 max-w-2xl mx-auto"
        >
          {bn
            ? "নোট: ইহরাম অবস্থায় এ কাজগুলো করা যাবে না। ইহরাম থেকে মুক্ত হওয়ার পর ঝগড়া, গালাগালি ও খারাপ কথা বলা ছাড়া উপরের সব কাজ করা যাবে।"
            : "Note: These prohibitions apply while in Ihram. After exiting Ihram, all are permissible except quarreling, foul language, and speaking ill."}
        </motion.p>
      </div>
    </section>
  );
}
