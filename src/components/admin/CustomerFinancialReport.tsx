import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, DollarSign, TrendingUp, TrendingDown, Clock } from "lucide-react";

interface CustomerFinancialReportProps {
  customer: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CustomerFinancialReport({ customer, open, onOpenChange }: CustomerFinancialReportProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !customer) return;
    setLoading(true);

    const fetchData = async () => {
      const { data: bks } = await supabase
        .from("bookings")
        .select("*, packages(name)")
        .eq("user_id", customer.user_id);

      const bookingsList = bks || [];
      setBookings(bookingsList);

      const { data: pmts } = await supabase
        .from("payments")
        .select("*, bookings(tracking_id)")
        .eq("user_id", customer.user_id)
        .order("due_date", { ascending: true });

      setPayments(pmts || []);

      const bookingIds = bookingsList.map((b) => b.id);
      if (bookingIds.length > 0) {
        const { data: txns } = await supabase
          .from("transactions")
          .select("*")
          .eq("type", "expense")
          .in("booking_id", bookingIds);
        setExpenses(txns || []);
      } else {
        setExpenses([]);
      }

      setLoading(false);
    };

    fetchData();
  }, [open, customer]);

  const summary = useMemo(() => {
    const totalRevenue = payments
      .filter((p) => p.status === "completed")
      .reduce((s, p) => s + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const totalDue = payments
      .filter((p) => p.status === "pending")
      .reduce((s, p) => s + Number(p.amount), 0);
    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalDue,
    };
  }, [payments, expenses]);

  const fmt = (n: number) => `৳${n.toLocaleString()}`;

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print-report-content">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Financial Report — {customer.full_name || "Unnamed"}
          </DialogTitle>
          <DialogDescription>
            Complete financial overview for this customer.
          </DialogDescription>
        </DialogHeader>

        {/* Customer Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Phone</span>
            <p className="font-medium">{customer.phone || "N/A"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Passport</span>
            <p className="font-medium">{customer.passport_number || "N/A"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Address</span>
            <p className="font-medium">{customer.address || "N/A"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Joined</span>
            <p className="font-medium">{new Date(customer.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="font-semibold text-sm">{fmt(summary.totalRevenue)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="font-semibold text-sm">{fmt(summary.totalExpenses)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Net Profit</p>
                <p className={`font-semibold text-sm ${summary.netProfit < 0 ? "text-destructive" : ""}`}>
                  {fmt(summary.netProfit)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Due</p>
                <p className="font-semibold text-sm">{fmt(summary.totalDue)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : (
          <>
            {/* Bookings */}
            <div>
              <h3 className="font-heading font-semibold text-sm mb-2">Booking Details</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Travelers</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">{b.tracking_id}</TableCell>
                      <TableCell>{(b.packages as any)?.name || "—"}</TableCell>
                      <TableCell>{b.num_travelers}</TableCell>
                      <TableCell>{fmt(Number(b.total_amount))}</TableCell>
                      <TableCell>{fmt(Number(b.paid_amount))}</TableCell>
                      <TableCell>{fmt(Number(b.due_amount || 0))}</TableCell>
                      <TableCell>
                        <Badge variant={b.status === "completed" ? "default" : "secondary"}>
                          {b.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">No bookings</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Payments */}
            <div>
              <h3 className="font-heading font-semibold text-sm mb-2">Payment History</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking</TableHead>
                    <TableHead>Installment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{(p.bookings as any)?.tracking_id || "—"}</TableCell>
                      <TableCell>{p.installment_number || "—"}</TableCell>
                      <TableCell>{fmt(Number(p.amount))}</TableCell>
                      <TableCell>{p.due_date ? new Date(p.due_date).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === "completed" ? "default" : "secondary"}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">No payments</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Expenses */}
            <div>
              <h3 className="font-heading font-semibold text-sm mb-2">Expenses Assigned</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Linked Booking</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((e) => {
                    const linkedBooking = bookings.find((b) => b.id === e.booking_id);
                    return (
                      <TableRow key={e.id}>
                        <TableCell>{e.note || e.category}</TableCell>
                        <TableCell>{e.category}</TableCell>
                        <TableCell>{fmt(Number(e.amount))}</TableCell>
                        <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-xs">{linkedBooking?.tracking_id || "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                  {expenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No expenses</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Print Button */}
        <div className="flex justify-end print-hide">
          <Button onClick={() => window.print()} variant="outline" className="gap-2">
            <Printer className="h-4 w-4" /> Print Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
