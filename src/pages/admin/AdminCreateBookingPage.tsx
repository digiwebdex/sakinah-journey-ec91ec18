import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Save, User, Phone, Mail, MapPin, FileText, Plus, Trash2 } from "lucide-react";
import CustomerSearchSelect from "@/components/admin/CustomerSearchSelect";

const inputClass =
  "w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

interface FamilyMember {
  id: string;
  full_name: string;
  passport_number: string;
  package_id: string;
  selling_price: number;
  discount: number;
}

export default function AdminCreateBookingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [moallems, setMoallems] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<"individual" | "family">("individual");

  // Individual form
  const [form, setForm] = useState({
    guest_name: "",
    guest_phone: "",
    guest_email: "",
    guest_address: "",
    guest_passport: "",
    package_id: "",
    selling_price_per_person: 0,
    discount: 0,
    paid_amount: 0,
    status: "pending",
    notes: "",
    moallem_id: "",
  });

  // Family members
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("packages").select("id, name, type, price, duration_days").eq("is_active", true).order("name"),
      supabase.from("moallems").select("id, name, phone, status").eq("status", "active").order("name"),
    ]).then(([pkgRes, moaRes]) => {
      setPackages(pkgRes.data || []);
      setMoallems(moaRes.data || []);
    });
  }, []);

  const handleCustomerSelect = (customer: any | null) => {
    if (customer) {
      setSelectedCustomerId(customer.user_id);
      setForm((prev) => ({
        ...prev,
        guest_name: customer.full_name || "",
        guest_phone: customer.phone || "",
        guest_email: customer.email || "",
        guest_address: customer.address || "",
        guest_passport: customer.passport_number || "",
      }));
    } else {
      setSelectedCustomerId(null);
      setForm((prev) => ({ ...prev, guest_name: "", guest_phone: "", guest_email: "", guest_address: "", guest_passport: "" }));
    }
  };

  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId);
    setForm((prev) => ({
      ...prev,
      package_id: packageId,
      selling_price_per_person: pkg ? Number(pkg.price) : prev.selling_price_per_person,
    }));
  };

  // Family member helpers
  const addMember = () => {
    setMembers([...members, {
      id: crypto.randomUUID(),
      full_name: "",
      passport_number: "",
      package_id: form.package_id || "",
      selling_price: form.selling_price_per_person || 0,
      discount: 0,
    }]);
  };

  const updateMember = (id: string, field: keyof FamilyMember, value: any) => {
    setMembers(members.map(m => {
      if (m.id !== id) return m;
      const updated = { ...m, [field]: value };
      if (field === "package_id") {
        const pkg = packages.find(p => p.id === value);
        if (pkg) updated.selling_price = Number(pkg.price);
      }
      return updated;
    }));
  };

  const removeMember = (id: string) => setMembers(members.filter(m => m.id !== id));

  // Calculations
  const individualFinalPrice = Math.max(0, form.selling_price_per_person - form.discount);
  const familyTotal = members.reduce((s, m) => s + Math.max(0, m.selling_price - m.discount), 0);
  const totalSellingPrice = bookingType === "family" ? familyTotal : individualFinalPrice;
  const numTravelers = bookingType === "family" ? members.length : 1;
  const dueAmount = Math.max(0, totalSellingPrice - form.paid_amount);

  const handleSubmit = async () => {
    if (!selectedCustomerId) { toast.error("অনুগ্রহ করে একজন কাস্টমার নির্বাচন করুন"); return; }
    if (bookingType === "individual" && !form.package_id) { toast.error("প্যাকেজ নির্বাচন করুন"); return; }
    if (bookingType === "family" && members.length === 0) { toast.error("পরিবারের সদস্য যোগ করুন"); return; }
    if (totalSellingPrice <= 0) { toast.error("মোট বিক্রয় মূল্য ০ এর বেশি হতে হবে"); return; }
    if (form.paid_amount > totalSellingPrice) { toast.error("পরিশোধিত পরিমাণ মোট মূল্যের বেশি হতে পারে না"); return; }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Not authenticated"); return; }

      const { data: booking, error } = await supabase.from("bookings").insert({
        booking_type: bookingType,
        guest_name: form.guest_name.trim(),
        guest_phone: form.guest_phone.trim(),
        guest_email: form.guest_email.trim() || null,
        guest_address: form.guest_address.trim() || null,
        guest_passport: form.guest_passport.trim() || null,
        package_id: bookingType === "individual" ? form.package_id : (members[0]?.package_id || form.package_id || packages[0]?.id),
        num_travelers: numTravelers,
        selling_price_per_person: bookingType === "individual" ? form.selling_price_per_person : 0,
        discount: bookingType === "individual" ? form.discount : 0,
        total_amount: totalSellingPrice,
        paid_amount: form.paid_amount,
        due_amount: dueAmount,
        status: form.status,
        notes: form.notes.trim() || null,
        user_id: selectedCustomerId,
        moallem_id: form.moallem_id || null,
      } as any).select("id, tracking_id").single();

      if (error) throw error;

      // Insert family members
      if (bookingType === "family" && members.length > 0 && booking) {
        const memberRows = members.map(m => ({
          booking_id: booking.id,
          full_name: m.full_name.trim(),
          passport_number: m.passport_number.trim() || null,
          package_id: m.package_id || null,
          selling_price: m.selling_price,
          discount: m.discount,
          final_price: Math.max(0, m.selling_price - m.discount),
        }));
        await supabase.from("booking_members" as any).insert(memberRows);
      }

      // Initial payment
      if (form.paid_amount > 0 && booking) {
        await supabase.from("payments").insert({
          booking_id: booking.id,
          user_id: selectedCustomerId || session.user.id,
          customer_id: selectedCustomerId,
          amount: form.paid_amount,
          status: "completed",
          payment_method: "manual",
          installment_number: 1,
          paid_at: new Date().toISOString(),
          notes: "Initial payment (admin booking)",
        });
      }

      toast.success(`বুকিং তৈরি হয়েছে! Tracking ID: ${booking?.tracking_id}`);
      navigate("/admin/bookings");
    } catch (err: any) {
      toast.error(err.message || "বুকিং তৈরিতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const selectedPkg = packages.find((p) => p.id === form.package_id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/bookings")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-xl font-bold">নতুন বুকিং তৈরি করুন</h2>
      </div>

      {/* Booking Type Toggle */}
      <div className="bg-card border border-border rounded-xl p-4">
        <label className="text-xs text-muted-foreground block mb-2">বুকিং ধরন</label>
        <div className="flex gap-2">
          {(["individual", "family"] as const).map(type => (
            <button key={type} onClick={() => setBookingType(type)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${bookingType === type ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"}`}>
              {type === "individual" ? "ব্যক্তিগত" : "পারিবারিক"}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Selection - Mandatory */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> কাস্টমার নির্বাচন *
        </h3>
        <p className="text-xs text-muted-foreground">কাস্টমার মডিউল থেকে আগে কাস্টমার তৈরি করুন, তারপর এখানে নির্বাচন করুন।</p>
        <CustomerSearchSelect onSelect={handleCustomerSelect} selectedId={selectedCustomerId} />

        {selectedCustomerId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-secondary/50 rounded-lg p-3">
            <div><span className="text-muted-foreground text-xs">নাম:</span> <span className="font-medium">{form.guest_name}</span></div>
            <div><span className="text-muted-foreground text-xs">ফোন:</span> <span className="font-medium">{form.guest_phone}</span></div>
            {form.guest_email && <div><span className="text-muted-foreground text-xs">ইমেইল:</span> <span>{form.guest_email}</span></div>}
            {form.guest_passport && <div><span className="text-muted-foreground text-xs">পাসপোর্ট:</span> <span>{form.guest_passport}</span></div>}
          </div>
        )}
      </div>

      {/* Individual Booking */}
      {bookingType === "individual" && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> প্যাকেজ ও মূল্য
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">প্যাকেজ *</label>
              <select className={inputClass} value={form.package_id} onChange={(e) => handlePackageChange(e.target.value)}>
                <option value="">-- প্যাকেজ বাছাই করুন --</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type}) — ৳{Number(p.price).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">বিক্রয় মূল্য (৳)</label>
              <input className={inputClass} type="number" min={0} value={form.selling_price_per_person}
                onChange={(e) => setForm(f => ({ ...f, selling_price_per_person: Math.max(0, parseFloat(e.target.value) || 0) }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">ডিসকাউন্ট (৳)</label>
              <input className={inputClass} type="number" min={0} value={form.discount}
                onChange={(e) => setForm(f => ({ ...f, discount: Math.max(0, parseFloat(e.target.value) || 0) }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">চূড়ান্ত মূল্য (৳)</label>
              <div className={`${inputClass} bg-muted/50 font-bold text-foreground`}>৳{individualFinalPrice.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Family Booking */}
      {bookingType === "family" && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> পরিবারের সদস্য ({members.length} জন)
            </h3>
            <button onClick={addMember} className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90">
              <Plus className="h-3 w-3" /> সদস্য যোগ করুন
            </button>
          </div>

          {members.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">কোনো সদস্য যোগ করা হয়নি। উপরের বোতামে ক্লিক করুন।</p>
          )}

          {members.map((m, idx) => (
            <div key={m.id} className="bg-secondary/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">সদস্য #{idx + 1}</span>
                <button onClick={() => removeMember(m.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">নাম *</label>
                  <input className={inputClass} value={m.full_name} onChange={(e) => updateMember(m.id, "full_name", e.target.value)} placeholder="পূর্ণ নাম" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">পাসপোর্ট</label>
                  <input className={inputClass} value={m.passport_number} onChange={(e) => updateMember(m.id, "passport_number", e.target.value)} placeholder="পাসপোর্ট নম্বর" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">প্যাকেজ</label>
                  <select className={inputClass} value={m.package_id} onChange={(e) => updateMember(m.id, "package_id", e.target.value)}>
                    <option value="">-- প্যাকেজ --</option>
                    {packages.map(p => <option key={p.id} value={p.id}>{p.name} — ৳{Number(p.price).toLocaleString()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">বিক্রয় মূল্য (৳)</label>
                  <input className={inputClass} type="number" min={0} value={m.selling_price}
                    onChange={(e) => updateMember(m.id, "selling_price", Math.max(0, parseFloat(e.target.value) || 0))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">ডিসকাউন্ট (৳)</label>
                  <input className={inputClass} type="number" min={0} value={m.discount}
                    onChange={(e) => updateMember(m.id, "discount", Math.max(0, parseFloat(e.target.value) || 0))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">চূড়ান্ত মূল্য</label>
                  <div className={`${inputClass} bg-muted/30 font-bold`}>৳{Math.max(0, m.selling_price - m.discount).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}

          {members.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
              <span className="text-muted-foreground">মোট বিক্রয়:</span>{" "}
              <span className="font-bold text-foreground">৳{familyTotal.toLocaleString()}</span>
              <span className="text-muted-foreground ml-3">({members.length} জন সদস্য)</span>
            </div>
          )}
        </div>
      )}

      {/* Moallem & Payment */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-heading font-semibold text-sm">অতিরিক্ত তথ্য</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">মোয়াল্লেম (ঐচ্ছিক)</label>
            <select className={inputClass} value={form.moallem_id} onChange={(e) => setForm({ ...form, moallem_id: e.target.value })}>
              <option value="">-- মোয়াল্লেম নির্বাচন করুন --</option>
              {moallems.map((m) => (
                <option key={m.id} value={m.id}>{m.name} {m.phone ? `(${m.phone})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">পরিশোধিত (৳)</label>
            <input className={inputClass} type="number" min={0} max={totalSellingPrice} value={form.paid_amount}
              onChange={(e) => setForm(f => ({ ...f, paid_amount: Math.max(0, parseFloat(e.target.value) || 0) }))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">স্ট্যাটাস</label>
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {["pending", "confirmed", "completed", "cancelled"].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">নোট</label>
            <input className={inputClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="অতিরিক্ত তথ্য..." maxLength={500} />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
        <h3 className="font-heading font-semibold text-sm mb-3">সারসংক্ষেপ</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">কাস্টমার</p>
            <p className="font-medium">{form.guest_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ধরন</p>
            <p className="font-medium">{bookingType === "individual" ? "ব্যক্তিগত" : `পারিবারিক (${members.length} জন)`}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">মোট বিক্রয়</p>
            <p className="font-heading font-bold text-foreground">৳{totalSellingPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">বকেয়া</p>
            <p className={`font-heading font-bold ${dueAmount > 0 ? "text-destructive" : "text-foreground"}`}>৳{dueAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button onClick={() => navigate("/admin/bookings")}
          className="px-5 py-2.5 text-sm rounded-md bg-secondary text-foreground hover:bg-muted transition-colors">
          বাতিল
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="px-5 py-2.5 text-sm rounded-md bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-gold disabled:opacity-50 flex items-center gap-2">
          <Save className="h-4 w-4" />
          {loading ? "তৈরি হচ্ছে..." : "বুকিং তৈরি করুন"}
        </button>
      </div>
    </div>
  );
}
