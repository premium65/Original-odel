import { Router } from "express";
import { db } from "../../db";
import { users, transactions, ads, adViews, withdrawals, deposits } from "@shared/schema";
import { eq, sql, desc, and, gte } from "drizzle-orm";

const router = Router();

// Get dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const activeUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.status, "active"));
    const pendingUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.status, "pending"));

    const totalDeposits = await db.select({ sum: sql<number>`coalesce(sum(${deposits.amount}), 0)` }).from(deposits).where(eq(deposits.status, "approved"));
    const totalWithdrawals = await db.select({ sum: sql<number>`coalesce(sum(${withdrawals.amount}), 0)` }).from(withdrawals).where(eq(withdrawals.status, "approved"));
    const pendingWithdrawals = await db.select({ sum: sql<number>`coalesce(sum(${withdrawals.amount}), 0)` }).from(withdrawals).where(eq(withdrawals.status, "pending"));

    const totalAdViews = await db.select({ count: sql<number>`count(*)` }).from(adViews);
    const totalCommission = await db.select({ sum: sql<number>`coalesce(sum(${adViews.reward}), 0)` }).from(adViews);

    const activeAds = await db.select({ count: sql<number>`count(*)` }).from(ads).where(eq(ads.isActive, true));

    res.json({
      totalUsers: totalUsers[0].count,
      activeUsers: activeUsers[0].count,
      pendingUsers: pendingUsers[0].count,
      totalDeposits: totalDeposits[0].sum,
      totalWithdrawals: totalWithdrawals[0].sum,
      pendingWithdrawals: pendingWithdrawals[0].sum,
      totalAdViews: totalAdViews[0].count,
      totalCommission: totalCommission[0].sum,
      activeAds: activeAds[0].count
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get recent activity
router.get("/recent", async (req, res) => {
  try {
    const recentTransactions = await db.select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      status: transactions.status,
      createdAt: transactions.createdAt,
      username: users.username
    }).from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .orderBy(desc(transactions.createdAt))
      .limit(10);

    const recentUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      status: users.status,
      createdAt: users.createdAt
    }).from(users).orderBy(desc(users.createdAt)).limit(5);

    res.json({ recentTransactions, recentUsers });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get chart data (last 7 days)
router.get("/chart", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await db.select({
      date: sql<string>`date(${transactions.createdAt})`,
      deposits: sql<number>`sum(case when ${transactions.type} = 'deposit' then ${transactions.amount} else 0 end)`,
      withdrawals: sql<number>`sum(case when ${transactions.type} = 'withdraw' then ${transactions.amount} else 0 end)`,
      commissions: sql<number>`sum(case when ${transactions.type} = 'commission' then ${transactions.amount} else 0 end)`
    }).from(transactions)
      .where(gte(transactions.createdAt, sevenDaysAgo))
      .groupBy(sql`date(${transactions.createdAt})`)
      .orderBy(sql`date(${transactions.createdAt})`);

    res.json(dailyStats);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
