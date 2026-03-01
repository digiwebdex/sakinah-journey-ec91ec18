import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole, useIsViewer } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, Search, Users } from "lucide-react";
import { format } from "date-fns";

interface Moallem {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  nid_number: string | null;
  contract_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  nid_number: "",
  contract_date: "",
  notes: "",
  status: "active",
};

export default function AdminMoallemsPage() {
  const { toast } = useToast();
  const isViewer = useIsViewer();
  const [moallems, setMoallems] = useState<Moallem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<Moallem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchMoallems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("moallems")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setMoallems(data);
    setLoading(false);
  };

  useEffect(() => { fetchMoallems(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "নাম আবশ্যক", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      nid_number: form.nid_number.trim() || null,
      contract_date: form.contract_date || null,
      notes: form.notes.trim() || null,
      status: form.status,
    };

    if (editId) {
      const { error } = await supabase.from("moallems").update(payload).eq("id", editId);
      if (error) { toast({ title: "আপডেট ব্যর্থ", description: error.message, variant: "destructive" }); return; }
      toast({ title: "মোয়াল্লেম আপডেট হয়েছে" });
    } else {
      const { error } = await supabase.from("moallems").insert(payload);
      if (error) { toast({ title: "তৈরি ব্যর্থ", description: error.message, variant: "destructive" }); return; }
      toast({ title: "মোয়াল্লেম তৈরি হয়েছে" });
    }
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    fetchMoallems();
  };

  const startEdit = (m: Moallem) => {
    setForm({
      name: m.name,
      phone: m.phone || "",
      address: m.address || "",
      nid_number: m.nid_number || "",
      contract_date: m.contract_date || "",
      notes: m.notes || "",
      status: m.status,
    });
    setEditId(m.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("moallems").delete().eq("id", deleteId);
    if (error) { toast({ title: "মুছতে ব্যর্থ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "মোয়াল্লেম মুছে ফেলা হয়েছে" });
    setDeleteId(null);
    fetchMoallems();
  };

  const filtered = moallems.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.phone || "").toLowerCase().includes(q) ||
      (m.nid_number || "").toLowerCase().includes(q)
    );
  });

  const inputClass = "w-full";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> মোয়াল্লেম ম্যানেজমেন্ট
          </h1>
          <p className="text-muted-foreground text-sm">মোয়াল্লেম (গ্রুপ লিডার) তালিকা</p>
        </div>
        {!isViewer && (
          <Button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1" /> নতুন মোয়াল্লেম
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="নাম, ফোন বা NID দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">কোনো মোয়াল্লেম পাওয়া যায়নি</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Card key={m.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewItem(m)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{m.name}</CardTitle>
                  <Badge variant={m.status === "active" ? "default" : "secondary"}>
                    {m.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                {m.phone && <p>📞 {m.phone}</p>}
                {m.nid_number && <p>🪪 NID: {m.nid_number}</p>}
                {m.contract_date && <p>📅 চুক্তি: {m.contract_date}</p>}
                {!isViewer && (
                  <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" onClick={() => startEdit(m)}>
                      <Pencil className="h-3 w-3 mr-1" /> সম্পাদনা
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(m.id)}>
                      <Trash2 className="h-3 w-3 mr-1" /> মুছুন
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { setShowForm(false); setEditId(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "মোয়াল্লেম সম্পাদনা" : "নতুন মোয়াল্লেম"}</DialogTitle>
            <DialogDescription>মোয়াল্লেমের তথ্য পূরণ করুন</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">নাম *</label>
              <Input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">ফোন</label>
              <Input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">ঠিকানা</label>
              <Input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">NID নম্বর</label>
              <Input className={inputClass} value={form.nid_number} onChange={(e) => setForm({ ...form, nid_number: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">চুক্তির তারিখ</label>
              <Input type="date" className={inputClass} value={form.contract_date} onChange={(e) => setForm({ ...form, contract_date: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">স্ট্যাটাস</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">সক্রিয়</SelectItem>
                  <SelectItem value="inactive">নিষ্ক্রিয়</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">নোট</label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>বাতিল</Button>
            <Button onClick={handleSave}>{editId ? "আপডেট" : "তৈরি করুন"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(o) => { if (!o) setViewItem(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>মোয়াল্লেম প্রোফাইল</DialogTitle>
            <DialogDescription>{viewItem?.name}</DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">নাম</span><span className="font-medium">{viewItem.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ফোন</span><span>{viewItem.phone || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ঠিকানা</span><span>{viewItem.address || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">NID</span><span>{viewItem.nid_number || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">চুক্তির তারিখ</span><span>{viewItem.contract_date || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">স্ট্যাটাস</span>
                <Badge variant={viewItem.status === "active" ? "default" : "secondary"}>
                  {viewItem.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </Badge>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">নোট</span><span>{viewItem.notes || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">তৈরি</span><span>{format(new Date(viewItem.created_at), "dd MMM yyyy")}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>মুছে ফেলতে চান?</DialogTitle>
            <DialogDescription>এই মোয়াল্লেম স্থায়ীভাবে মুছে ফেলা হবে।</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>বাতিল</Button>
            <Button variant="destructive" onClick={handleDelete}>মুছুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
