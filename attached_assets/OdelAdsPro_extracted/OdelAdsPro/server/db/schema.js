import { db } from "./connection.js";

export async function initDB() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT,
      email TEXT UNIQUE,
      mobile TEXT,
      userCode TEXT UNIQUE,
      password TEXT,
      isApproved INTEGER DEFAULT 0,
      isFrozen INTEGER DEFAULT 0,
      destinationAmount REAL DEFAULT 25000,
      milestoneAmount REAL DEFAULT 0,
      milestoneReward REAL DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      adCode TEXT,
      url TEXT,
      image TEXT,
      reward REAL DEFAULT 101.75
    );

    CREATE TABLE IF NOT EXISTS ad_clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      adId INTEGER,
      clickedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS withdrawals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      amount REAL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS deposits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      amount REAL,
      slip TEXT,
      status TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      type TEXT,
      amount REAL,
      note TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );
  `);

  console.log("📦 Database ready!");
}
