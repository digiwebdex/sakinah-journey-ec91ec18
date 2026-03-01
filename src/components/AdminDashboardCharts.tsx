import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Calendar,
  Users, Wallet, Landmark, Receipt, FileText, CreditCard, Calculator,
  Plus, ArrowUpRight, ArrowDownRight, Building2, UserCheck,
} from "lucide-react";
import { format, startOfMonth, subMonths } from "date-fns";

interface Props {
  bookings: any[];
  payments: any[];
  expenses?: any[];
  accounts?: any[];
  financialSummary?: any;
  moallemPayments?: any[];
  supplierPayments?: any[];
  commissionPayments?: any[];
  moallems?: any[];
  supplierAgents?: any[];
  onMarkPaid: (id: string) => void;
}

const C = {
  gold: "hsl(40, 65%, 48%)", emerald: "hsl(160, 50%, 40%)", red: "hsl(0, 84%, 60%)",
  muted: "hsl(220, 10%, 55%)", blue: "hsl(210, 70%, 55%)", purple: "hsl(270, 60%, 55%)",
  orange: "hsl(30, 80%, 55%)", teal: "hsl(180, 50%, 40%)",
};
const ttStyle = { backgroundColor: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 15%, 20%)", borderRadius: "8px", color: "hsl(40, 20%, 92%)", fontSize: "12px" };
const fmt = (n: number) => `৳${n.toLocaleString()}`;

