import { motion } from "framer-motion";
import { Plane, Building2, Bus, MapPin, BookOpen, CreditCard, Globe, Users } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useLanguage } from "@/i18n/LanguageContext";

const iconMap: Record<string, any> = { BookOpen, Globe, CreditCard, Plane, Building2, Bus, MapPin, Users };

const ServicesSection = () => {
  const { data: content } = useSiteContent("services");
  const { t, language } = useLanguage();

  const lc = content?.[language];
  const sectionLabel = lc?.section_label || t("services.label");
  const heading = lc?.heading || t("services.heading");
  const headingHighlight = lc?.heading_highlight || t("services.headingHighlight");
  const description = lc?.description || t("services.description");

  const defaultServices = [
    { icon: "BookOpen", title: t("services.hajj"), desc: t("services.hajjDesc") },
    { icon: "Globe", title: t("services.umrah"), desc: t("services.umrahDesc") },
    { icon: "CreditCard", title: t("services.visa"), desc: t("services.visaDesc") },
    { icon: "Plane", title: t("services.airTicket"), desc: t("services.airTicketDesc") },
    { icon: "Building2", title: t("services.hotel"), desc: t("services.hotelDesc") },
    { icon: "Bus", title: t("services.transport"), desc: t("services.transportDesc") },
    { icon: "MapPin", title: t("services.ziyara"), desc: t("services.ziyaraDesc") },
    { icon: "Users", title: t("services.guide"), desc: t("services.guideDesc") },
  ];

  const items = lc?.items || defaultServices;

  return (
    <section id="services" className="py-24 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 islamic-pattern opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-primary text-xs font-semibold tracking-[0.3em] uppercase">{sectionLabel}</span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 mb-4">
            {heading} <span className="text-gradient-gold">{headingHighlight}</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-primary/30" />
            <div className="w-2 h-2 rounded-full bg-primary/50" />
            <div className="h-px w-12 bg-primary/30" />
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">{description}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((service: any, i: number) => {
            const IconComp = iconMap[service.icon] || Globe;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/40 transition-all duration-500 hover:shadow-luxury overflow-hidden"
              >
                {/* Hover gold top line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <IconComp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
