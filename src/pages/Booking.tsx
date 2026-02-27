import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Package, Users, CreditCard, Check, User, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingStepIndicator from "@/components/booking/BookingStepIndicator";
import PersonalDetailsStep, { type PersonalInfo } from "@/components/booking/PersonalDetailsStep";
import BookingSuccess from "@/components/booking/BookingSuccess";
import { useLanguage } from "@/i18n/LanguageContext";

const Booking = () => {
  const { t } = useLanguage();

  const STEPS = [
    { label: t("booking.package"), icon: <Package className="h-4 w-4" /> },
    { label: t("booking.details"), icon: <User className="h-4 w-4" /> },
    { label: t("booking.payment"), icon: <CreditCard className="h-4 w-4" /> },
    { label: t("booking.confirm"), icon: <Check className="h-4 w-4" /> },
  ];

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packageId = searchParams.get("package");

  const [user, setUser] = useState<any>(null);
  const [pkg, setPkg] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  const [numTravelers, setNumTravelers] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    phone: "",
    passportNumber: "",
    address: "",
  });

  // After booking created
  const [createdBooking, setCreatedBooking] = useState<{ id: string; tracking_id: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t("booking.signInToBook"));
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Load profile, package, and plans in parallel
      const [profileRes, pkgRes, planRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", session.user.id).single(),
        packageId
          ? supabase.from("packages").select("*").eq("id", packageId).eq("is_active", true).single()
          : Promise.resolve({ data: null }),
        supabase.from("installment_plans").select("*").eq("is_active", true).order("num_installments"),
      ]);

      // Pre-fill personal info from profile
      if (profileRes.data) {
        const p = profileRes.data;
        setPersonalInfo({
          fullName: p.full_name || "",
          phone: p.phone || "",
          passportNumber: p.passport_number || "",
          address: p.address || "",
        });
      }

      setPkg(pkgRes.data);
      setPlans(planRes.data || []);
      setLoading(false);
    };
    init();
  }, [packageId, navigate]);

  const totalAmount = pkg ? Number(pkg.price) * numTravelers : 0;

  const validateStep = (): boolean => {
    if (step === 0 && !pkg) {
      toast.error(t("booking.selectPackage"));
      return false;
    }
    if (step === 1) {
      if (!personalInfo.fullName.trim()) {
        toast.error(t("booking.nameRequired"));
        return false;
      }
      if (!personalInfo.phone.trim()) {
        toast.error(t("booking.phoneRequired"));
        return false;
      }
      if (!personalInfo.passportNumber.trim()) {
        toast.error(t("booking.passportRequired"));
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!pkg || !user) return;

    setSubmitting(true);
    try {
      // Update profile with personal details
      await supabase
        .from("profiles")
        .update({
          full_name: personalInfo.fullName.trim(),
          phone: personalInfo.phone.trim(),
          passport_number: personalInfo.passportNumber.trim(),
          address: personalInfo.address.trim() || null,
        })
        .eq("user_id", user.id);

      // Create booking
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          package_id: pkg.id,
          total_amount: totalAmount,
          num_travelers: numTravelers,
          installment_plan_id: selectedPlan || null,
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Generate installment schedule if plan selected
      if (selectedPlan) {
        const plan = plans.find((p) => p.id === selectedPlan);
        if (plan) {
          await supabase.rpc("generate_installment_schedule", {
            p_booking_id: booking.id,
            p_total_amount: totalAmount,
            p_num_installments: plan.num_installments,
            p_user_id: user.id,
          });
        }
      }

      setCreatedBooking({ id: booking.id, tracking_id: booking.tracking_id });
      toast.success(`Booking created! Tracking ID: ${booking.tracking_id}`);
    } catch (err: any) {
      toast.error(err.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32 text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  const inputClass =
    "w-full bg-secondary border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <button
            onClick={() => (step > 0 && !createdBooking ? prevStep() : navigate(-1))}
            className="text-sm text-muted-foreground hover:text-primary mb-6 inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> {t("booking.back")}
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <span className="text-primary text-sm font-medium tracking-[0.3em] uppercase">{t("booking.bookNow")}</span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mt-3 mb-3">
              {t("booking.completeYour")} <span className="text-gradient-gold">{t("booking.booking")}</span>
            </h1>
          </motion.div>

          {!pkg && !createdBooking ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">{t("booking.noPackage")}</p>
              <Link to="/packages" className="text-primary hover:underline">{t("booking.browsePackages")}</Link>
            </div>
          ) : createdBooking ? (
            /* Success + Document Upload */
            <BookingSuccess
              bookingId={createdBooking.id}
              trackingId={createdBooking.tracking_id}
              userId={user.id}
            />
          ) : (
            <>
              <BookingStepIndicator steps={STEPS} currentStep={step} />

              {/* Step 0: Package & Travelers */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" /> {t("booking.packageDetails")}
                    </h2>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-heading font-bold text-lg">{pkg.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{pkg.type} • {pkg.duration_days} {t("common.days")}</p>
                      </div>
                      <p className="text-xl font-heading font-bold text-primary">
                        ৳{Number(pkg.price).toLocaleString()}
                        <span className="text-xs font-body text-muted-foreground font-normal"> {t("common.perPerson")}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" /> {t("booking.travelers")}
                    </h2>
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-muted-foreground">{t("booking.numTravelers")}</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={numTravelers}
                        onChange={(e) => setNumTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="mt-4 p-4 bg-secondary/50 rounded-lg flex justify-between">
                      <span className="text-sm text-muted-foreground">{t("booking.totalAmount")}</span>
                      <span className="text-lg font-heading font-bold text-primary">৳{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Personal Details */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <PersonalDetailsStep info={personalInfo} onChange={setPersonalInfo} />
                </motion.div>
              )}

              {/* Step 2: Payment Plan */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" /> {t("booking.paymentPlan")}
                    </h2>
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setSelectedPlan(null)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          !selectedPlan ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{t("booking.fullPayment")}</p>
                            <p className="text-xs text-muted-foreground">{t("booking.fullPaymentDesc")}</p>
                          </div>
                          {!selectedPlan && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </button>
                      {plans.map((plan) => (
                        <button
                          type="button"
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${
                            selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{plan.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {plan.num_installments} {t("booking.installments")} • ৳{Math.round(totalAmount / plan.num_installments).toLocaleString()}{t("booking.perMonth")}
                              </p>
                            </div>
                            {selectedPlan === plan.id && <Check className="h-5 w-5 text-primary" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <textarea
                      placeholder={t("booking.specialRequests")}
                      maxLength={500}
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review & Confirm */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h2 className="font-heading text-lg font-bold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" /> {t("booking.bookingSummary")}
                    </h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">{t("booking.package")}</span>
                        <span className="font-medium">{pkg.name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">{t("booking.type")}</span>
                        <span className="font-medium capitalize">{pkg.type}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">{t("booking.travelers")}</span>
                        <span className="font-medium">{numTravelers}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">{t("booking.name")}</span>
                        <span className="font-medium">{personalInfo.fullName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">{t("booking.phone")}</span>
                        <span className="font-medium">{personalInfo.phone}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">{t("booking.passport")}</span>
                        <span className="font-medium">{personalInfo.passportNumber}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-muted-foreground">{t("booking.paymentPlan")}</span>
                        <span className="font-medium">
                          {selectedPlan ? plans.find((p) => p.id === selectedPlan)?.name : t("booking.fullPayment")}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 bg-secondary/50 rounded-lg px-3 mt-2">
                        <span className="font-medium">{t("booking.totalAmount")}</span>
                        <span className="text-lg font-heading font-bold text-primary">৳{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex-1 py-3 rounded-md text-sm font-semibold border border-border text-foreground hover:bg-secondary transition-colors"
                  >
                    {t("booking.previous")}
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="flex-1 py-3 rounded-md text-sm font-semibold bg-gradient-gold text-primary-foreground hover:opacity-90 transition-opacity shadow-gold inline-flex items-center justify-center gap-2"
                  >
                    {t("booking.next")} <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-md text-sm font-semibold bg-gradient-gold text-primary-foreground hover:opacity-90 transition-opacity shadow-gold disabled:opacity-50"
                  >
                    {submitting ? t("booking.processing") : `${t("booking.confirmBooking")} — ৳${totalAmount.toLocaleString()}`}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Booking;
