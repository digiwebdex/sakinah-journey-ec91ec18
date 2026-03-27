import { Phone, Mail, MapPin, Facebook, Youtube, Instagram, Star, Plane } from "lucide-react";
import sslcommerzPayWith from "@/assets/payment/sslcommerz-pay-with.png";
import logo from "@/assets/logo.png";
import footerJourney from "@/assets/footer-journey.jpg";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { data: content } = useSiteContent("footer");
  const { t, language } = useLanguage();

  const lc = content?.[language];
  const companyName = content?.company_name || "MANASIK";
  const tagline = lc?.company_tagline || (language === "bn" ? "ট্রাভেল হাব" : content?.company_tagline || "Travel Hub");
  const description = lc?.description || (language === "bn" ? "হজ্জ ও উমরাহের বিশ্বস্ত সঙ্গী। পবিত্র যাত্রা সহজ করে আসছি।" : content?.description || "Your trusted companion for Hajj & Umrah. Making sacred journeys easy and comfortable.");
  const phone = content?.phone || "+880 1711-993562";
  const email = content?.email || "manasiktravelhub@gmail.com";
  const address = lc?.address || (language === "bn" ? "৫৯৫/১, মিল্ক ভিটা রোড, তিন রাস্তার মোড়\nদেওলা, টাঙ্গাইল সদর, টাঙ্গাইল" : content?.address || "595/1, Milk Vita Road, Three-way Intersection\nDewla, Tangail Sadar, Tangail");
  const servicesList = lc?.services_list || (language === "bn" ? ["হজ প্যাকেজ", "উমরাহ প্যাকেজ", "ভিসা প্রসেসিং", "এয়ার টিকেট", "হোটেল বুকিং", "জিয়ারা ট্যুর"] : content?.services_list || ["Hajj Packages", "Umrah Packages", "Visa Processing", "Air Tickets", "Hotel Booking", "Ziyara Tours"]);
  const devName = content?.developer_name || "DigiWebDex";
  const devUrl = content?.developer_url || "https://digiwebdex.com";

  const quickLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.packages"), href: "/packages" },
    { label: t("nav.hotels"), href: "/hotels" },
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.contact"), href: "/contact" },
    { label: t("nav.track"), href: "/track" },
  ];

  return (
    <>
      {/* Animated Journey Banner - Bangladesh to Makkah */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {/* Background journey image */}
        <img
          src={footerJourney}
          alt="Journey from Bangladesh to Makkah"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-[hsl(220,25%,10%)]" />
        <div className="absolute inset-0 bg-black/15" />

        {/* Animated plane flying from Bangladesh (left) to Makkah (right) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Dotted flight path */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <path
              d="M 5,60 Q 25,30 50,45 T 95,35"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="8 6"
              opacity="0.5"
              vectorEffect="non-scaling-stroke"
              style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.4))' }}
            />
          </svg>

          {/* Animated plane */}
          <div className="animate-[planeJourney_8s_ease-in-out_infinite]">
            <div className="bg-primary/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg shadow-primary/30">
              <Plane className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground -rotate-12" />
            </div>
          </div>
        </div>

        {/* Location labels */}
        <div className="absolute bottom-16 left-6 md:left-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
            <p className="text-xs font-bold text-foreground">{language === "bn" ? "🇧🇩 বাংলাদেশ" : "🇧🇩 Bangladesh"}</p>
          </div>
        </div>
        <div className="absolute bottom-16 right-6 md:right-12">
          <div className="bg-primary/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
            <p className="text-xs font-bold text-primary-foreground">{language === "bn" ? "🕋 মক্কা শরীফ" : "🕋 Makkah Sharif"}</p>
          </div>
        </div>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="animate-fade-in">
            <p className="text-primary font-heading text-sm md:text-base uppercase tracking-[0.3em] mb-2 drop-shadow-lg">
              {language === "bn" ? "পবিত্র যাত্রার সঙ্গী" : "Your Sacred Journey Partner"}
            </p>
            <h3 className="text-white text-2xl md:text-4xl font-heading font-bold mb-3 drop-shadow-lg">
              {language === "bn" ? "বাংলাদেশ থেকে মক্কা শরীফ" : "Bangladesh to Makkah Sharif"}
            </h3>
            <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto drop-shadow-md">
              {language === "bn" ? "বিশ্বস্ততা ও নিষ্ঠার সাথে আপনার পবিত্র যাত্রা সম্পন্ন করি" : "Completing your sacred journey with trust and dedication"}
            </p>
          </div>
        </div>
      </div>
    <footer className="bg-[hsl(220,25%,10%)] text-white py-16 relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-gold" />
      
      {/* Subtle pattern */}
      <div className="absolute inset-0 islamic-pattern opacity-5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-white rounded-xl p-2">
                <img src={logo} alt={`${companyName} Logo`} className="h-14 w-auto object-contain" />
              </div>
              <div>
                <span className="font-heading text-lg font-bold text-white">{companyName}</span>
                <span className="block text-xs tracking-[0.2em] text-white/60 uppercase">{tagline}</span>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-5">{description}</p>
            <div className="flex items-center gap-3">
              <a href={content?.facebook_url || "https://www.facebook.com/profile.php?id=61585173125908"} target="_blank" rel="noopener noreferrer" className="bg-white/8 hover:bg-primary/80 transition-all p-2.5 rounded-xl border border-white/10 hover:border-primary">
                <Facebook className="h-4 w-4 text-white" />
              </a>
              <a href={content?.youtube_url || "#"} target="_blank" rel="noopener noreferrer" className="bg-white/8 hover:bg-red-600/80 transition-all p-2.5 rounded-xl border border-white/10 hover:border-red-600">
                <Youtube className="h-4 w-4 text-white" />
              </a>
              <a href={content?.instagram_url || "#"} target="_blank" rel="noopener noreferrer" className="bg-white/8 hover:bg-pink-600/80 transition-all p-2.5 rounded-xl border border-white/10 hover:border-pink-600">
                <Instagram className="h-4 w-4 text-white" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-5 text-primary text-sm uppercase tracking-wider">{t("footer.quickLinks")}</h4>
            <ul className="space-y-3 text-sm text-white/50">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-primary transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-5 text-primary text-sm uppercase tracking-wider">{t("footer.services")}</h4>
            <ul className="space-y-3 text-sm text-white/50">
              {servicesList.map((s: string) => (
                <li key={s}><span>{s}</span></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-5 text-primary text-sm uppercase tracking-wider">{t("footer.contact")}</h4>
            <ul className="space-y-4 text-sm text-white/50">
              <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0"><Phone className="h-3.5 w-3.5 text-primary" /></div> {phone}</li>
              <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0"><Mail className="h-3.5 w-3.5 text-primary" /></div> {email}</li>
              <li className="flex items-start gap-3"><div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5"><MapPin className="h-3.5 w-3.5 text-primary" /></div> <span className="whitespace-pre-line">{address}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/8">
          <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm text-white/40">
            <a href="/privacy-policy" className="hover:text-primary transition-colors">{language === "bn" ? "গোপনীয়তা নীতি" : "Privacy Policy"}</a>
            <span className="text-white/15">|</span>
            <a href="/terms-conditions" className="hover:text-primary transition-colors">{language === "bn" ? "শর্তাবলী" : "Terms & Conditions"}</a>
            <span className="text-white/15">|</span>
            <a href="/refund-policy" className="hover:text-primary transition-colors">{language === "bn" ? "রিফান্ড নীতি" : "Refund Policy"}</a>
          </div>
          <div className="flex justify-center mb-5">
            <img src={sslcommerzPayWith} alt="Payment Methods - Pay With SSLCommerz" className="h-10 md:h-12 object-contain opacity-60" />
          </div>
          <div className="text-center text-sm text-white/35">
            <p>© {new Date().getFullYear()} {companyName} {tagline}. {t("footer.allRights")}</p>
            <p className="mt-2 text-xs text-white/20">{t("footer.designBy")} <a href={devUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{devName}</a></p>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
