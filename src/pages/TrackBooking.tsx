import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Search, Package, CheckCircle2, Clock, Plane, FileCheck, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STATUS_STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "visa_processing", label: "Visa Processing", icon: FileCheck },
  { key: "ticket_confirmed", label: "Ticket Confirmed", icon: Plane },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

const TrackBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState(searchParams.get("id") || "");
  const [booking, setBooking] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (idOverride?: string) => {
    const id = (idOverride || trackingId).trim().toUpperCase();
    if (!id) return;
    setLoading(true);
    setSearched(true);

    const { data: bookingData } = await supabase
      .from("bookings")
      .select("*, packages(name, type)")
      .eq("tracking_id", id)
      .maybeSingle();

    setBooking(bookingData);

    if (bookingData) {
      const { data: paymentData } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", bookingData.id)
        .order("installment_number", { ascending: true });
      setPayments(paymentData || []);
    } else {
      setPayments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setTrackingId(id);
      handleSearch(id);
    }
  }, []);

  const currentStepIndex = booking
    ? STATUS_STEPS.findIndex((s) => s.key === booking.status)
    : -1;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="text-primary text-sm font-medium tracking-[0.3em] uppercase">Track</span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mt-3 mb-3">
              Track Your <span className="text-gradient-gold">Booking</span>
            </h1>
            <p className="text-muted-foreground text-sm">Enter your Tracking ID to view your booking status and details</p>
          </motion.div>

          {/* Search Bar */}
          <div className="flex gap-3 mb-10">
            <input
              type="text"
              placeholder="Enter Tracking ID (e.g. RK-A1B2C3D4)"
              className="flex-1 bg-secondary border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 uppercase"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-gradient-gold text-primary-foreground font-semibold px-6 py-3 rounded-md text-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Track
            </button>
          </div>

          {/* Results */}
          {loading && (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
              Searching...
            </div>
          )}

          {!loading && searched && !booking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-2">No booking found with this Tracking ID</p>
              <p className="text-xs text-muted-foreground">Please check your ID and try again, or <a href="/auth" className="text-primary hover:underline">sign in</a> to view your bookings.</p>
            </motion.div>
          )}

          {!loading && booking && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Status Timeline */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-heading text-lg font-bold mb-6">Booking Status</h2>
                <div className="flex items-center justify-between relative">
                  {/* Line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
                  <div
                    className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                    style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                  />
                  {STATUS_STEPS.map((step, i) => {
                    const isActive = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? "bg-primary text-primary-foreground shadow-gold scale-110"
                              : isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          <step.icon className="h-4 w-4" />
                        </div>
                        <span className={`text-xs mt-2 font-medium text-center max-w-[80px] ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-heading text-lg font-bold mb-4">Booking Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tracking ID</p>
                    <p className="font-mono font-bold text-primary">{booking.tracking_id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Package</p>
                    <p className="font-medium">{booking.packages?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Travelers</p>
                    <p className="font-medium">{booking.num_travelers}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-medium">৳{Number(booking.total_amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Paid</p>
                    <p className="font-medium text-emerald">৳{Number(booking.paid_amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due</p>
                    <p className="font-medium text-destructive">৳{Number(booking.due_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Booked On</p>
                    <p className="font-medium">{new Date(booking.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {payments.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-heading text-lg font-bold mb-4">Payment Schedule</h2>
                  <div className="space-y-3">
                    {payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div>
                          <p className="text-sm font-medium">Installment #{p.installment_number || "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {p.due_date ? new Date(p.due_date).toLocaleDateString() : "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">৳{Number(p.amount).toLocaleString()}</p>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                              p.status === "completed"
                                ? "bg-emerald/10 text-emerald"
                                : p.status === "pending" && p.due_date && new Date(p.due_date) < new Date()
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {p.status === "pending" && p.due_date && new Date(p.due_date) < new Date() ? "overdue" : p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground">
                For any questions, <a href="/#contact" className="text-primary hover:underline">contact us</a> or call +880 1601-505050
              </p>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TrackBooking;
