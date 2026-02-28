import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X, Edit2, Trash2, Save, Filter } from "lucide-react";
import { useIsViewer } from "@/components/admin/AdminLayout";

const inputClass = "w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

const EXPENSE_TYPES = [
  { value: "visa", label: "Visa Cost" },
  { value: "ticket", label: "Ticket Cost" },
  { value: "hotel", label: "Hotel Cost" },
  { value: "transport", label: "Transport Cost" },
  { value: "food", label: "Food Cost" },
  { value: "guide", label: "Guide Cost" },
  { value: "office", label: "Office Expense" },
  { value: "other", label: "Other" },
];

const ASSIGN_TO = [
  { value: "booking", label: "Booking" },
  { value: "customer", label: "Customer" },
  { value: "package", label: "Package" },
  { value: "general", label: "General Business" },
];

const EMPTY_FORM = {
  title: "", amount: "", expense_type: "visa", category: "general",
  note: "", date: "", booking_id: "", customer_id: "", package_id: "",
};

export default function AdminAccountingPage() {
  const isViewer = useIsViewer();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [filterAssign, setFilterAssign] = useState("all");

  const fetchData = async () => {
    const [expRes, payRes, bkRes, custRes, pkgRes] = await Promise.all([
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("payments").select("amount").eq("status", "completed"),
      supabase.from("bookings").select("id, tracking_id, guest_name, user_id, profiles(full_name)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, user_id, full_name, phone").order("full_name"),
      supabase.from("packages").select("id, name, type").eq("is_active", true).order("name"),
    ]);
    setExpenses(expRes.data || []);
    setRevenue((payRes.data || []).reduce((s: number, p: any) => s + Number(p.amount), 0));
    setBookings(bkRes.data || []);
    setCustomers(custRes.data || []);
    setPackages(pkgRes.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      title: form.title,
      amount: parseFloat(form.amount),
      expense_type: form.expense_type,
      category: form.category,
      note: form.note || null,
      date: form.date || undefined,
      booking_id: form.category === "booking" && form.booking_id ? form.booking_id : null,
      customer_id: form.category === "customer" && form.customer_id ? form.customer_id : null,
      package_id: form.category === "package" && form.package_id ? form.package_id : null,
    };
    const { error } = await supabase.from("expenses").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Expense recorded");
    setShowForm(false);
    setForm({ ...EMPTY_FORM });
    fetchData();
  };

  const startEdit = (e: any) => {
    setEditingId(e.id);
    setEditForm({
      title: e.title, amount: e.amount, expense_type: e.expense_type || "other",
      category: e.category || "general", note: e.note || "", date: e.date,
      booking_id: e.booking_id || "", customer_id: e.customer_id || "", package_id: e.package_id || "",
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const payload: any = {
      title: editForm.title, amount: parseFloat(editForm.amount),
      expense_type: editForm.expense_type, category: editForm.category,
      note: editForm.note || null, date: editForm.date,
      booking_id: editForm.category === "booking" && editForm.booking_id ? editForm.booking_id : null,
      customer_id: editForm.category === "customer" && editForm.customer_id ? editForm.customer_id : null,
      package_id: editForm.category === "package" && editForm.package_id ? editForm.package_id : null,
    };
    const { error } = await supabase.from("expenses").update(payload).eq("id", editingId);
    if (error) { toast.error(error.message); return; }
    toast.success("Expense updated");
    setEditingId(null);
    fetchData();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("expenses").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("Expense deleted");
    setDeleteId(null);
    fetchData();
  };

  const totalExpenses = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
  const netProfit = revenue - totalExpenses;

  const filtered = useMemo(() => {
    return expenses.filter((e: any) => {
      if (filterType !== "all" && e.expense_type !== filterType) return false;
      if (filterAssign !== "all" && e.category !== filterAssign) return false;
      return true;
    });
  }, [expenses, filterType, filterAssign]);

  const typeTotals = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e: any) => {
      const t = e.expense_type || "other";
      map[t] = (map[t] || 0) + Number(e.amount);
    });
    return map;
  }, [expenses]);

  const getBookingLabel = (id: string) => {
    const b = bookings.find((bk: any) => bk.id === id);
    return b ? `${b.tracking_id} — ${b.profiles?.full_name || b.guest_name || "N/A"}` : id?.slice(0, 8);
  };

  const getCustomerLabel = (id: string) => {
    const c = customers.find((cu: any) => cu.user_id === id);
    return c ? `${c.full_name || "N/A"} (${c.phone || ""})` : id?.slice(0, 8);
  };

  const getPackageLabel = (id: string) => {
    const p = packages.find((pk: any) => pk.id === id);
    return p ? p.name : id?.slice(0, 8);
  };

  const AssignmentFields = ({ data, setData, prefix = "" }: { data: any; setData: (d: any) => void; prefix?: string }) => (
    <>
      {data.category === "booking" && (
        <select className={inputClass} value={data.booking_id} onChange={(e) => setData({ ...data, booking_id: e.target.value })}>
          <option value="">Select Booking</option>
          {bookings.map((b: any) => <option key={b.id} value={b.id}>{b.tracking_id} — {b.profiles?.full_name || b.guest_name || "N/A"}</option>)}
        </select>
      )}
      {data.category === "customer" && (
        <select className={inputClass} value={data.customer_id} onChange={(e) => setData({ ...data, customer_id: e.target.value })}>
          <option value="">Select Customer</option>
          {customers.map((c: any) => <option key={c.user_id} value={c.user_id}>{c.full_name || "N/A"} ({c.phone || ""})</option>)}
        </select>
      )}
      {data.category === "package" && (
        <select className={inputClass} value={data.package_id} onChange={(e) => setData({ ...data, package_id: e.target.value })}>
          <option value="">Select Package</option>
          {packages.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
        </select>
      )}
    </>
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="font-heading text-xl font-bold">Expense Management</h2>
        {!isViewer && (
          <button onClick={() => setShowForm(!showForm)} className="bg-gradient-gold text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add Expense"}
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-heading font-bold text-primary">৳{revenue.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-heading font-bold text-destructive">৳{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Net Profit</p>
          <p className={`text-2xl font-heading font-bold ${netProfit >= 0 ? "text-emerald" : "text-destructive"}`}>৳{netProfit.toLocaleString()}</p>
        </div>
      </div>

      {/* Type Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {EXPENSE_TYPES.map(({ value, label }) => (
          <div key={value} className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-heading font-bold text-foreground">৳{(typeTotals[value] || 0).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-border rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className={inputClass} placeholder="Expense Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={inputClass} placeholder="Amount (BDT)" type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <select className={inputClass} value={form.expense_type} onChange={(e) => setForm({ ...form, expense_type: e.target.value })}>
            {EXPENSE_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, booking_id: "", customer_id: "", package_id: "" })}>
            {ASSIGN_TO.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
          <AssignmentFields data={form} setData={setForm} />
          <input className={inputClass + " sm:col-span-2"} placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <button type="submit" className="bg-gradient-gold text-primary-foreground font-semibold py-2.5 rounded-md text-sm sm:col-span-2">Record Expense</button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select className={inputClass + " w-auto"} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {EXPENSE_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className={inputClass + " w-auto"} value={filterAssign} onChange={(e) => setFilterAssign(e.target.value)}>
          <option value="all">All Assignments</option>
          {ASSIGN_TO.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} expense{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Expense List */}
      <div className="space-y-2">
        {filtered.map((e: any) => (
          <div key={e.id} className="bg-card border border-border rounded-lg p-4">
            {editingId === e.id ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <input className={inputClass} value={editForm.title} onChange={(ev) => setEditForm({ ...editForm, title: ev.target.value })} />
                <input className={inputClass} type="number" step="0.01" value={editForm.amount} onChange={(ev) => setEditForm({ ...editForm, amount: ev.target.value })} />
                <select className={inputClass} value={editForm.expense_type} onChange={(ev) => setEditForm({ ...editForm, expense_type: ev.target.value })}>
                  {EXPENSE_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
                <input className={inputClass} type="date" value={editForm.date} onChange={(ev) => setEditForm({ ...editForm, date: ev.target.value })} />
                <select className={inputClass} value={editForm.category} onChange={(ev) => setEditForm({ ...editForm, category: ev.target.value, booking_id: "", customer_id: "", package_id: "" })}>
                  {ASSIGN_TO.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
                <AssignmentFields data={editForm} setData={setEditForm} />
                <input className={inputClass} placeholder="Note" value={editForm.note} onChange={(ev) => setEditForm({ ...editForm, note: ev.target.value })} />
                <div className="flex gap-2 items-center sm:col-span-3">
                  <button onClick={saveEdit} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md flex items-center gap-1"><Save className="h-3 w-3" /> Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs bg-secondary px-3 py-1.5 rounded-md">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{e.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium capitalize">{EXPENSE_TYPES.find(t => t.value === e.expense_type)?.label || e.expense_type}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground capitalize">{e.category || "general"}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(e.date).toLocaleDateString()}</span>
                    {e.booking_id && <span className="text-[10px] text-muted-foreground">📋 {getBookingLabel(e.booking_id)}</span>}
                    {e.customer_id && <span className="text-[10px] text-muted-foreground">👤 {getCustomerLabel(e.customer_id)}</span>}
                    {e.package_id && <span className="text-[10px] text-muted-foreground">📦 {getPackageLabel(e.package_id)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="font-heading font-bold text-destructive">৳{Number(e.amount).toLocaleString()}</p>
                  {!isViewer && <button onClick={() => startEdit(e)} className="text-muted-foreground hover:text-foreground"><Edit2 className="h-3.5 w-3.5" /></button>}
                  {!isViewer && <button onClick={() => setDeleteId(e.id)} className="text-destructive hover:underline"><Trash2 className="h-3.5 w-3.5" /></button>}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No expenses found.</p>}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg mb-2">Delete Expense?</h3>
            <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="text-sm px-4 py-2 rounded-md bg-secondary">Cancel</button>
              <button onClick={confirmDelete} className="text-sm px-4 py-2 rounded-md bg-destructive text-destructive-foreground">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
