import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsViewer } from "@/components/admin/AdminLayout";
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
import { Plus, Pencil, Trash2, Search, Truck } from "lucide-react";
import { format } from "date-fns";

interface SupplierAgent {
  id: string;
  agent_name: string;
  company_name: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  agent_name: "",
  company_name: "",
  phone: "",
  address: "",
  notes: "",
  status: "active",
};

export default function AdminSupplierAgentsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isViewer = useIsViewer();
  const [agents, setAgents] = useState<SupplierAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<SupplierAgent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("supplier_agents")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setAgents(data as SupplierAgent[]);
    setLoading(false);
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleSave = async () => {
    if (!form.agent_name.trim()) {
      toast({ title: "এজেন্টের নাম আবশ্যক", variant: "destructive" });
      return;
    }
    const payload = {
      agent_name: form.agent_name.trim(),
      company_name: form.company_name.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      status: form.status,
    };

    if (editId) {
      const { error } = await supabase.from("supplier_agents").update(payload).eq("id", editId);
      if (error) { toast({ title: "আপডেট ব্যর্থ", description: error.message, variant: "destructive" }); return; }
      toast({ title: "সাপ্লায়ার এজেন্ট আপডেট হয়েছে" });
    } else {
      const { error } = await supabase.from("supplier_agents").insert(payload);
      if (error) { toast({ title: "তৈরি ব্যর্থ", description: error.message, variant: "destructive" }); return; }
      toast({ title: "সাপ্লায়ার এজেন্ট তৈরি হয়েছে" });
    }
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    fetchAgents();
  };

  const startEdit = (a: SupplierAgent) => {
    setForm({
      agent_name: a.agent_name,
      company_name: a.company_name || "",
      phone: a.phone || "",
      address: a.address || "",
      notes: a.notes || "",
      status: a.status,
    });
    setEditId(a.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("supplier_agents").delete().eq("id", deleteId);
    if (error) { toast({ title: "মুছতে ব্যর্থ", description: error.message, variant: "destructive" }); return; }
    toast({ title: "সাপ্লায়ার এজেন্ট মুছে ফেলা হয়েছে" });
    setDeleteId(null);
    fetchAgents();
  };

  const filtered = agents.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.agent_name.toLowerCase().includes(q) ||
      (a.company_name || "").toLowerCase().includes(q) ||
      (a.phone || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> সাপ্লায়ার এজেন্ট
          </h1>
          <p className="text-muted-foreground text-sm">বাহ্যিক এজেন্সি যাদের কাছ থেকে প্যাকেজ ক্রয় করা হয়</p>
        </div>
        {!isViewer && (
          <Button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1" /> নতুন এজেন্ট
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="নাম, কোম্পানি বা ফোন দিয়ে খুঁজুন..."
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
        <p className="text-center text-muted-foreground py-12">কোনো সাপ্লায়ার এজেন্ট পাওয়া যায়নি</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Card key={a.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/admin/supplier-agents/${a.id}`)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{a.agent_name}</CardTitle>
                  <Badge variant={a.status === "active" ? "default" : "secondary"}>
                    {a.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                {a.company_name && <p>🏢 {a.company_name}</p>}
                {a.phone && <p>📞 {a.phone}</p>}
                {a.address && <p>📍 {a.address}</p>}
                {!isViewer && (
                  <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" onClick={() => startEdit(a)}>
                      <Pencil className="h-3 w-3 mr-1" /> সম্পাদনা
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(a.id)}>
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
            <DialogTitle>{editId ? "এজেন্ট সম্পাদনা" : "নতুন সাপ্লায়ার এজেন্ট"}</DialogTitle>
            <DialogDescription>সাপ্লায়ার এজেন্টের তথ্য পূরণ করুন</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">এজেন্টের নাম *</label>
              <Input value={form.agent_name} onChange={(e) => setForm({ ...form, agent_name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">কোম্পানির নাম</label>
              <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">ফোন</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">ঠিকানা</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
            <DialogTitle>সাপ্লায়ার এজেন্ট বিবরণ</DialogTitle>
            <DialogDescription>{viewItem?.agent_name}</DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">এজেন্টের নাম</span><span className="font-medium">{viewItem.agent_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">কোম্পানি</span><span>{viewItem.company_name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ফোন</span><span>{viewItem.phone || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ঠিকানা</span><span>{viewItem.address || "—"}</span></div>
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
            <DialogDescription>এই সাপ্লায়ার এজেন্ট স্থায়ীভাবে মুছে ফেলা হবে।</DialogDescription>
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
