import { useState, useEffect } from "react";
import { Menu, X, Phone, User, Globe } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useLanguage } from "@/i18n/LanguageContext";
import { useMenuVisibility } from "@/components/admin/MenuVisibilityManager";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { data: content } = useSiteContent("navbar");
  const { language, setLanguage, t } = useLanguage();
  const { visibility: menuVisibility } = useMenuVisibility();

  const phone = content?.phone || "+880 1711-993562";

  const allNavLinks = [
    { key: "home", label: t("nav.home"), href: "#hero" },
    { key: "services", label: t("nav.services"), href: "#services" },
    { key: "packages", label: t("nav.packages"), href: "#packages" },
    { key: "hotels", label: t("nav.hotels"), href: "/hotels" },
    { key: "gallery", label: t("nav.gallery"), href: "#gallery" },
    { key: "about", label: t("nav.about"), href: "#about" },
    { key: "contact", label: t("nav.contact"), href: "#contact" },
    { key: "track", label: t("nav.track"), href: "/track" },
  ];

  const navLinks = allNavLinks.filter((link) => menuVisibility[link.key] !== false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    return () => subscription.unsubscribe();
  }, []);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const id = href.slice(1);
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else {
        if (id === "hero") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }
      }
      setOpen(false);
    }
  };

  const toggleLang = () => setLanguage(language === "en" ? "bn" : "en");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto flex items-center justify-between h-20 px-4">
        <a href="/" className="flex items-center">
          <img src={logo} alt="Manasik Travel Hub Logo" className="h-28 w-auto object-contain" />
        </a>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors tracking-wide uppercase"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-sm font-medium border border-border px-3 py-2 rounded-md hover:bg-secondary transition-colors"
            title={language === "bn" ? "View in English" : "বাংলায় দেখুন"}
          >
            <Globe className="h-4 w-4" />
            {language === "bn" ? "English" : "বাংলা"}
          </button>

          <a href={`tel:${phone.replace(/[\s-]/g, "")}`} className="flex items-center gap-2 text-sm text-primary">
            <Phone className="h-4 w-4" />
            {phone}
          </a>
        
        </div>

        {/* Mobile: lang toggle + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 text-xs font-medium border border-border px-2 py-1.5 rounded-md"
          >
            <Globe className="h-3.5 w-3.5" />
            {language === "bn" ? "EN" : "বাং"}
          </button>
          <button onClick={() => setOpen(!open)} className="text-foreground p-2">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-b border-border overflow-hidden shadow-soft"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-medium text-foreground/80 hover:text-primary py-2 uppercase tracking-wide"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
