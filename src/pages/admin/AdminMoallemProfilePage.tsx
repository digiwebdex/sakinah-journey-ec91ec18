import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsViewer } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Users, FileText, CreditCard, TrendingUp, TrendingDown,
  Phone, MapPin, CalendarDays, Hash, Plus, Wallet,
} from "lucide-react";
import { format } from "date-fns";

const fmt = (n: number) => `৳${Number(n || 0).toLocaleString()}`;

const PAYMENT_METHODS = ["cash", "bkash", "nagad", "bank", "other"];

export default function AdminMoallemProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isViewer = useIsViewer();
  const [moallem, setMoallem] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [moallemPayments, setMoallemPayments] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const emptyPaymentForm = {
    amount: "",
    payment_method: "cash",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    wallet_account_id: "",
    booking_id: "",
  };
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);

    const [mRes, bRes, mpRes, accRes] = await Promise.all([
      supabase.from("moallems").select("*").eq("id", id).maybeSingle(),
      supabase.from("bookings").select("*, packages(name, type, price)").eq("moallem_id", id).order("created_at", { ascending: false }),
      supabase.from("moallem_payments").select("*").eq("moallem_id", id).order("created_at", { ascending: false }),
      supabase.from("accounts").select("id, name, type, balance").order("name"),
    ]);

    setMoallem(mRes.data);
    setBookings(bRes.data || []);
    setMoallemPayments(mpRes.data || []);
    setAccounts(accRes.data || []);

    const bookingIds = (bRes.data || []).map((b: any) => b.id);
    if (bookingIds.length > 0) {
      const [payRes, expRes] = await Promise.all([
        supabase.from("payments").select("*").in("booking_id", bookingIds).order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").in("booking_id", bookingIds).order("date", { ascending: false }),
      ]);
      setPayments(payRes.data || []);
      setExpenses(expRes.data || []);
    } else {
      setPayments([]);
      setExpenses([]);
    }

    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  // === Record Moallem Payment ===
  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentForm.amount);
    if (!amount || amount <= 0) { toast({ title: "সঠিক পরিমাণ দিন", variant: "destructive" }); return; }

    setPaymentLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Not authenticated", variant: "destructive" }); return; }

      // 1. Insert moallem payment record
      const { error: mpErr } = await supabase.from("moallem_payments").insert({
        moallem_id: id,
        amount,
        payment_method: paymentForm.payment_method,
        date: paymentForm.date,
        notes: paymentForm.notes.trim() || null,
        wallet_account_id: paymentForm.wallet_account_id || null,
        booking_id: paymentForm.booking_id || null,
        recorded_by: session.user.id,
      });
      if (mpErr) throw mpErr;

      // 2. Distribute to unpaid bookings (FIFO by created_at)
      let remaining = amount;
      const unpaidBookings = bookings
        .filter((b) => Number(b.due_amount || 0) > 0)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      for (const booking of unpaidBookings) {
        if (remaining <= 0) break;
        const due = Number(booking.due_amount || 0);
        const allocate = Math.min(remaining, due);

        // Create payment record for this booking
        await supabase.from("payments").insert({
          booking_id: booking.id,
          user_id: booking.user_id || session.user.id,
          customer_id: booking.user_id,
          amount: allocate,
          status: "completed",
          payment_method: paymentForm.payment_method,
          paid_at: new Date().toISOString(),
          notes: `মোয়াল্লেম ডিপোজিট — ${moallem?.name || ""}`,
          wallet_account_id: paymentForm.wallet_account_id || null,
        });

        remaining -= allocate;
      }

      // Moallem totals are auto-updated by database triggers (trg_update_moallem_on_deposit + update_booking_paid_amount)

      toast({ title: "পেমেন্ট রেকর্ড হয়েছে", description: `৳${amount.toLocaleString()} জমা হয়েছে` });
      setShowPaymentForm(false);
      setPaymentForm(emptyPaymentForm);
      loadData();
    } catch (err: any) {
      toast({ title: "ত্রুটি", description: err.message, variant: "destructive" });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!moallem) {
    return <div className="text-center py-20 text-muted-foreground">মোয়াল্লেম পাওয়া যায়নি</div>;
  }

  // Stats
  const totalHajji = bookings.reduce((s, b) => s + Number(b.num_travelers || 0), 0);
  const totalBookings = bookings.length;
  const totalPackageAmount = bookings.reduce((s, b) => s + Number(b.total_amount || 0), 0);
  const totalPaid = bookings.reduce((s, b) => s + Number(b.paid_amount || 0), 0);
  const totalDue = bookings.reduce((s, b) => s + Number(b.due_amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalMoallemDeposit = moallemPayments.reduce((s, p) => s + Number(p.amount), 0);
  const totalMoallemPaid = bookings.reduce((s, b) => s + Number(b.paid_by_moallem || 0), 0);
  const totalMoallemDue = bookings.reduce((s, b) => s + Number(b.moallem_due || 0), 0);
  const profit = totalPaid - totalExpenses;

  // Hajji list
  const hajjiMap = new Map<string, any>();
  bookings.forEach((b) => {
    const key = b.guest_phone || b.guest_name || b.id;
    if (!hajjiMap.has(key)) {
      hajjiMap.set(key, {
        name: b.guest_name || "Unknown", phone: b.guest_phone || "—",
        passport: b.guest_passport || "—", travelers: b.num_travelers,
        bookingCount: 1, totalAmount: Number(b.total_amount || 0), paidAmount: Number(b.paid_amount || 0),
      });
    } else {
      const ex = hajjiMap.get(key);
      ex.travelers += b.num_travelers;
      ex.bookingCount += 1;
      ex.totalAmount += Number(b.total_amount || 0);
      ex.paidAmount += Number(b.paid_amount || 0);
    }
  });
  const hajjiList = Array.from(hajjiMap.values());
  const completedPayments = payments.filter((p) => p.status === "completed");

  const walletAccounts = accounts.filter((a) => ["asset", "wallet"].includes(a.type) || ["Cash", "bKash", "Nagad", "Bank"].includes(a.name));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/moallems")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{moallem.name}</h1>
          <p className="text-sm text-muted-foreground">মোয়াল্লেম প্রোফাইল ড্যাশবোর্ড</p>
        </div>
        <div className="flex items-center gap-2">
          {!isViewer && (
            <Button onClick={() => setShowPaymentForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> পেমেন্ট রেকর্ড
            </Button>
          )}
          <Badge variant={moallem.status === "active" ? "default" : "secondary"} className="text-sm">
            {moallem.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
          </Badge>
        </div>
      </div>

      {/* Moallem Info */}
      <Card>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{moallem.phone || "—"}</span></div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{moallem.address || "—"}</span></div>
            <div className="flex items-center gap-2"><Hash className="h-4 w-4 text-muted-foreground" /><span>NID: {moallem.nid_number || "—"}</span></div>
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /><span>চুক্তি: {moallem.contract_date || "—"}</span></div>
          </div>
          {moallem.notes && <p className="text-sm text-muted-foreground mt-3 border-t border-border pt-3">{moallem.notes}</p>}
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {[
          { icon: <Users className="h-5 w-5 text-primary" />, value: totalHajji, label: "মোট হাজী", cls: "text-foreground" },
          { icon: <FileText className="h-5 w-5 text-primary" />, value: totalBookings, label: "মোট বুকিং", cls: "text-foreground" },
          { icon: <CreditCard className="h-5 w-5 text-primary" />, value: fmt(totalPackageAmount), label: "মোট বিক্রয়", cls: "text-foreground", small: true },
          { icon: <Wallet className="h-5 w-5 text-emerald-500" />, value: fmt(totalMoallemPaid), label: "মোয়াল্লেম পরিশোধিত", cls: "text-emerald-500", small: true },
          { icon: <TrendingDown className="h-5 w-5 text-destructive" />, value: fmt(totalMoallemDue), label: "মোয়াল্লেম বকেয়া", cls: "text-destructive", small: true },
          { icon: <TrendingUp className="h-5 w-5 text-emerald-500" />, value: fmt(totalMoallemDeposit), label: "মোয়াল্লেম জমা", cls: "text-emerald-500", small: true },
          { icon: profit >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-500" /> : <TrendingDown className="h-5 w-5 text-destructive" />, value: fmt(profit), label: "লাভ", cls: profit >= 0 ? "text-emerald-500" : "text-destructive", small: true },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="mx-auto mb-1 flex justify-center">{kpi.icon}</div>
              <p className={`${kpi.small ? "text-lg" : "text-2xl"} font-bold ${kpi.cls}`}>{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Moallem Deposit History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" /> মোয়াল্লেম ডিপোজিট হিস্ট্রি ({moallemPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {moallemPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">কোনো ডিপোজিট রেকর্ড নেই</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                   <tr className="border-b border-border text-left text-muted-foreground text-xs">
                     <th className="pb-2 pr-3">তারিখ</th>
                     <th className="pb-2 pr-3">বুকিং</th>
                     <th className="pb-2 pr-3">পরিমাণ</th>
                     <th className="pb-2 pr-3">পদ্ধতি</th>
                     <th className="pb-2">নোট</th>
                   </tr>
                 </thead>
                 <tbody>
                   {moallemPayments.map((mp: any) => (
                     <tr key={mp.id} className="border-b border-border/30">
                       <td className="py-2 pr-3 text-xs">{format(new Date(mp.date), "dd MMM yyyy")}</td>
                       <td className="py-2 pr-3 text-xs font-mono text-primary">{mp.booking_id ? bookings.find((b: any) => b.id === mp.booking_id)?.tracking_id || "—" : "FIFO"}</td>
                       <td className="py-2 pr-3 font-bold text-emerald-500">{fmt(mp.amount)}</td>
                       <td className="py-2 pr-3 capitalize">{mp.payment_method}</td>
                       <td className="py-2 text-xs text-muted-foreground">{mp.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hajji List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> হাজী তালিকা ({hajjiList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hajjiList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">কোনো হাজী পাওয়া যায়নি</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground text-xs">
                    <th className="pb-2 pr-3">নাম</th><th className="pb-2 pr-3">ফোন</th>
                    <th className="pb-2 pr-3">পাসপোর্ট</th><th className="pb-2 pr-3">যাত্রী</th>
                    <th className="pb-2 pr-3">মোট</th><th className="pb-2">পরিশোধিত</th>
                  </tr>
                </thead>
                <tbody>
                  {hajjiList.map((h, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="py-2 pr-3 font-medium">{h.name}</td>
                      <td className="py-2 pr-3">{h.phone}</td>
                      <td className="py-2 pr-3">{h.passport}</td>
                      <td className="py-2 pr-3">{h.travelers}</td>
                      <td className="py-2 pr-3">{fmt(h.totalAmount)}</td>
                      <td className="py-2 text-emerald-500 font-medium">{fmt(h.paidAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> বুকিং তালিকা ({bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">কোনো বুকিং পাওয়া যায়নি</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground text-xs">
                     <th className="pb-2 pr-3">ট্র্যাকিং</th><th className="pb-2 pr-3">কাস্টমার</th>
                     <th className="pb-2 pr-3">প্যাকেজ</th><th className="pb-2 pr-3">যাত্রী</th>
                     <th className="pb-2 pr-3">মোট</th><th className="pb-2 pr-3">মোয়াল্লেম পরিশোধিত</th>
                     <th className="pb-2 pr-3">মোয়াল্লেম বকেয়া</th><th className="pb-2 pr-3">স্ট্যাটাস</th>
                     <th className="pb-2">তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-border/30 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => navigate(`/admin/bookings`)}>
                      <td className="py-2 pr-3 font-mono text-primary font-medium text-xs">{b.tracking_id}</td>
                      <td className="py-2 pr-3">{b.guest_name || "—"}</td>
                      <td className="py-2 pr-3">{b.packages?.name || "—"}</td>
                      <td className="py-2 pr-3">{b.num_travelers}</td>
                       <td className="py-2 pr-3 font-medium">{fmt(b.total_amount)}</td>
                       <td className="py-2 pr-3 text-emerald-500">{fmt(b.paid_by_moallem)}</td>
                       <td className="py-2 pr-3 text-destructive">{fmt(b.moallem_due)}</td>
                      <td className="py-2 pr-3">
                        <Badge variant={b.status === "completed" ? "default" : "secondary"} className="text-[10px] capitalize">{b.status}</Badge>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">{format(new Date(b.created_at), "dd MMM yyyy")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> বুকিং পেমেন্ট হিস্ট্রি ({completedPayments.length}/{payments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">কোনো পেমেন্ট পাওয়া যায়নি</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground text-xs">
                    <th className="pb-2 pr-3">#</th><th className="pb-2 pr-3">পরিমাণ</th>
                    <th className="pb-2 pr-3">পদ্ধতি</th><th className="pb-2 pr-3">নির্ধারিত তারিখ</th>
                    <th className="pb-2 pr-3">পরিশোধের তারিখ</th><th className="pb-2">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-border/30">
                      <td className="py-2 pr-3 font-medium">{p.installment_number || "—"}</td>
                      <td className="py-2 pr-3 font-medium">{fmt(p.amount)}</td>
                      <td className="py-2 pr-3 capitalize">{p.payment_method || "—"}</td>
                      <td className="py-2 pr-3 text-xs">{p.due_date ? format(new Date(p.due_date), "dd MMM yyyy") : "—"}</td>
                      <td className="py-2 pr-3 text-xs">{p.paid_at ? format(new Date(p.paid_at), "dd MMM yyyy") : "—"}</td>
                      <td className="py-2">
                        <Badge variant={p.status === "completed" ? "default" : "secondary"} className="text-[10px] capitalize">{p.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> আর্থিক সারসংক্ষেপ
          </CardTitle>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
             <div className="bg-secondary/50 rounded-lg p-4">
               <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">মোট বিক্রয় মূল্য</p>
               <p className="font-heading font-bold text-lg text-foreground">{fmt(totalPackageAmount)}</p>
             </div>
             <div className="bg-secondary/50 rounded-lg p-4">
               <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">মোয়াল্লেম পরিশোধিত</p>
               <p className="font-heading font-bold text-lg text-emerald-500">{fmt(totalMoallemPaid)}</p>
             </div>
             <div className="bg-secondary/50 rounded-lg p-4">
               <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">মোয়াল্লেম বকেয়া</p>
               <p className="font-heading font-bold text-lg text-destructive">{fmt(totalMoallemDue)}</p>
             </div>
             <div className="bg-secondary/50 rounded-lg p-4">
               <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">মোট খরচ</p>
               <p className="font-heading font-bold text-lg text-destructive">{fmt(totalExpenses)}</p>
             </div>
             <div className="bg-secondary/50 rounded-lg p-4">
               <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">নিট লাভ</p>
               <p className={`font-heading font-bold text-lg ${profit >= 0 ? "text-emerald-500" : "text-destructive"}`}>{fmt(profit)}</p>
             </div>
           </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-muted-foreground text-xs">সংগ্রহের হার</p>
              <p className="font-bold text-foreground">{totalPackageAmount > 0 ? `${((totalPaid / totalPackageAmount) * 100).toFixed(1)}%` : "0%"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">গড় বুকিং মূল্য</p>
              <p className="font-bold text-foreground">{totalBookings > 0 ? fmt(totalPackageAmount / totalBookings) : "৳0"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">প্রতি হাজী গড়</p>
              <p className="font-bold text-foreground">{totalHajji > 0 ? fmt(totalPackageAmount / totalHajji) : "৳0"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={(o) => { if (!o) setShowPaymentForm(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>মোয়াল্লেম পেমেন্ট রেকর্ড</DialogTitle>
            <DialogDescription>{moallem.name} — মোয়াল্লেম বকেয়া: {fmt(totalMoallemDue)}</DialogDescription>
          </DialogHeader>
           <div className="space-y-4">
             <div>
               <label className="text-sm font-medium">বুকিং (ঐচ্ছিক)</label>
               <Select value={paymentForm.booking_id} onValueChange={(v) => setPaymentForm({ ...paymentForm, booking_id: v })}>
                 <SelectTrigger><SelectValue placeholder="-- বুকিং নির্বাচন করুন --" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="">FIFO বিতরণ</SelectItem>
                   {bookings.filter((b: any) => Number(b.moallem_due || 0) > 0).map((b: any) => (
                     <SelectItem key={b.id} value={b.id}>
                       {b.tracking_id} — {b.guest_name || "N/A"} — বকেয়া: {fmt(b.moallem_due)}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div>
               <label className="text-sm font-medium">পরিমাণ (৳) *</label>
              <Input type="number" min={1} value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="পরিমাণ লিখুন" />
            </div>
            <div>
              <label className="text-sm font-medium">পেমেন্ট পদ্ধতি</label>
              <Select value={paymentForm.payment_method} onValueChange={(v) => setPaymentForm({ ...paymentForm, payment_method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">ওয়ালেট অ্যাকাউন্ট (ঐচ্ছিক)</label>
              <Select value={paymentForm.wallet_account_id} onValueChange={(v) => setPaymentForm({ ...paymentForm, wallet_account_id: v })}>
                <SelectTrigger><SelectValue placeholder="-- নির্বাচন করুন --" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">কোনোটি নয়</SelectItem>
                  {walletAccounts.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">তারিখ</label>
              <Input type="date" value={paymentForm.date}
                onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">নোট</label>
              <Textarea value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                rows={2} placeholder="অতিরিক্ত তথ্য..." />
            </div>
            {totalDue > 0 && (
              <div className="bg-accent/50 rounded-lg p-3 text-xs text-muted-foreground">
                💡 এই পেমেন্ট স্বয়ংক্রিয়ভাবে বকেয়া বুকিংগুলোতে (FIFO) বিতরণ করা হবে এবং একাউন্টিং ট্র্যানজ্যাকশন তৈরি হবে।
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentForm(false)}>বাতিল</Button>
            <Button onClick={handleRecordPayment} disabled={paymentLoading}>
              {paymentLoading ? "প্রক্রিয়াকরণ..." : "রেকর্ড করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