// --- Small Card ---
const KCard = ({ label, value, icon: Icon, color, sub }: { label: string; value: string | number; icon: any; color: string; sub?: string }) => (
  <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
    <div className="flex items-center justify-between mb-1.5">
      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <Icon className={`h-4 w-4 ${color}`} />
    </div>
    <p className={`text-lg font-heading font-bold ${color}`}>{value}</p>
    {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

// --- Section Header ---
const SectionHead = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <h3 className="font-heading font-semibold text-sm flex items-center gap-2 mb-3">
    <Icon className="h-4 w-4 text-primary" /> {title}
  </h3>
);

const AdminDashboardCharts = ({
  bookings, payments, expenses = [], accounts = [], financialSummary,
  moallemPayments = [], supplierPayments = [], commissionPayments = [],
  moallems = [], supplierAgents = [], onMarkPaid
}: Props) => {
  const navigate = useNavigate();

  // ── Computed KPIs ──
  const totalSales = bookings.reduce((s, b) => s + Number(b.total_amount || 0), 0);
  const totalCost = bookings.reduce((s, b) => s + Number(b.total_cost || 0), 0);
  const totalExtraExpense = bookings.reduce((s, b) => s + Number(b.extra_expense || 0), 0);
  const totalCommission = bookings.reduce((s, b) => s + Number(b.total_commission || 0), 0);
  const totalBookingProfit = bookings.reduce((s, b) => s + Number(b.profit_amount || 0), 0);
  const totalHajji = bookings.reduce((s, b) => s + Number(b.num_travelers || 0), 0);
  const profitPerHajji = totalHajji > 0 ? Math.round(totalBookingProfit / totalHajji) : 0;

  const totalIncome = financialSummary ? Number(financialSummary.total_income) : payments.filter(p => p.status === "completed").reduce((s, p) => s + Number(p.amount), 0);
  const totalExpensesPaid = financialSummary ? Number(financialSummary.total_expense) : expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit = financialSummary ? Number(financialSummary.net_profit) : totalIncome - totalExpensesPaid;

  const walletAccounts = accounts.filter(a => a.type === "asset");
  const cashBank = walletAccounts.reduce((s, a) => s + Number(a.balance || 0), 0);

  // Receivable & Payable
  const moallemDue = bookings.filter(b => b.moallem_id).reduce((s, b) => s + Number(b.moallem_due || 0), 0);
  const customerDue = bookings.reduce((s, b) => s + Number(b.due_amount || 0), 0);
  const totalReceivable = moallemDue + customerDue;
  const supplierDue = bookings.reduce((s, b) => s + Number(b.supplier_due || 0), 0);
  const commissionDue = bookings.reduce((s, b) => s + Number(b.commission_due || 0), 0);
  const totalPayable = supplierDue + commissionDue;

  const activeMoallems = moallems.filter(m => m.status === "active").length;
  const activeAgents = supplierAgents.filter(a => a.status === "active").length;

  // ── Charts Data ──
  const monthlyData = useMemo(() => {
    const months: Record<string, { revenue: number; cost: number; profit: number; bookings: number }> = {};
    for (let i = 11; i >= 0; i--) {
      months[format(startOfMonth(subMonths(new Date(), i)), "MMM yy")] = { revenue: 0, cost: 0, profit: 0, bookings: 0 };
    }
    bookings.forEach(b => {
      const key = format(new Date(b.created_at), "MMM yy");
      if (months[key]) {
        months[key].revenue += Number(b.total_amount || 0);
        months[key].cost += Number(b.total_cost || 0) + Number(b.extra_expense || 0) + Number(b.total_commission || 0);
        months[key].profit += Number(b.profit_amount || 0);
        months[key].bookings += 1;
      }
    });
    return Object.entries(months).map(([month, d]) => ({ month, ...d }));
  }, [bookings]);

  const packageProfitData = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; cost: number; profit: number; count: number }> = {};
    bookings.forEach(b => {
      const n = b.packages?.name || "Unknown";
      if (!map[n]) map[n] = { name: n, revenue: 0, cost: 0, profit: 0, count: 0 };
      map[n].revenue += Number(b.total_amount || 0);
      map[n].cost += Number(b.total_cost || 0);
      map[n].profit += Number(b.profit_amount || 0);
      map[n].count += 1;
    });
    return Object.values(map).sort((a, b) => b.profit - a.profit);
  }, [bookings]);

  // Moallem performance
  const moallemPerf = useMemo(() => {
    const map: Record<string, { name: string; bookings: number; hajji: number; commission: number; due: number }> = {};
    bookings.filter(b => b.moallem_id).forEach(b => {
      const ml = moallems.find(m => m.id === b.moallem_id);
      const n = ml?.name || "Unknown";
      if (!map[b.moallem_id]) map[b.moallem_id] = { name: n, bookings: 0, hajji: 0, commission: 0, due: 0 };
      map[b.moallem_id].bookings += 1;
      map[b.moallem_id].hajji += Number(b.num_travelers || 0);
      map[b.moallem_id].commission += Number(b.total_commission || 0);
      map[b.moallem_id].due += Number(b.moallem_due || 0);
    });
    return Object.values(map).sort((a, b) => b.hajji - a.hajji).slice(0, 8);
  }, [bookings, moallems]);

  // Supplier performance
  const supplierPerf = useMemo(() => {
    const map: Record<string, { name: string; bookings: number; cost: number; paid: number; due: number }> = {};
    bookings.filter(b => b.supplier_agent_id).forEach(b => {
      const sa = supplierAgents.find(a => a.id === b.supplier_agent_id);
      const n = sa?.agent_name || "Unknown";
      if (!map[b.supplier_agent_id]) map[b.supplier_agent_id] = { name: n, bookings: 0, cost: 0, paid: 0, due: 0 };
      map[b.supplier_agent_id].bookings += 1;
      map[b.supplier_agent_id].cost += Number(b.total_cost || 0);
      map[b.supplier_agent_id].paid += Number(b.paid_to_supplier || 0);
      map[b.supplier_agent_id].due += Number(b.supplier_due || 0);
    });
    return Object.values(map).sort((a, b) => b.cost - a.cost).slice(0, 8);
  }, [bookings, supplierAgents]);

  // Recent activities
  const recentBookings = bookings.slice(0, 5);
  const recentPayments = payments.filter(p => p.status === "completed").slice(0, 5);
  const recentSupplierPay = supplierPayments.slice(0, 5);
  const recentCommPay = commissionPayments.slice(0, 5);

  // Quick actions
  const quickActions = [
    { label: "বুকিং", icon: FileText, path: "/admin/bookings?action=create", color: "text-primary" },
    { label: "পেমেন্ট", icon: CreditCard, path: "/admin/payments?action=add", color: "text-blue-500" },
    { label: "মোয়াল্লেম", icon: Users, path: "/admin/moallems?action=add", color: "text-emerald" },
    { label: "সাপ্লায়ার", icon: Building2, path: "/admin/supplier-agents?action=add", color: "text-purple-500" },
    { label: "খরচ", icon: Calculator, path: "/admin/accounting?action=add", color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* ═══ QUICK ACTIONS ═══ */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map(a => (
          <button key={a.label} onClick={() => navigate(a.path)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:border-primary/40 transition-colors">
            <Plus className={`h-3 w-3 ${a.color}`} />
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      {/* ═══ SUMMARY CARDS — Row 1: Financial ═══ */}
      <div>
        <SectionHead icon={DollarSign} title="আর্থিক সারাংশ" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KCard label="মোট বিক্রয়" value={fmt(totalSales)} icon={DollarSign} color="text-primary" />
          <KCard label="মোট খরচ" value={fmt(totalCost)} icon={TrendingDown} color="text-muted-foreground" />
          <KCard label="নিট লাভ" value={fmt(netProfit)} icon={TrendingUp} color={netProfit >= 0 ? "text-emerald" : "text-destructive"} />
          <KCard label="হাজী প্রতি লাভ" value={fmt(profitPerHajji)} icon={UserCheck} color="text-primary" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KCard label="আয় প্রাপ্ত" value={fmt(totalIncome)} icon={ArrowUpRight} color="text-emerald" />
        <KCard label="ব্যয় পরিশোধ" value={fmt(totalExpensesPaid)} icon={ArrowDownRight} color="text-destructive" />
        <KCard label="ক্যাশ/ব্যাংক ব্যালেন্স" value={fmt(cashBank)} icon={Wallet} color="text-primary" sub={walletAccounts.map(a => `${a.name}: ৳${Number(a.balance).toLocaleString()}`).join(" · ")} />
        <KCard label="কমিশন ব্যয়" value={fmt(totalCommission)} icon={Receipt} color="text-yellow-600" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KCard label="মোট বুকিং" value={bookings.length} icon={Package} color="text-foreground" />
        <KCard label="মোট হাজী" value={totalHajji} icon={Users} color="text-foreground" />
        <KCard label="সক্রিয় মোয়াল্লেম" value={activeMoallems} icon={UserCheck} color="text-primary" />
        <KCard label="সাপ্লায়ার এজেন্ট" value={activeAgents} icon={Building2} color="text-blue-500" />
      </div>

      {/* ═══ RECEIVABLE & PAYABLE ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <SectionHead icon={ArrowUpRight} title="প্রাপ্য (Receivable)" />
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">মোয়াল্লেম বকেয়া</span><span className="font-bold text-yellow-600">{fmt(moallemDue)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">কাস্টমার বকেয়া</span><span className="font-bold text-yellow-600">{fmt(customerDue)}</span></div>
            <div className="border-t border-border pt-2 flex justify-between text-sm font-bold"><span>মোট প্রাপ্য</span><span className="text-primary">{fmt(totalReceivable)}</span></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <SectionHead icon={ArrowDownRight} title="প্রদেয় (Payable)" />
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">সাপ্লায়ার বকেয়া</span><span className="font-bold text-destructive">{fmt(supplierDue)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">কমিশন বকেয়া</span><span className="font-bold text-destructive">{fmt(commissionDue)}</span></div>
            <div className="border-t border-border pt-2 flex justify-between text-sm font-bold"><span>মোট প্রদেয়</span><span className="text-destructive">{fmt(totalPayable)}</span></div>
          </div>
        </div>
      </div>

      {/* ═══ CHARTS ═══ */}
      {/* Monthly Profit */}
      <div className="bg-card border border-border rounded-xl p-5">
        <SectionHead icon={TrendingUp} title="মাসিক লাভ" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={ttStyle} formatter={(v: number) => fmt(v)} />
              <Bar dataKey="profit" fill={C.gold} radius={[4, 4, 0, 0]} name="লাভ" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue vs Cost */}
      <div className="bg-card border border-border rounded-xl p-5">
        <SectionHead icon={DollarSign} title="বিক্রয় vs খরচ" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={ttStyle} formatter={(v: number) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="revenue" stroke={C.emerald} fill={C.emerald} fillOpacity={0.15} name="বিক্রয়" />
              <Area type="monotone" dataKey="cost" stroke={C.red} fill={C.red} fillOpacity={0.15} name="খরচ" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trend */}
        <div className="bg-card border border-border rounded-xl p-5">
          <SectionHead icon={Calendar} title="বুকিং ট্রেন্ড" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={ttStyle} />
                <Line type="monotone" dataKey="bookings" stroke={C.blue} strokeWidth={2} dot={{ fill: C.blue, r: 3 }} name="বুকিং" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit per Package */}
        <div className="bg-card border border-border rounded-xl p-5">
          <SectionHead icon={Package} title="প্যাকেজ অনুযায়ী লাভ" />
          {packageProfitData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={packageProfitData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={ttStyle} formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="revenue" fill={C.emerald} radius={[0, 4, 4, 0]} name="বিক্রয়" />
                  <Bar dataKey="profit" fill={C.gold} radius={[0, 4, 4, 0]} name="লাভ" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-12">কোনো ডেটা নেই</p>}
        </div>
      </div>

      {/* ═══ PERFORMANCE ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Moallem Performance */}
        <div className="bg-card border border-border rounded-xl p-5">
          <SectionHead icon={Users} title="মোয়াল্লেম পারফরম্যান্স" />
          {moallemPerf.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moallemPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: C.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={ttStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="hajji" fill={C.blue} radius={[4, 4, 0, 0]} name="হাজী" />
                  <Bar dataKey="bookings" fill={C.gold} radius={[4, 4, 0, 0]} name="বুকিং" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-12">কোনো ডেটা নেই</p>}
        </div>

        {/* Supplier Performance */}
        <div className="bg-card border border-border rounded-xl p-5">
          <SectionHead icon={Building2} title="সাপ্লায়ার পারফরম্যান্স" />
          {supplierPerf.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: C.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={ttStyle} formatter={(v: number) => fmt(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="cost" fill={C.orange} radius={[4, 4, 0, 0]} name="খরচ" />
                  <Bar dataKey="paid" fill={C.emerald} radius={[4, 4, 0, 0]} name="পরিশোধ" />
                  <Bar dataKey="due" fill={C.red} radius={[4, 4, 0, 0]} name="বকেয়া" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-12">কোনো ডেটা নেই</p>}
        </div>
      </div>

      {/* ═══ RECENT ACTIVITIES ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <SectionHead icon={FileText} title="সাম্প্রতিক বুকিং" />
            <button onClick={() => navigate("/admin/bookings")} className="text-xs text-primary hover:underline">সব দেখুন</button>
          </div>
          {recentBookings.length > 0 ? (
            <div className="space-y-2">
              {recentBookings.map(b => (
                <div key={b.id} className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">{b.guest_name || "N/A"}</p>
                    <p className="text-[10px] text-muted-foreground">{b.tracking_id} · {b.packages?.name || ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{fmt(Number(b.total_amount))}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${b.status === "completed" ? "bg-emerald/10 text-emerald" : "bg-primary/10 text-primary"}`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-8">কোনো বুকিং নেই</p>}
        </div>

        {/* Recent Payments */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <SectionHead icon={CreditCard} title="সাম্প্রতিক পেমেন্ট" />
            <button onClick={() => navigate("/admin/payments")} className="text-xs text-primary hover:underline">সব দেখুন</button>
          </div>
          {recentPayments.length > 0 ? (
            <div className="space-y-2">
              {recentPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">{p.bookings?.tracking_id || p.booking_id?.slice(0, 8)}</p>
                    <p className="text-[10px] text-muted-foreground">#{p.installment_number || "—"} · {p.payment_method || "manual"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald">{fmt(Number(p.amount))}</p>
                    <p className="text-[10px] text-muted-foreground">{p.paid_at ? format(new Date(p.paid_at), "dd MMM yy") : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-8">কোনো পেমেন্ট নেই</p>}
        </div>

        {/* Recent Supplier Payments */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <SectionHead icon={Building2} title="সাম্প্রতিক সাপ্লায়ার পেমেন্ট" />
            <button onClick={() => navigate("/admin/supplier-agents")} className="text-xs text-primary hover:underline">সব দেখুন</button>
          </div>
          {recentSupplierPay.length > 0 ? (
            <div className="space-y-2">
              {recentSupplierPay.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">{(p as any).supplier_agents?.agent_name || "N/A"}</p>
                    <p className="text-[10px] text-muted-foreground">{p.payment_method || "cash"} · {format(new Date(p.date), "dd MMM yy")}</p>
                  </div>
                  <p className="text-sm font-bold text-destructive">{fmt(Number(p.amount))}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-8">কোনো পেমেন্ট নেই</p>}
        </div>

        {/* Recent Commission Payments */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <SectionHead icon={Receipt} title="সাম্প্রতিক কমিশন পেমেন্ট" />
            <button onClick={() => navigate("/admin/moallems")} className="text-xs text-primary hover:underline">সব দেখুন</button>
          </div>
          {recentCommPay.length > 0 ? (
            <div className="space-y-2">
              {recentCommPay.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">{(p as any).moallems?.name || "N/A"}</p>
                    <p className="text-[10px] text-muted-foreground">{p.payment_method || "cash"} · {format(new Date(p.date), "dd MMM yy")}</p>
                  </div>
                  <p className="text-sm font-bold text-yellow-600">{fmt(Number(p.amount))}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-8">কোনো কমিশন পেমেন্ট নেই</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardCharts;
