import { useEffect, useMemo, useState, Fragment } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, FileDown, FileSpreadsheet, ChevronDown, ChevronUp, Users, TrendingUp, TrendingDown, DollarSign, Filter } from "lucide-react";
import { format, parseISO, isSameDay, isSameMonth, isSameYear, differenceInDays, startOfMonth, endOfMonth, getYear, getMonth, isWithinInterval, eachDayOfInterval, eachMonthOfInterval, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { exportPDF, exportExcel } from "@/lib/reportExport";

const fmt = (n: number) => `৳${n.toLocaleString()}`;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function AdminReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [expenseTransactions, setExpenseTransactions] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState("daily-financial");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState(String(getYear(new Date())));
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(subMonths(new Date(), 0)));
  const [dateTo, setDateTo] = useState<Date>(new Date());

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("*, packages(name, type)").order("created_at", { ascending: false }),
      supabase.from("payments").select("*, bookings(tracking_id)").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("profiles").select("*"),
      supabase.from("transactions").select("*").eq("type", "expense"),
    ]).then(([bk, py, ex, pr, tx]) => {
      setBookings(bk.data || []);
      setPayments(py.data || []);
      setExpenses(ex.data || []);
      setProfiles(pr.data || []);
      setExpenseTransactions(tx.data || []);
    });
  }, []);

  const profileMap = useMemo(() => {
    const m: Record<string, any> = {};
    profiles.forEach((p) => { m[p.user_id] = p; });
    return m;
  }, [profiles]);

  const years = useMemo(() => {
    const s = new Set<number>();
    bookings.forEach((b) => s.add(getYear(parseISO(b.created_at))));
    payments.forEach((p) => s.add(getYear(parseISO(p.created_at))));
    if (s.size === 0) s.add(getYear(new Date()));
    return Array.from(s).sort((a, b) => b - a);
  }, [bookings, payments]);

  // ── Daily Financial Report (date range) ──
  const dailyFinancialRows = useMemo(() => {
    const days = eachDayOfInterval({ start: dateFrom, end: dateTo });
    return days.map((day) => {
      const income = payments
        .filter((p) => p.status === "completed" && p.paid_at && isSameDay(parseISO(p.paid_at), day))
        .reduce((s: number, p: any) => s + Number(p.amount), 0);
      const expense = expenses
        .filter((e) => isSameDay(parseISO(e.date), day))
        .reduce((s: number, e: any) => s + Number(e.amount), 0);
      const bookingCount = bookings.filter((b) => isSameDay(parseISO(b.created_at), day)).length;
      return { date: format(day, "dd MMM yyyy"), income, expense, profit: income - expense, bookings: bookingCount };
    }).reverse();
  }, [payments, expenses, bookings, dateFrom, dateTo]);

  // ── Monthly Financial Report ──
  const monthlyFinancialRows = useMemo(() => {
    const yr = Number(selectedYear);
    return Array.from({ length: 12 }, (_, i) => {
      const income = payments
        .filter((p) => p.status === "completed" && p.paid_at && getYear(parseISO(p.paid_at)) === yr && getMonth(parseISO(p.paid_at)) === i)
        .reduce((s: number, p: any) => s + Number(p.amount), 0);
      const expense = expenses
        .filter((e) => getYear(parseISO(e.date)) === yr && getMonth(parseISO(e.date)) === i)
        .reduce((s: number, e: any) => s + Number(e.amount), 0);
      const bookingCount = bookings.filter((b) => getYear(parseISO(b.created_at)) === yr && getMonth(parseISO(b.created_at)) === i).length;
      return { month: MONTHS[i], income, expense, profit: income - expense, bookings: bookingCount };
    });
  }, [payments, expenses, bookings, selectedYear]);

  // ── Yearly Summary ──
  const yearlyRows = useMemo(() => {
    const map: Record<number, { income: number; expense: number; bookings: number }> = {};
    years.forEach((y) => { map[y] = { income: 0, expense: 0, bookings: 0 }; });
    payments.filter((p) => p.status === "completed" && p.paid_at).forEach((p) => {
      const y = getYear(parseISO(p.paid_at));
      if (map[y]) map[y].income += Number(p.amount);
    });
    expenses.forEach((e) => {
      const y = getYear(parseISO(e.date));
      if (map[y]) map[y].expense += Number(e.amount);
    });
    bookings.forEach((b) => {
      const y = getYear(parseISO(b.created_at));
      if (map[y]) map[y].bookings++;
    });
    return Object.entries(map).map(([y, d]) => ({ year: y, ...d, profit: d.income - d.expense })).sort((a, b) => Number(b.year) - Number(a.year));
  }, [bookings, payments, expenses, years]);

  // ── Profit & Loss ──
  const pnlData = useMemo(() => {
    const yr = Number(selectedYear);
    const completedPayments = payments.filter((p) => p.status === "completed" && p.paid_at && getYear(parseISO(p.paid_at)) === yr);
    const yearExpenses = expenses.filter((e) => getYear(parseISO(e.date)) === yr);
    const incomeByType: Record<string, number> = {};
    completedPayments.forEach((p) => {
      const bk = bookings.find((b) => b.id === p.booking_id);
      const cat = bk?.packages?.type ? `${bk.packages.type.charAt(0).toUpperCase() + bk.packages.type.slice(1)} Package` : "Other Income";
      incomeByType[cat] = (incomeByType[cat] || 0) + Number(p.amount);
    });
    const expenseByType: Record<string, number> = {};
    yearExpenses.forEach((e) => {
      const label = (e.expense_type || "other").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      expenseByType[label] = (expenseByType[label] || 0) + Number(e.amount);
    });
    const totalIncome = Object.values(incomeByType).reduce((s, v) => s + v, 0);
    const totalExpense = Object.values(expenseByType).reduce((s, v) => s + v, 0);
    const grossProfit = totalIncome;
    const netProfit = totalIncome - totalExpense;
    return { incomeByType, expenseByType, totalIncome, totalExpense, grossProfit, netProfit };
  }, [payments, expenses, bookings, selectedYear]);

  // ── Legacy tabs ──
  const packageRows = useMemo(() => {
    const map: Record<string, { name: string; type: string; count: number; revenue: number; expenses: number }> = {};
    bookings.forEach((b) => {
      const key = b.package_id;
      if (!map[key]) map[key] = { name: b.packages?.name || "-", type: b.packages?.type || "-", count: 0, revenue: 0, expenses: 0 };
      map[key].count++;
    });
    payments.filter((p) => p.status === "completed").forEach((p) => {
      const bk = bookings.find((b) => b.id === p.booking_id);
      if (bk && map[bk.package_id]) map[bk.package_id].revenue += Number(p.amount);
    });
    expenseTransactions.forEach((t) => {
      if (t.booking_id) {
        const bk = bookings.find((b) => b.id === t.booking_id);
        if (bk && map[bk.package_id]) map[bk.package_id].expenses += Number(t.amount);
      }
    });
    return Object.values(map).map((d) => ({ ...d, profit: d.revenue - d.expenses }));
  }, [bookings, payments, expenseTransactions]);

  const hajjiRows = useMemo(() => {
    const map: Record<string, { name: string; phone: string; passport: string; count: number; travelers: number; revenue: number; due: number; expenses: number; bookingDetails: any[] }> = {};
    bookings.forEach((b) => {
      const uid = b.user_id;
      const profile = profileMap[uid];
      if (!map[uid]) map[uid] = { name: profile?.full_name || "Unknown", phone: profile?.phone || "-", passport: profile?.passport_number || "-", count: 0, travelers: 0, revenue: 0, due: 0, expenses: 0, bookingDetails: [] };
      map[uid].count++;
      map[uid].travelers += Number(b.num_travelers || 1);
      map[uid].bookingDetails.push({ trackingId: b.tracking_id, packageName: b.packages?.name || "-", total: Number(b.total_amount), paid: Number(b.paid_amount), due: Number(b.due_amount ?? b.total_amount - b.paid_amount), status: b.status, date: format(parseISO(b.created_at), "dd MMM yyyy") });
    });
    payments.forEach((p) => { if (p.status === "completed" && map[p.user_id]) map[p.user_id].revenue += Number(p.amount); if (p.status === "pending" && map[p.user_id]) map[p.user_id].due += Number(p.amount); });
    expenseTransactions.forEach((t) => { if (t.booking_id) { const bk = bookings.find((b) => b.id === t.booking_id); if (bk && map[bk.user_id]) map[bk.user_id].expenses += Number(t.amount); } });
    return Object.values(map).map((d) => ({ ...d, profit: d.revenue - d.expenses }));
  }, [bookings, payments, expenseTransactions, profileMap]);

  const dueRows = useMemo(() => payments.filter((p) => p.status === "pending").map((p) => {
    const profile = profileMap[p.user_id];
    return { trackingId: p.bookings?.tracking_id || "-", customer: profile?.full_name || "Unknown", installment: p.installment_number ?? "-", amount: Number(p.amount), dueDate: p.due_date ? format(parseISO(p.due_date), "dd MMM yyyy") : "-" };
  }), [payments, profileMap]);

  const overdueRows = useMemo(() => {
    const today = new Date();
    return payments.filter((p) => p.status === "pending" && p.due_date && parseISO(p.due_date) < today).map((p) => {
      const profile = profileMap[p.user_id];
      return { trackingId: p.bookings?.tracking_id || "-", customer: profile?.full_name || "Unknown", installment: p.installment_number ?? "-", amount: Number(p.amount), dueDate: p.due_date ? format(parseISO(p.due_date), "dd MMM yyyy") : "-", daysOverdue: differenceInDays(today, parseISO(p.due_date)) };
    });
  }, [payments, profileMap]);

  // ── Export ──
  const getExportData = () => {
    switch (activeTab) {
      case "daily-financial":
        return { title: `Daily Financial Report ${format(dateFrom, "dd MMM")} - ${format(dateTo, "dd MMM yyyy")}`, columns: ["Date", "Income", "Expenses", "Profit", "Bookings"], rows: dailyFinancialRows.map((r) => [r.date, r.income, r.expense, r.profit, r.bookings]) };
      case "monthly-financial":
        return { title: `Monthly Financial Report - ${selectedYear}`, columns: ["Month", "Income", "Expenses", "Profit", "Bookings"], rows: monthlyFinancialRows.map((r) => [r.month, r.income, r.expense, r.profit, r.bookings]) };
      case "yearly":
        return { title: "Yearly Financial Summary", columns: ["Year", "Income", "Expenses", "Profit", "Bookings"], rows: yearlyRows.map((r) => [r.year, r.income, r.expense, r.profit, r.bookings]) };
      case "package":
        return { title: "Package-wise Revenue", columns: ["Package","Type","Bookings","Revenue","Expenses","Profit"], rows: packageRows.map((r) => [r.name, r.type, r.count, r.revenue, r.expenses, r.profit]) };
      case "hajji":
        return { title: "Hajji-wise Revenue", columns: ["Customer","Phone","Passport","Bookings","Travelers","Revenue","Due","Expenses","Profit"], rows: hajjiRows.map((r) => [r.name, r.phone, r.passport, r.count, r.travelers, r.revenue, r.due, r.expenses, r.profit]) };
      case "due":
        return { title: "Due Report", columns: ["Tracking ID","Customer","Installment","Amount","Due Date"], rows: dueRows.map((r) => [r.trackingId, r.customer, r.installment, r.amount, r.dueDate]) };
      case "overdue":
        return { title: "Overdue Report", columns: ["Tracking ID","Customer","Installment","Amount","Due Date","Days Overdue"], rows: overdueRows.map((r) => [r.trackingId, r.customer, r.installment, r.amount, r.dueDate, r.daysOverdue]) };
      case "pnl": {
        const incRows = Object.entries(pnlData.incomeByType).map(([k, v]) => [k, v]);
        const expRows = Object.entries(pnlData.expenseByType).map(([k, v]) => [k, v]);
        return { title: `Profit & Loss Statement - ${selectedYear}`, columns: ["Category", "Amount (BDT)"], rows: [
          ["── INCOME ──", ""], ...incRows, ["Total Income", pnlData.totalIncome],
          ["", ""], ["── EXPENSES ──", ""], ...expRows, ["Total Expenses", pnlData.totalExpense],
          ["", ""], ["Gross Profit", pnlData.grossProfit], ["Net Profit", pnlData.netProfit],
        ] };
      }
      default:
        return { title: "Report", columns: [], rows: [] };
    }
  };

  // ── Summary cards ──
  const summaryCards = useMemo(() => {
    switch (activeTab) {
      case "daily-financial": {
        const t = dailyFinancialRows.reduce((a, r) => ({ i: a.i + r.income, e: a.e + r.expense, b: a.b + r.bookings }), { i: 0, e: 0, b: 0 });
        return [
          { label: "Total Income", value: fmt(t.i), icon: TrendingUp, color: "text-primary" },
          { label: "Total Expenses", value: fmt(t.e), icon: TrendingDown, color: "text-destructive" },
          { label: "Net Profit", value: fmt(t.i - t.e), icon: DollarSign, color: t.i - t.e >= 0 ? "text-primary" : "text-destructive" },
          { label: "Total Bookings", value: t.b, icon: CalendarIcon, color: "text-foreground" },
        ];
      }
      case "monthly-financial": {
        const t = monthlyFinancialRows.reduce((a, r) => ({ i: a.i + r.income, e: a.e + r.expense, b: a.b + r.bookings }), { i: 0, e: 0, b: 0 });
        return [
          { label: "Total Income", value: fmt(t.i), icon: TrendingUp, color: "text-primary" },
          { label: "Total Expenses", value: fmt(t.e), icon: TrendingDown, color: "text-destructive" },
          { label: "Net Profit", value: fmt(t.i - t.e), icon: DollarSign, color: t.i - t.e >= 0 ? "text-primary" : "text-destructive" },
          { label: "Total Bookings", value: t.b, icon: CalendarIcon, color: "text-foreground" },
        ];
      }
      case "yearly": {
        const t = yearlyRows.reduce((a, r) => ({ i: a.i + r.income, e: a.e + r.expense, b: a.b + r.bookings }), { i: 0, e: 0, b: 0 });
        return [
          { label: "Total Income", value: fmt(t.i), icon: TrendingUp, color: "text-primary" },
          { label: "Total Expenses", value: fmt(t.e), icon: TrendingDown, color: "text-destructive" },
          { label: "Net Profit", value: fmt(t.i - t.e), icon: DollarSign, color: t.i - t.e >= 0 ? "text-primary" : "text-destructive" },
          { label: "Total Bookings", value: t.b, icon: CalendarIcon, color: "text-foreground" },
        ];
      }
      case "package": {
        const t = packageRows.reduce((a, r) => ({ rev: a.rev + r.revenue, exp: a.exp + r.expenses }), { rev: 0, exp: 0 });
        return [
          { label: "Packages", value: packageRows.length, icon: CalendarIcon, color: "text-foreground" },
          { label: "Revenue", value: fmt(t.rev), icon: TrendingUp, color: "text-primary" },
          { label: "Expenses", value: fmt(t.exp), icon: TrendingDown, color: "text-destructive" },
          { label: "Profit", value: fmt(t.rev - t.exp), icon: DollarSign, color: t.rev - t.exp >= 0 ? "text-primary" : "text-destructive" },
        ];
      }
      case "hajji": {
        const t = hajjiRows.reduce((a, r) => ({ rev: a.rev + r.revenue, due: a.due + r.due, travelers: a.travelers + r.travelers }), { rev: 0, due: 0, travelers: 0 });
        return [
          { label: "Customers", value: hajjiRows.length, icon: Users, color: "text-foreground" },
          { label: "Travelers", value: t.travelers, icon: Users, color: "text-foreground" },
          { label: "Revenue", value: fmt(t.rev), icon: TrendingUp, color: "text-primary" },
          { label: "Due", value: fmt(t.due), icon: TrendingDown, color: "text-destructive" },
        ];
      }
      case "due":
        return [
          { label: "Pending", value: dueRows.length, icon: CalendarIcon, color: "text-foreground" },
          { label: "Total Due", value: fmt(dueRows.reduce((s, r) => s + r.amount, 0)), icon: TrendingDown, color: "text-destructive" },
        ];
      case "overdue":
        return [
          { label: "Overdue", value: overdueRows.length, icon: CalendarIcon, color: "text-destructive" },
          { label: "Total Overdue", value: fmt(overdueRows.reduce((s, r) => s + r.amount, 0)), icon: TrendingDown, color: "text-destructive" },
        ];
      case "pnl": {
        return [
          { label: "Total Income", value: fmt(pnlData.totalIncome), icon: TrendingUp, color: "text-primary" },
          { label: "Total Expenses", value: fmt(pnlData.totalExpense), icon: TrendingDown, color: "text-destructive" },
          { label: "Gross Profit", value: fmt(pnlData.grossProfit), icon: DollarSign, color: pnlData.grossProfit >= 0 ? "text-primary" : "text-destructive" },
          { label: "Net Profit", value: fmt(pnlData.netProfit), icon: DollarSign, color: pnlData.netProfit >= 0 ? "text-primary" : "text-destructive" },
        ];
      }
      default: return [];
    }
  }, [activeTab, dailyFinancialRows, monthlyFinancialRows, yearlyRows, packageRows, hajjiRows, dueRows, overdueRows]);

  const showDateRange = activeTab === "daily-financial";
  const showYearSelect = activeTab === "monthly-financial" || activeTab === "pnl";

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="font-heading text-xl font-bold">Financial Reports</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportPDF(getExportData())}><FileDown className="h-4 w-4 mr-1" /> PDF</Button>
          <Button size="sm" variant="outline" onClick={() => exportExcel(getExportData())}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="daily-financial">Daily Income/Expense</TabsTrigger>
          <TabsTrigger value="monthly-financial">Monthly Income/Expense</TabsTrigger>
          <TabsTrigger value="yearly">Yearly Summary</TabsTrigger>
          <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="package">Package-wise</TabsTrigger>
          <TabsTrigger value="hajji">Hajji-wise</TabsTrigger>
          <TabsTrigger value="due">Due</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex items-center gap-3 py-3 flex-wrap">
          {showDateRange && (
            <>
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">From:</span>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[160px] justify-start text-left font-normal">
                    <CalendarIcon className="h-4 w-4 mr-2" />{format(dateFrom, "dd MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={(d) => d && setDateFrom(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <span className="text-xs text-muted-foreground">To:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[160px] justify-start text-left font-normal">
                    <CalendarIcon className="h-4 w-4 mr-2" />{format(dateTo, "dd MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={(d) => d && setDateTo(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => { setDateFrom(new Date()); setDateTo(new Date()); }}>Today</Button>
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => { setDateFrom(startOfMonth(new Date())); setDateTo(new Date()); }}>This Month</Button>
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => { setDateFrom(startOfMonth(subMonths(new Date(), 2))); setDateTo(new Date()); }}>Last 3 Months</Button>
              </div>
            </>
          )}
          {showYearSelect && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {summaryCards.map((c) => (
            <Card key={c.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <c.icon className={cn("h-4 w-4", c.color)} />
                </div>
                <p className={cn("text-lg font-heading font-bold", c.color)}>{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Financial */}
        <TabsContent value="daily-financial">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {dailyFinancialRows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No data for selected range</TableCell></TableRow>}
              {dailyFinancialRows.filter((r) => r.income > 0 || r.expense > 0 || r.bookings > 0).map((r) => (
                <TableRow key={r.date}>
                  <TableCell className="font-medium">{r.date}</TableCell>
                  <TableCell className="text-right text-primary">{fmt(r.income)}</TableCell>
                  <TableCell className="text-right text-destructive">{fmt(r.expense)}</TableCell>
                  <TableCell className={cn("text-right font-bold", r.profit >= 0 ? "text-primary" : "text-destructive")}>{fmt(r.profit)}</TableCell>
                  <TableCell className="text-right">{r.bookings}</TableCell>
                </TableRow>
              ))}
              {dailyFinancialRows.filter((r) => r.income > 0 || r.expense > 0 || r.bookings > 0).length > 0 && (
                <TableRow className="bg-muted/40 font-bold border-t-2 border-border">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right text-primary">{fmt(dailyFinancialRows.reduce((s, r) => s + r.income, 0))}</TableCell>
                  <TableCell className="text-right text-destructive">{fmt(dailyFinancialRows.reduce((s, r) => s + r.expense, 0))}</TableCell>
                  <TableCell className={cn("text-right", dailyFinancialRows.reduce((s, r) => s + r.profit, 0) >= 0 ? "text-primary" : "text-destructive")}>{fmt(dailyFinancialRows.reduce((s, r) => s + r.profit, 0))}</TableCell>
                  <TableCell className="text-right">{dailyFinancialRows.reduce((s, r) => s + r.bookings, 0)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Monthly Financial */}
        <TabsContent value="monthly-financial">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {monthlyFinancialRows.map((r) => (
                <TableRow key={r.month}>
                  <TableCell>{r.month}</TableCell>
                  <TableCell className="text-right text-primary">{fmt(r.income)}</TableCell>
                  <TableCell className="text-right text-destructive">{fmt(r.expense)}</TableCell>
                  <TableCell className={cn("text-right font-bold", r.profit >= 0 ? "text-primary" : "text-destructive")}>{fmt(r.profit)}</TableCell>
                  <TableCell className="text-right">{r.bookings}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/40 font-bold border-t-2 border-border">
                <TableCell>Total</TableCell>
                <TableCell className="text-right text-primary">{fmt(monthlyFinancialRows.reduce((s, r) => s + r.income, 0))}</TableCell>
                <TableCell className="text-right text-destructive">{fmt(monthlyFinancialRows.reduce((s, r) => s + r.expense, 0))}</TableCell>
                <TableCell className={cn("text-right", monthlyFinancialRows.reduce((s, r) => s + r.profit, 0) >= 0 ? "text-primary" : "text-destructive")}>{fmt(monthlyFinancialRows.reduce((s, r) => s + r.profit, 0))}</TableCell>
                <TableCell className="text-right">{monthlyFinancialRows.reduce((s, r) => s + r.bookings, 0)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>

        {/* Yearly */}
        <TabsContent value="yearly">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {yearlyRows.map((r) => (
                <TableRow key={r.year}>
                  <TableCell className="font-medium">{r.year}</TableCell>
                  <TableCell className="text-right text-primary">{fmt(r.income)}</TableCell>
                  <TableCell className="text-right text-destructive">{fmt(r.expense)}</TableCell>
                  <TableCell className={cn("text-right font-bold", r.profit >= 0 ? "text-primary" : "text-destructive")}>{fmt(r.profit)}</TableCell>
                  <TableCell className="text-right">{r.bookings}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Profit & Loss */}
        <TabsContent value="pnl">
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="text-center mb-4">
              <h3 className="font-heading text-lg font-bold">Profit & Loss Statement</h3>
              <p className="text-sm text-muted-foreground">For the year {selectedYear}</p>
            </div>

            {/* Income Section */}
            <div>
              <h4 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 border-b border-border pb-2">Income</h4>
              <div className="space-y-2">
                {Object.entries(pnlData.incomeByType).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center px-2">
                    <span className="text-sm">{cat}</span>
                    <span className="text-sm font-medium text-primary">{fmt(amount)}</span>
                  </div>
                ))}
                {Object.keys(pnlData.incomeByType).length === 0 && <p className="text-sm text-muted-foreground px-2">No income recorded</p>}
              </div>
              <div className="flex justify-between items-center px-2 mt-3 pt-2 border-t border-border font-bold">
                <span>Total Income</span>
                <span className="text-primary">{fmt(pnlData.totalIncome)}</span>
              </div>
            </div>

            {/* Expense Section */}
            <div>
              <h4 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 border-b border-border pb-2">Expenses</h4>
              <div className="space-y-2">
                {Object.entries(pnlData.expenseByType).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center px-2">
                    <span className="text-sm">{cat}</span>
                    <span className="text-sm font-medium text-destructive">{fmt(amount)}</span>
                  </div>
                ))}
                {Object.keys(pnlData.expenseByType).length === 0 && <p className="text-sm text-muted-foreground px-2">No expenses recorded</p>}
              </div>
              <div className="flex justify-between items-center px-2 mt-3 pt-2 border-t border-border font-bold">
                <span>Total Expenses</span>
                <span className="text-destructive">{fmt(pnlData.totalExpense)}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="border-t-2 border-border pt-4 space-y-3">
              <div className="flex justify-between items-center px-2">
                <span className="font-semibold">Gross Profit</span>
                <span className={cn("font-bold text-lg", pnlData.grossProfit >= 0 ? "text-primary" : "text-destructive")}>{fmt(pnlData.grossProfit)}</span>
              </div>
              <div className="flex justify-between items-center px-2 bg-muted/40 rounded-lg py-3">
                <span className="font-heading font-bold text-lg">Net Profit</span>
                <span className={cn("font-heading font-bold text-xl", pnlData.netProfit >= 0 ? "text-primary" : "text-destructive")}>{fmt(pnlData.netProfit)}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Package-wise */}
        <TabsContent value="package">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Package</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Bookings</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Expenses</TableHead><TableHead className="text-right">Profit</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {packageRows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No data</TableCell></TableRow>}
              {packageRows.map((r, i) => (
                <TableRow key={i}><TableCell>{r.name}</TableCell><TableCell className="capitalize">{r.type}</TableCell><TableCell className="text-right">{r.count}</TableCell><TableCell className="text-right">{fmt(r.revenue)}</TableCell><TableCell className="text-right">{fmt(r.expenses)}</TableCell><TableCell className={cn("text-right font-bold", r.profit >= 0 ? "text-primary" : "text-destructive")}>{fmt(r.profit)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="hajji"><HajjiReportTable rows={hajjiRows} fmt={fmt} /></TabsContent>

        {/* Due */}
        <TabsContent value="due">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Tracking ID</TableHead><TableHead>Customer</TableHead><TableHead className="text-right">Installment</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Due Date</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {dueRows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No pending payments</TableCell></TableRow>}
              {dueRows.map((r, i) => (
                <TableRow key={i}><TableCell className="font-mono text-xs">{r.trackingId}</TableCell><TableCell>{r.customer}</TableCell><TableCell className="text-right">{r.installment}</TableCell><TableCell className="text-right">{fmt(r.amount)}</TableCell><TableCell>{r.dueDate}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Overdue */}
        <TabsContent value="overdue">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Tracking ID</TableHead><TableHead>Customer</TableHead><TableHead className="text-right">Installment</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Due Date</TableHead><TableHead className="text-right">Days Overdue</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {overdueRows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No overdue payments</TableCell></TableRow>}
              {overdueRows.map((r, i) => (
                <TableRow key={i}><TableCell className="font-mono text-xs">{r.trackingId}</TableCell><TableCell>{r.customer}</TableCell><TableCell className="text-right">{r.installment}</TableCell><TableCell className="text-right">{fmt(r.amount)}</TableCell><TableCell>{r.dueDate}</TableCell><TableCell className="text-right text-destructive font-bold">{r.daysOverdue}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Hajji Report Expandable Table ──
function HajjiReportTable({ rows, fmt }: { rows: any[]; fmt: (n: number) => string }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const totals = rows.reduce((a, r) => ({ bookings: a.bookings + r.count, travelers: a.travelers + r.travelers, revenue: a.revenue + r.revenue, due: a.due + r.due, expenses: a.expenses + r.expenses, profit: a.profit + r.profit }), { bookings: 0, travelers: 0, revenue: 0, due: 0, expenses: 0, profit: 0 });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8"></TableHead><TableHead>Customer</TableHead><TableHead>Phone</TableHead><TableHead>Passport</TableHead>
          <TableHead className="text-right">Bookings</TableHead><TableHead className="text-right">Travelers</TableHead><TableHead className="text-right">Revenue</TableHead>
          <TableHead className="text-right">Due</TableHead><TableHead className="text-right">Expenses</TableHead><TableHead className="text-right">Profit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">No data</TableCell></TableRow>}
        {rows.map((r, i) => (
          <Fragment key={i}>
            <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setExpanded(expanded === i ? null : i)}>
              <TableCell className="px-2">{expanded === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}</TableCell>
              <TableCell className="font-medium"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Users className="h-3.5 w-3.5 text-primary" /></div>{r.name}</div></TableCell>
              <TableCell>{r.phone}</TableCell><TableCell className="text-xs">{r.passport}</TableCell>
              <TableCell className="text-right">{r.count}</TableCell><TableCell className="text-right">{r.travelers}</TableCell>
              <TableCell className="text-right">{fmt(r.revenue)}</TableCell><TableCell className="text-right text-destructive">{fmt(r.due)}</TableCell>
              <TableCell className="text-right">{fmt(r.expenses)}</TableCell><TableCell className={cn("text-right font-bold", r.profit >= 0 ? "text-primary" : "text-destructive")}>{fmt(r.profit)}</TableCell>
            </TableRow>
            {expanded === i && (
              <TableRow>
                <TableCell colSpan={10} className="bg-muted/20 p-0">
                  <div className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Booking Details for {r.name}</p>
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-muted-foreground border-b border-border/50">
                        <th className="pb-2 pr-3">Tracking ID</th><th className="pb-2 pr-3">Package</th><th className="pb-2 pr-3">Date</th>
                        <th className="pb-2 pr-3 text-right">Total</th><th className="pb-2 pr-3 text-right">Paid</th><th className="pb-2 pr-3 text-right">Due</th><th className="pb-2">Status</th>
                      </tr></thead>
                      <tbody>
                        {r.bookingDetails.map((bd: any, j: number) => (
                          <tr key={j} className="border-b border-border/30">
                            <td className="py-2 pr-3 font-mono text-xs text-primary">{bd.trackingId}</td>
                            <td className="py-2 pr-3">{bd.packageName}</td>
                            <td className="py-2 pr-3 text-muted-foreground">{bd.date}</td>
                            <td className="py-2 pr-3 text-right">{fmt(bd.total)}</td>
                            <td className="py-2 pr-3 text-right text-primary">{fmt(bd.paid)}</td>
                            <td className="py-2 pr-3 text-right text-destructive">{fmt(bd.due)}</td>
                            <td className="py-2 capitalize"><span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", bd.status === "completed" ? "bg-primary/10 text-primary" : bd.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}>{bd.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </Fragment>
        ))}
        {rows.length > 0 && (
          <TableRow className="bg-muted/40 font-bold border-t-2 border-border">
            <TableCell></TableCell><TableCell>Total</TableCell><TableCell></TableCell><TableCell></TableCell>
            <TableCell className="text-right">{totals.bookings}</TableCell><TableCell className="text-right">{totals.travelers}</TableCell>
            <TableCell className="text-right">{fmt(totals.revenue)}</TableCell><TableCell className="text-right text-destructive">{fmt(totals.due)}</TableCell>
            <TableCell className="text-right">{fmt(totals.expenses)}</TableCell><TableCell className={cn("text-right", totals.profit >= 0 ? "text-primary" : "text-destructive")}>{fmt(totals.profit)}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
