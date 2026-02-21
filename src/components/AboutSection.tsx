import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Heart, Award, Clock } from "lucide-react";

const reasons = [
  { icon: Shield, title: "Government Approved", desc: "Fully licensed and government-approved Hajj & Umrah agency" },
  { icon: Heart, title: "Personalized Care", desc: "Dedicated support from booking to return journey" },
  { icon: Award, title: "Premium Quality", desc: "Top-rated hotels, transport and services at every step" },
  { icon: Clock, title: "15+ Years", desc: "Over a decade of trusted service in sacred travel" },
];

const AboutSection = () => {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState("");

  const handleTrack = () => {
    const id = trackingId.trim();
    if (!id) return;
    navigate(`/track?id=${encodeURIComponent(id.toUpperCase())}`);
  };

  return (
    <section id="about" className="py-24 islamic-pattern">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary text-sm font-medium tracking-[0.3em] uppercase">Why Choose Us</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 mb-6">
              A Journey of <span className="text-gradient-gold">Faith & Trust</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              RAHE KABA Tours & Travels has been serving pilgrims from Chittagong, Bangladesh with
              excellence since 2010. Our commitment to quality, transparency, and spiritual guidance
              makes us the preferred choice for thousands of families.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reasons.map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3"
                >
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <r.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{r.title}</h4>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-card border border-border rounded-xl p-8 shadow-luxury">
              <h3 className="font-heading text-2xl font-bold mb-6 text-gradient-gold">Track Your Booking</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your unique booking ID to check your booking status, payment history and travel updates.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter Booking ID"
                  className="flex-1 bg-secondary border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 uppercase"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                />
                <button
                  onClick={handleTrack}
                  className="bg-gradient-gold text-primary-foreground font-semibold px-6 py-3 rounded-md text-sm hover:opacity-90 transition-opacity"
                >
                  Track
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
