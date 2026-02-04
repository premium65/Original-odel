import { Router } from "express";
import { db } from "../../db";
import { transactions, withdrawals, deposits, users } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

// Get all transactions
router.get("/", async (req, res) => {
  try {
    const allTransactions = await db.select({
      id: transactions.id,
      userId: transactions.userId,
      type: transactions.type,
      amount: transactions.amount,
      status: transactions.status,
      description: transactions.description,
      createdAt: transactions.createdAt,
      username: users.username,
      userEmail: users.email
    }).from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .orderBy(desc(transactions.createdAt));
    res.json(allTransactions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get withdrawals
router.get("/withdrawals", async (req, res) => {
  try {
    const allWithdrawals = await db.select({
      id: withdrawals.id,
      userId: withdrawals.userId,
      amount: withdrawals.amount,
      bankName: withdrawals.bankName,
      bankAccount: withdrawals.bankAccount,
      status: withdrawals.status,
      createdAt: withdrawals.createdAt,
      username: users.username,
      userEmail: users.email
    }).from(withdrawals)
      .leftJoin(users, eq(withdrawals.userId, users.id))
      .orderBy(desc(withdrawals.createdAt));
    res.json(allWithdrawals);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get deposits
router.get("/deposits", async (req, res) => {
  try {
    const allDeposits = await db.select({
      id: deposits.id,
      userId: deposits.userId,
      amount: deposits.amount,
      method: deposits.method,
      reference: deposits.reference,
      status: deposits.status,
      createdAt: deposits.createdAt,
      username: users.username,
      userEmail: users.email
    }).from(deposits)
      .leftJoin(users, eq(deposits.userId, users.id))
      .orderBy(desc(deposits.createdAt));
    res.json(allDeposits);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Approve/Reject withdrawal
router.put("/withdrawals/:id", async (req, res) => {
  try {
    const { status, processedBy } = req.body;
    const withdrawal = await db.select().from(withdrawals).where(eq(withdrawals.id, Number(req.params.id))).limit(1);
    if (!withdrawal.length) return res.status(404).json({ error: "Withdrawal not found" });

    if (status === "rejected") {
      // Refund the amount back to user
      await db.update(users).set({
        balance: sql`${users.balance} + ${withdrawal[0].amount}`
      }).where(eq(users.id, withdrawal[0].userId!));
    }

    const updated = await db.update(withdrawals).set({
      status,
      processedBy,
      processedAt: new Date()
    }).where(eq(withdrawals.id, Number(req.params.id))).returning();

    // Create transaction record
    await db.insert(transactions).values({
      userId: withdrawal[0].userId,
      type: "withdraw",
      amount: withdrawal[0].amount,
      status,
      description: status === "approved" ? "Withdrawal approved" : "Withdrawal rejected"
    });

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create manual deposit
router.post("/deposits/manual", async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    // Validate inputs
    if (!userId) {
      console.log("[MANUAL_DEPOSIT] Missing userId");
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!amount) {
      console.log("[MANUAL_DEPOSIT] Missing amount");
      return res.status(400).json({ error: "Amount is required" });
    }

    // Coerce and validate userId (must be string for DB)
    const userIdStr = String(userId);

    // Coerce and validate amount (must be numeric)
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      console.log("[MANUAL_DEPOSIT] Invalid amount:", amount);
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    console.log(`[MANUAL_DEPOSIT] Processing deposit: userId=${userIdStr}, amount=${numAmount}`);

    // Verify user exists
    const existingUser = await db.select().from(users).where(eq(users.id, userIdStr)).limit(1);
    if (!existingUser.length) {
      console.log("[MANUAL_DEPOSIT] User not found:", userIdStr);
      return res.status(404).json({ error: "User not found" });
    }

    // Run operations in a transaction-like sequence
    // Create deposit record
    const deposit = await db.insert(deposits).values({
      userId: userIdStr,
      amount: numAmount.toFixed(2),
      type: "manual_add",
      method: "admin_manual",
      description: description || "Manual deposit by admin",
      reference: `MANUAL-${Date.now()}`,
      status: "approved"
    }).returning();

    console.log("[MANUAL_DEPOSIT] Deposit record created:", deposit[0].id);

    // Add amount to user balance
    await db.update(users).set({
      balance: sql`${users.balance} + ${numAmount}::numeric`,
      hasDeposit: true
    }).where(eq(users.id, userIdStr));

    console.log("[MANUAL_DEPOSIT] User balance updated");

    // Create transaction record
    await db.insert(transactions).values({
      userId: userIdStr,
      type: "deposit",
      amount: numAmount.toFixed(2),
      status: "approved",
      description: description || "Manual deposit by admin"
    });

    console.log("[MANUAL_DEPOSIT] Transaction record created");

    res.status(201).json({ success: true, deposit: deposit[0] });
  } catch (error: any) {
    console.error("[MANUAL_DEPOSIT] Error:", error);
    const errorMessage = error?.message || "Failed to create manual deposit";
    res.status(500).json({ error: "Server error", details: errorMessage });
  }
});

// Approve deposit
router.put("/deposits/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const deposit = await db.select().from(deposits).where(eq(deposits.id, Number(req.params.id))).limit(1);
    if (!deposit.length) return res.status(404).json({ error: "Deposit not found" });

    if (status === "approved") {
      // Add amount to user balance
      await db.update(users).set({
        balance: sql`${users.balance} + ${deposit[0].amount}`
      }).where(eq(users.id, deposit[0].userId!));
    }

    const updated = await db.update(deposits).set({ status }).where(eq(deposits.id, Number(req.params.id))).returning();

    // Create transaction record
    await db.insert(transactions).values({
      userId: deposit[0].userId,
      type: "deposit",
      amount: deposit[0].amount,
      status,
      description: status === "approved" ? "Deposit confirmed" : "Deposit rejected"
    });

    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
