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
    const adminId = req.session.userId;

    // Validate required fields
    if (!userId || !amount) {
      console.log("[MANUAL_DEPOSIT] Missing required fields - userId:", userId, "amount:", amount);
      return res.status(400).json({ error: "User ID and amount are required" });
    }

    // Validate and coerce amount to number
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      console.log("[MANUAL_DEPOSIT] Invalid amount:", amount);
      return res.status(400).json({ error: "Invalid amount. Must be a positive number." });
    }

    // Validate userId format (string is expected)
    const normalizedUserId = String(userId);
    
    console.log("[MANUAL_DEPOSIT] Starting manual deposit - Admin:", adminId, "Target User:", normalizedUserId, "Amount:", numAmount);

    // Check if user exists
    const userCheck = await db.select().from(users).where(eq(users.id, normalizedUserId)).limit(1);
    if (!userCheck.length) {
      console.log("[MANUAL_DEPOSIT] User not found:", normalizedUserId);
      return res.status(404).json({ error: "User not found" });
    }

    // Perform database operations
    // Note: Drizzle ORM transactions are available via db.transaction() but for simplicity
    // we'll do sequential operations with error handling
    
    // Create deposit record
    const depositData = {
      userId: normalizedUserId,
      amount: numAmount.toString(), // Store as string for decimal precision
      type: "manual_add",
      method: "admin_manual",
      description: description || "Manual deposit by admin",
      reference: `MANUAL-${Date.now()}`,
      status: "approved"
    };
    
    console.log("[MANUAL_DEPOSIT] Creating deposit record:", depositData);
    const deposit = await db.insert(deposits).values(depositData).returning();

    // Update user balance - use SQL to ensure atomic operation
    console.log("[MANUAL_DEPOSIT] Updating user balance - adding:", numAmount);
    await db.update(users).set({
      balance: sql`${users.balance} + ${numAmount}::numeric`,
      hasDeposit: true,
      updatedAt: new Date()
    }).where(eq(users.id, normalizedUserId));

    // Create transaction record
    const transactionData = {
      userId: normalizedUserId,
      type: "deposit",
      amount: numAmount.toString(),
      status: "approved",
      description: description || "Manual deposit by admin"
    };
    
    console.log("[MANUAL_DEPOSIT] Creating transaction record:", transactionData);
    await db.insert(transactions).values(transactionData);

    console.log("[MANUAL_DEPOSIT] Success - Deposit ID:", deposit[0].id, "User:", normalizedUserId, "Amount:", numAmount);
    
    res.status(201).json({ 
      success: true, 
      deposit: deposit[0],
      message: "Deposit added successfully"
    });
  } catch (error: any) {
    console.error("[MANUAL_DEPOSIT] Error:", error);
    
    // Return more specific error messages
    let errorMessage = "Failed to add deposit";
    if (error.code === "23505") {
      errorMessage = "Duplicate deposit reference";
    } else if (error.code === "23503") {
      errorMessage = "User not found";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ error: errorMessage });
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
