import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Package, CreditCard, AlertTriangle, User, FileText, ChevronDown, ChevronUp } from "lucide-react";
import logo from "@/assets/logo.jpg";
import DocumentUpload from "@/components/DocumentUpload";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

interface Booking {
  id: string;
  tracking_id: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: string;
  num_travelers: number;
  created_at: string;
  packages: { name: string; type: string } | null;
}

interface Payment {
  id: string;
  amount: number;
  installment_number: number | null;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  booking_id: string;
}

const Dashboard = () => {
  useSessionTimeout();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<"bookings" | "payments" | "due">("bookings");
  const [loading, setLoading] = useState(true);
  const [bookingDocs, setBookingDocs] = useState<Record<string, any[]>>({});
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [profileRes, bookingsRes, paymentsRes, docsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("bookings").select("*, packages(name, type)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("payments").select("*").eq("user_id", user.id).order("due_date", { ascending: true }),
      supabase.from("booking_documents").select("*").eq("user_id", user.id),
    ]);
    setProfile(profileRes.data);
    setBookings((bookingsRes.data as any) || []);
    setPayments((paymentsRes.data as any) || []);
    // Group docs by booking
    const grouped: Record<string, any[]> = {};
    (docsRes.data || []).forEach((d: any) => {
      if (!grouped[d.booking_id]) grouped[d.booking_id] = [];
      grouped[d.booking_id].push(d);
    });
    setBookingDocs(grouped);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/");
  };

  const totalDue = bookings.reduce((sum, b) => sum + Number(b.due_amount || 0), 0);
  const overduePayments = payments.filter(
    (p) => p.status === "pending" && p.due_date && new Date(p.due_date) < new Date()
  );

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "text-emerald bg-emerald/10";
      case "pending": return "text-primary bg-primary/10";
      case "confirmed": return "text-primary bg-primary/10";
      case "cancelled": return "text-destructive bg-destructive/10";
      case "failed": return "text-destructive bg-destructive/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-10 w-10 rounded-md object-cover" />
            <span className="font-heading text-lg font-bold text-primary hidden sm:block">RAHE KABA</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{profile?.full_name || user?.email}</span>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Bookings</span>
            </div>
            <p className="text-2xl font-heading font-bold">{bookings.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Due</span>
            </div>
            <p className="text-2xl font-heading font-bold text-primary">৳{totalDue.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-sm text-muted-foreground">Overdue Payments</span>
            </div>
            <p className="text-2xl font-heading font-bold text-destructive">{overduePayments.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {([
            { key: "bookings", label: "My Bookings", icon: Package },
            { key: "payments", label: "Payment History", icon: CreditCard },
            { key: "due", label: "Due Alerts", icon: AlertTriangle },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No bookings yet. Browse our packages to get started!</p>
              </div>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Tracking ID</p>
                      <p className="font-mono font-bold text-primary">{b.tracking_id}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Package</p>
                      <p className="font-medium">{b.packages?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-medium">৳{Number(b.total_amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Paid</p>
                      <p className="font-medium text-emerald">৳{Number(b.paid_amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due</p>
                      <p className="font-medium text-destructive">৳{Number(b.due_amount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  {/* Document Upload Toggle */}
                  <button
                    onClick={() => setExpandedBooking(expandedBooking === b.id ? null : b.id)}
                    className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Documents ({(bookingDocs[b.id] || []).length}/3)
                    {expandedBooking === b.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  {expandedBooking === b.id && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <DocumentUpload
                        bookingId={b.id}
                        userId={user.id}
                        documents={bookingDocs[b.id] || []}
                        onUploaded={fetchData}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="space-y-3">
            {payments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No payment records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-3 pr-4">#</th>
                      <th className="pb-3 pr-4">Amount</th>
                      <th className="pb-3 pr-4">Due Date</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="py-3 pr-4">{p.installment_number || "—"}</td>
                        <td className="py-3 pr-4 font-medium">৳{Number(p.amount).toLocaleString()}</td>
                        <td className="py-3 pr-4">{p.due_date ? new Date(p.due_date).toLocaleDateString() : "—"}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor(p.status)}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 capitalize">{p.payment_method || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Due Alerts Tab */}
        {activeTab === "due" && (
          <div className="space-y-3">
            {overduePayments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No overdue payments. You're all caught up! 🎉</p>
              </div>
            ) : (
              overduePayments.map((p) => (
                <div key={p.id} className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-destructive">Installment #{p.installment_number} Overdue</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {p.due_date ? new Date(p.due_date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <p className="text-xl font-heading font-bold text-destructive">৳{Number(p.amount).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
