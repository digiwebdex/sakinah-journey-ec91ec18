import { describe, it, expect } from "vitest";

/**
 * Financial calculation logic tests.
 * These mirror the database-level rules:
 *   due_amount = GREATEST(total_amount - paid_amount, 0)
 *   paid_amount is capped at total_amount
 *   booking auto-completes when paid_amount >= total_amount
 */

// Pure functions extracted from business rules
const calculateDueAmount = (totalAmount: number, paidAmount: number): number => {
  return Math.max(totalAmount - paidAmount, 0);
};

const capPaidAmount = (totalPaid: number, totalAmount: number): number => {
  return Math.min(totalPaid, totalAmount);
};

const shouldAutoComplete = (paidAmount: number, totalAmount: number): boolean => {
  return paidAmount >= totalAmount;
};

const sumCompletedPayments = (payments: { amount: number; status: string }[]): number => {
  return payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
};

describe("Financial Calculations", () => {
  describe("calculateDueAmount", () => {
    it("returns correct due when partially paid", () => {
      expect(calculateDueAmount(100000, 40000)).toBe(60000);
    });

    it("returns zero when fully paid", () => {
      expect(calculateDueAmount(50000, 50000)).toBe(0);
    });

    it("never returns negative when overpaid", () => {
      expect(calculateDueAmount(50000, 70000)).toBe(0);
    });

    it("never returns negative with zero total", () => {
      expect(calculateDueAmount(0, 5000)).toBe(0);
    });

    it("returns full amount when nothing paid", () => {
      expect(calculateDueAmount(100000, 0)).toBe(100000);
    });

    it("handles floating point amounts correctly", () => {
      const due = calculateDueAmount(99999.99, 33333.33);
      expect(due).toBeCloseTo(66666.66, 2);
    });

    it("handles very large amounts", () => {
      expect(calculateDueAmount(10000000, 9999999)).toBe(1);
    });
  });

  describe("capPaidAmount", () => {
    it("caps paid at total when overpaid", () => {
      expect(capPaidAmount(120000, 100000)).toBe(100000);
    });

    it("returns paid as-is when under total", () => {
      expect(capPaidAmount(30000, 100000)).toBe(30000);
    });

    it("returns total when exactly equal", () => {
      expect(capPaidAmount(50000, 50000)).toBe(50000);
    });

    it("handles zero paid", () => {
      expect(capPaidAmount(0, 100000)).toBe(0);
    });
  });

  describe("shouldAutoComplete", () => {
    it("returns true when fully paid", () => {
      expect(shouldAutoComplete(100000, 100000)).toBe(true);
    });

    it("returns true when overpaid", () => {
      expect(shouldAutoComplete(110000, 100000)).toBe(true);
    });

    it("returns false when partially paid", () => {
      expect(shouldAutoComplete(50000, 100000)).toBe(false);
    });

    it("returns false when nothing paid", () => {
      expect(shouldAutoComplete(0, 100000)).toBe(false);
    });
  });

  describe("sumCompletedPayments", () => {
    it("sums only completed payments", () => {
      const payments = [
        { amount: 10000, status: "completed" },
        { amount: 20000, status: "pending" },
        { amount: 15000, status: "completed" },
        { amount: 5000, status: "failed" },
      ];
      expect(sumCompletedPayments(payments)).toBe(25000);
    });

    it("returns zero with no completed payments", () => {
      const payments = [
        { amount: 10000, status: "pending" },
        { amount: 20000, status: "failed" },
      ];
      expect(sumCompletedPayments(payments)).toBe(0);
    });

    it("returns zero with empty array", () => {
      expect(sumCompletedPayments([])).toBe(0);
    });

    it("handles all completed payments", () => {
      const payments = [
        { amount: 10000, status: "completed" },
        { amount: 20000, status: "completed" },
        { amount: 30000, status: "completed" },
      ];
      expect(sumCompletedPayments(payments)).toBe(60000);
    });
  });

  describe("End-to-end financial flow", () => {
    it("correctly processes a full payment lifecycle", () => {
      const totalAmount = 100000;
      const payments = [
        { amount: 33334, status: "completed" },
        { amount: 33333, status: "completed" },
        { amount: 33333, status: "pending" },
      ];

      const totalPaid = sumCompletedPayments(payments);
      expect(totalPaid).toBe(66667);

      const capped = capPaidAmount(totalPaid, totalAmount);
      expect(capped).toBe(66667);

      const due = calculateDueAmount(totalAmount, capped);
      expect(due).toBe(33333);
      expect(due).toBeGreaterThanOrEqual(0);

      expect(shouldAutoComplete(capped, totalAmount)).toBe(false);

      // Mark last payment as completed
      payments[2].status = "completed";
      const newPaid = capPaidAmount(sumCompletedPayments(payments), totalAmount);
      expect(calculateDueAmount(totalAmount, newPaid)).toBe(0);
      expect(shouldAutoComplete(newPaid, totalAmount)).toBe(true);
    });

    it("handles payment reversal (refund scenario)", () => {
      const totalAmount = 50000;
      const payments = [
        { amount: 25000, status: "completed" },
        { amount: 25000, status: "completed" },
      ];

      // Fully paid
      let paid = capPaidAmount(sumCompletedPayments(payments), totalAmount);
      expect(calculateDueAmount(totalAmount, paid)).toBe(0);
      expect(shouldAutoComplete(paid, totalAmount)).toBe(true);

      // Reverse one payment
      payments[1].status = "failed";
      paid = capPaidAmount(sumCompletedPayments(payments), totalAmount);
      expect(paid).toBe(25000);
      expect(calculateDueAmount(totalAmount, paid)).toBe(25000);
      expect(shouldAutoComplete(paid, totalAmount)).toBe(false);
    });

    it("prevents negative due even with excessive payments", () => {
      const totalAmount = 30000;
      const payments = [
        { amount: 20000, status: "completed" },
        { amount: 20000, status: "completed" },
      ];

      const totalPaid = sumCompletedPayments(payments); // 40000
      const capped = capPaidAmount(totalPaid, totalAmount); // 30000
      const due = calculateDueAmount(totalAmount, capped);

      expect(due).toBe(0);
      expect(due).toBeGreaterThanOrEqual(0);
    });
  });
});
