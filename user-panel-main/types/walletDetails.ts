export interface WalletData {
  _id: string; // Refers to the user collection _id
  userCode: string;
  level: string;
  levelBonus: number;
  totalBalance: number;
  todayCommission: number;
  totalCommission: number;
  pendingAmount: number;
  totalWithdraw: number;
  totalDeposit: number;
  createdAt: Date;
  updatedAt: Date;
  }
  