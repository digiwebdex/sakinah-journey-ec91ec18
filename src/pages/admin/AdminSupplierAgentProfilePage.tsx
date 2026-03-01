import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Users, FileText, CreditCard, TrendingUp, TrendingDown,
  Phone, MapPin, Truck, Building2, DollarSign,
} from "lucide-react";
import { format } from "date-fns";

const fmt = (n: number) => `৳${Number(n || 0).toLocaleString()}`;

export default function AdminSupplierAgentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);

    const [agRes, bRes] = await Promise.all([
      supabase.from("supplier_agents").select("*").eq("id", id).maybeSingle(),
      supabase.from("bookings").select("*, packages(name, type, price)").eq("supplier_agent_id", id).order("created_at", { ascending: false }),
    ]);

    setAgent(agRes.data);
    setBookings((bRes.data as any[]) || []);

    const bookingIds = ((bRes.data as any[]) || []).map((b: any) => b.id);
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return <div className="text-center py-20 text-muted-foreground">সাপ্লায়ার এজেন্ট পাওয়া যায়নি</div>;
  }

  // Stats
  const totalHajji = bookings.reduce((s, b) => s + Number(b.num_travelers || 0), 0);
  const totalBookings = bookings.length;
  const totalPurchaseAmount = bookings.reduce((s, b) => s + Number(b.total_cost || 0), 0);
  const totalSellingAmount = bookings.reduce((s, b) => s + Number(b.total_amount || 0), 0);
  const totalPaid = bookings.reduce((s, b) => s + Number(b.paid_amount || 0), 0);
  const totalDue = bookings.reduce((s, b) => s + Number(b.due_amount || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const completedPayments = payments.filter((p) => p.status === "completed");
  const totalPaymentsMade = completedPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const profit = totalSellingAmount - totalPurchaseAmount - totalExpenses;
  const dueToAgent = totalPurchaseAmount - totalPaymentsMade;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/supplier-agents")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> {agent.agent_name}
          </h1>
          <p className="text-sm text-muted-foreground">সাপ্লায়ার এজেন্ট প্রোফাইল ড্যাশবোর্ড</p>
        </div>
        <Badge variant={agent.status === "active" ? "default" : "secondary"} className="text-sm">
          {agent.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
        </Badge>
      </div>

      {/* Agent Info */}
      <Card>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><span>{agent.company_name || "—"}</span></div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{agent.phone || "—"}</span></div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{agent.address || "—"}</span></div>
            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span>তৈরি: {format(new Date(agent.created_at), "dd MMM yyyy")}</span></div>
          </div>
          {agent.notes && <p className="text-sm text-muted-foreground mt-3 border-t border-border pt-3">{agent.notes}</p>}
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {[
          { icon: <Users className="h-5 w-5 text-primary" />, value: totalHajji, label: "মোট হাজী", cls: "text-foreground" },
          { icon: <FileText className="h-5 w-5 text-primary" />, value: totalBookings, label: "মোট বুকিং", cls: "text-foreground" },
          { icon: <DollarSign className="h-5 w-5 text-foreground" />, value: fmt(totalPurchaseAmount), label: "মোট ক্রয় মূল্য", cls: "text-foreground", small: true },
          { icon: <TrendingUp className="h-5 w-5 text-emerald-500" />, value: fmt(totalPaymentsMade), label: "মোট পেমেন্ট", cls: "text-emerald-500", small: true },
          { icon: <TrendingDown className="h-5 w-5 text-destructive" />, value: fmt(Math.max(0, dueToAgent)), label: "এজেন্টের বকেয়া", cls: "text-destructive", small: true },
          { icon: <CreditCard className="h-5 w-5 text-primary" />, value: fmt(totalSellingAmount), label: "বিক্রয় মূল্য", cls: "text-foreground", small: true },
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

      {/* Bookings Section */}
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
                    <th className="pb-2 pr-3">ট্র্যাকিং</th>
                    <th className="pb-2 pr-3">কাস্টমার</th>
                    <th className="pb-2 pr-3">প্যাকেজ</th>
                    <th className="pb-2 pr-3">যাত্রী</th>
                    <th className="pb-2 pr-3">প্রতি জন খরচ</th>
                    <th className="pb-2 pr-3">মোট খরচ</th>
                    <th className="pb-2 pr-3">বিক্রয় মূল্য</th>
                    <th className="pb-2 pr-3">স্ট্যাটাস</th>
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
                      <td className="py-2 pr-3">{fmt(b.cost_price_per_person)}</td>
                      <td className="py-2 pr-3 font-medium">{fmt(b.total_cost)}</td>
                      <td className="py-2 pr-3 font-medium">{fmt(b.total_amount)}</td>
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

      {/* Payments Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> পেমেন্ট হিস্ট্রি ({completedPayments.length}/{payments.length})
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
                    <th className="pb-2 pr-3">#</th>
                    <th className="pb-2 pr-3">পরিমাণ</th>
                    <th className="pb-2 pr-3">পদ্ধতি</th>
                    <th className="pb-2 pr-3">নির্ধারিত তারিখ</th>
                    <th className="pb-2 pr-3">পরিশোধের তারিখ</th>
                    <th className="pb-2">স্ট্যাটাস</th>
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
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">মোট ক্রয় মূল্য</p>
              <p className="font-heading font-bold text-lg text-foreground">{fmt(totalPurchaseAmount)}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">মোট বিক্রয় মূল্য</p>
              <p className="font-heading font-bold text-lg text-foreground">{fmt(totalSellingAmount)}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">মোট পেমেন্ট</p>
              <p className="font-heading font-bold text-lg text-emerald-500">{fmt(totalPaymentsMade)}</p>
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
              <p className="text-muted-foreground text-xs">লাভের মার্জিন</p>
              <p className="font-bold text-foreground">{totalSellingAmount > 0 ? `${((profit / totalSellingAmount) * 100).toFixed(1)}%` : "0%"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">প্রতি হাজী গড় খরচ</p>
              <p className="font-bold text-foreground">{totalHajji > 0 ? fmt(totalPurchaseAmount / totalHajji) : "৳0"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">প্রতি হাজী গড় বিক্রয়</p>
              <p className="font-bold text-foreground">{totalHajji > 0 ? fmt(totalSellingAmount / totalHajji) : "৳0"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
