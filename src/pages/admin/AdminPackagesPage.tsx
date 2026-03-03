import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X, Edit2, Trash2, Save, ToggleLeft, ToggleRight, Upload, Loader2, Eye, Copy } from "lucide-react";
import { useIsViewer } from "@/components/admin/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminActionMenu from "@/components/admin/AdminActionMenu";

const inputClass = "w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const TYPES = ["hajj", "umrah", "tour", "visa", "hotel", "transport", "ziyara"];

const EMPTY_FORM = {
  name: "", type: "umrah", description: "", price: "", duration_days: "",
  image_url: "", start_date: "", expiry_date: "", services: "", is_active: true,
  status: "active", show_on_website: true,
};

export default function AdminPackagesPage() {
  const isViewer = useIsViewer();
  const [packages, setPackages] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("action") === "add";
  });
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewPkg, setViewPkg] = useState<any>(null);

  const fetchPkgs = () => supabase.from("packages").select("*").order("created_at", { ascending: false }).then(({ data }) => setPackages(data || []));
  useEffect(() => { fetchPkgs(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("শুধুমাত্র ইমেজ ফাইল আপলোড করুন"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("ফাইল সাইজ ৫MB এর বেশি হতে পারবে না"); return; }
    setUploading(true);
    const path = `packages/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("hotel-images").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("hotel-images").getPublicUrl(path);
    setForm(f => ({ ...f, image_url: publicUrl }));
    setUploading(false);
  };

  const buildPayload = (f: typeof form) => ({
    name: f.name.trim(), type: f.type, description: f.description.trim() || null,
    price: parseFloat(f.price), duration_days: f.duration_days ? parseInt(f.duration_days) : null,
    image_url: f.image_url || null, start_date: f.start_date || null,
    expiry_date: f.expiry_date || null,
    services: f.services ? f.services.split(",").map(s => s.trim()).filter(Boolean) : [],
    is_active: f.status === "active",
    status: f.status,
    show_on_website: f.show_on_website,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("প্যাকেজের নাম আবশ্যক"); return; }
    if (!form.price || parseFloat(form.price) <= 0) { toast.error("সঠিক মূল্য দিন"); return; }
    const { error } = await supabase.from("packages").insert(buildPayload(form));
    if (error) { toast.error(error.message); return; }
    toast.success("প্যাকেজ তৈরি হয়েছে");
    setShowForm(false); setForm({ ...EMPTY_FORM }); fetchPkgs();
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    const svc = Array.isArray(p.services) ? p.services.join(", ") : "";
    setForm({
      name: p.name, type: p.type, description: p.description || "", price: String(p.price),
      duration_days: p.duration_days ? String(p.duration_days) : "", image_url: p.image_url || "",
      start_date: p.start_date || "", expiry_date: p.expiry_date || "", services: svc, is_active: p.is_active,
      status: p.status || (p.is_active ? "active" : "inactive"),
      show_on_website: p.show_on_website !== false,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const { error } = await supabase.from("packages").update(buildPayload(form)).eq("id", editingId);
    if (error) { toast.error(error.message); return; }
    toast.success("প্যাকেজ আপডেট হয়েছে");
    setShowForm(false); setEditingId(null); setForm({ ...EMPTY_FORM }); fetchPkgs();
  };

  const toggleActive = async (p: any) => {
    const newStatus = p.status === "active" ? "inactive" : "active";
    const { error } = await supabase.from("packages").update({ 
      status: newStatus, 
      is_active: newStatus === "active",
      show_on_website: newStatus === "inactive" ? false : p.show_on_website,
    } as any).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success(newStatus === "active" ? "প্যাকেজ সক্রিয়" : "প্যাকেজ নিষ্ক্রিয়");
    fetchPkgs();
  };

  const handleDuplicate = async (p: any) => {
    const svc = Array.isArray(p.services) ? p.services : [];
    const { error } = await supabase.from("packages").insert({
      name: p.name + " (Copy)", type: p.type, description: p.description,
      price: p.price, duration_days: p.duration_days, image_url: p.image_url,
      start_date: p.start_date, expiry_date: p.expiry_date, services: svc, is_active: false,
      status: "inactive", show_on_website: false,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("প্যাকেজ ডুপ্লিকেট হয়েছে");
    fetchPkgs();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("packages").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success("প্যাকেজ মুছে ফেলা হয়েছে");
    setDeleteId(null); fetchPkgs();
  };

  const closeModal = () => { setShowForm(false); setEditingId(null); setForm({ ...EMPTY_FORM }); };

  const renderForm = () => (
    <form onSubmit={editingId ? handleSave : handleCreate} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs text-muted-foreground block mb-1">প্যাকেজের নাম *</label>
          <input className={inputClass} placeholder="প্যাকেজের নাম" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={200} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">ধরন *</label>
          <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">মূল্য (৳) *</label>
          <input className={inputClass} placeholder="0" type="number" step="0.01" min="1" required value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">সময়কাল (দিন)</label>
          <input className={inputClass} placeholder="দিন সংখ্যা" type="number" min="1" value={form.duration_days}
            onChange={(e) => setForm({ ...form, duration_days: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">শুরুর তারিখ</label>
          <input className={inputClass} type="date" value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">শেষ তারিখ</label>
          <input className={inputClass} type="date" value={form.expiry_date}
            onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-muted-foreground block mb-1">সেবাসমূহ (কমা দিয়ে আলাদা করুন)</label>
          <input className={inputClass} placeholder="ভিসা, হোটেল, পরিবহন, খাবার, গাইড"
            value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-muted-foreground block mb-1">বিবরণ</label>
          <textarea className={`${inputClass} resize-none`} placeholder="প্যাকেজের বিস্তারিত..." rows={3}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={1000} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-muted-foreground block mb-1">ছবি</label>
          {form.image_url ? (
            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setForm({ ...form, image_url: "" })}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className={`${inputClass} flex items-center justify-center gap-2 cursor-pointer h-24 border-dashed`}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>{uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          )}
        </div>
        <div className="sm:col-span-2 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground">সিস্টেম স্ট্যাটাস:</label>
            <button type="button" onClick={() => setForm({ ...form, status: form.status === "active" ? "inactive" : "active", is_active: form.status !== "active" })}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md ${form.status === "active" ? "bg-emerald/10 text-emerald" : "bg-secondary text-muted-foreground"}`}>
              {form.status === "active" ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {form.status === "active" ? "Active" : "Inactive"}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground">ওয়েবসাইটে দেখান:</label>
            <button type="button" 
              onClick={() => form.status === "active" && setForm({ ...form, show_on_website: !form.show_on_website })}
              disabled={form.status !== "active"}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md ${
                form.status !== "active" ? "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed" :
                form.show_on_website ? "bg-blue-500/10 text-blue-600" : "bg-secondary text-muted-foreground"
              }`}>
              {form.show_on_website && form.status === "active" ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {form.show_on_website && form.status === "active" ? "Yes" : "No"}
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={closeModal} className="text-sm px-4 py-2 rounded-md bg-secondary">বাতিল</button>
        <button type="submit"
          className="text-sm px-4 py-2 rounded-md bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-gold flex items-center gap-2">
          <Save className="h-4 w-4" /> {editingId ? "আপডেট করুন" : "তৈরি করুন"}
        </button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading text-xl font-bold">প্যাকেজ ব্যবস্থাপনা</h2>
        {!isViewer && (
          <button onClick={() => { setEditingId(null); setForm({ ...EMPTY_FORM }); setShowForm(true); }}
            className="bg-gradient-gold text-primary-foreground text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2 hover:opacity-90 transition-opacity shadow-gold">
            <Plus className="h-4 w-4" /> নতুন প্যাকেজ
          </button>
        )}
      </div>

      <div className="space-y-3">
        {packages.map((p: any) => (
          <div key={p.id} className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setViewPkg(p)}>
            <div className="flex items-start gap-4">
              {p.image_url && (
                <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">{p.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${(p.status || (p.is_active ? 'active' : 'inactive')) === 'active' ? "bg-emerald/10 text-emerald" : "bg-destructive/10 text-destructive"}`}>
                    {(p.status || (p.is_active ? 'active' : 'inactive')) === 'active' ? "Active" : "Inactive"}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${p.show_on_website !== false ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"}`}>
                    {p.show_on_website !== false ? "Visible" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                  {p.type} • {p.duration_days ? `${p.duration_days} দিন` : "—"}
                  {p.start_date && ` • শুরু: ${p.start_date}`}
                  {p.expiry_date && ` • শেষ: ${p.expiry_date}`}
                </p>
                {Array.isArray(p.services) && p.services.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.services.map((s: string, i: number) => (
                      <span key={i} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <p className="font-heading font-bold text-primary">৳{Number(p.price).toLocaleString()}</p>
                <AdminActionMenu
                  inlineCount={2}
                  actions={[
                    { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: () => setViewPkg(p) },
                    { label: "Edit", icon: <Edit2 className="h-3.5 w-3.5" />, onClick: () => openEdit(p), variant: "warning", hidden: isViewer },
                    { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => setDeleteId(p.id), variant: "destructive", hidden: isViewer, separator: true },
                    { label: "Duplicate", icon: <Copy className="h-3.5 w-3.5" />, onClick: () => handleDuplicate(p), variant: "purple", hidden: isViewer },
                    { label: (p.status || (p.is_active ? 'active' : 'inactive')) === 'active' ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন", icon: (p.status || (p.is_active ? 'active' : 'inactive')) === 'active' ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />, onClick: () => toggleActive(p), variant: (p.status || (p.is_active ? 'active' : 'inactive')) === 'active' ? "warning" : "success", hidden: isViewer },
                  ]}
                />
              </div>
            </div>
          </div>
        ))}
        {packages.length === 0 && <p className="text-center text-muted-foreground py-12">কোনো প্যাকেজ পাওয়া যায়নি।</p>}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) closeModal(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingId ? "প্যাকেজ সম্পাদনা" : "নতুন প্যাকেজ তৈরি করুন"}</DialogTitle>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!viewPkg} onOpenChange={(o) => { if (!o) setViewPkg(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{viewPkg?.name}</DialogTitle>
          </DialogHeader>
          {viewPkg && (
            <div className="space-y-3 text-sm">
              {viewPkg.image_url && <img src={viewPkg.image_url} alt={viewPkg.name} className="w-full h-48 rounded-lg object-cover" />}
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground text-xs block">ধরন</span><span className="font-medium capitalize">{viewPkg.type}</span></div>
                <div><span className="text-muted-foreground text-xs block">মূল্য</span><span className="font-medium text-primary">৳{Number(viewPkg.price).toLocaleString()}</span></div>
                <div><span className="text-muted-foreground text-xs block">সময়কাল</span><span className="font-medium">{viewPkg.duration_days ? `${viewPkg.duration_days} দিন` : "—"}</span></div>
                <div><span className="text-muted-foreground text-xs block">শেষ তারিখ</span><span className="font-medium">{viewPkg.expiry_date || "—"}</span></div>
                <div><span className="text-muted-foreground text-xs block">সিস্টেম স্ট্যাটাস</span><span className={`font-medium ${(viewPkg.status || (viewPkg.is_active ? 'active' : 'inactive')) === 'active' ? "text-emerald" : "text-destructive"}`}>{(viewPkg.status || (viewPkg.is_active ? 'active' : 'inactive')) === 'active' ? "Active" : "Inactive"}</span></div>
                <div><span className="text-muted-foreground text-xs block">ওয়েবসাইট</span><span className={`font-medium ${viewPkg.show_on_website !== false ? "text-blue-600" : "text-amber-600"}`}>{viewPkg.show_on_website !== false ? "Visible" : "Hidden"}</span></div>
              </div>
              {viewPkg.description && <div><span className="text-muted-foreground text-xs block">বিবরণ</span><p>{viewPkg.description}</p></div>}
              {Array.isArray(viewPkg.services) && viewPkg.services.length > 0 && (
                <div><span className="text-muted-foreground text-xs block mb-1">সেবাসমূহ</span>
                  <div className="flex flex-wrap gap-1">{viewPkg.services.map((s: string, i: number) => <span key={i} className="text-xs bg-secondary px-2 py-0.5 rounded">{s}</span>)}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDeleteId(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg mb-2">প্যাকেজ মুছবেন?</h3>
            <p className="text-sm text-muted-foreground mb-4">এই প্যাকেজ ব্যবহার করে কোনো বিদ্যমান বুকিং প্রভাবিত হবে না।</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="text-sm px-4 py-2 rounded-md bg-secondary">বাতিল</button>
              <button onClick={confirmDelete} className="text-sm px-4 py-2 rounded-md bg-destructive text-destructive-foreground">মুছুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
