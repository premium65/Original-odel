import { getUsersCollection, getDb } from "./mongoConnection";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  fullName: string;
  mobileNumber: string;
  status: string;
  isAdmin: number;
  destinationAmount: string;
  milestoneAmount: string;
  milestoneReward: string;
  ongoingMilestone: string;
  totalAdsCompleted: number;
  points: number;
  restrictionAdsLimit: number | null;
  restrictionDeposit: string | null;
  restrictionCommission: string | null;
  restrictedAdsCompleted: number;
  bankName: string | null;
  accountNumber: string | null;
  accountHolderName: string | null;
  branchName: string | null;
  createdAt: Date;
}

// Get settings collection
function getSettingsCollection() {
  const db = getDb();
  return db.collection("settings");
}

export class MongoStorage {
  // ============ USER QUERIES ============
  async getUserByUsername(username: string): Promise<User | null> {
    const collection = getUsersCollection();
    return (await collection.findOne({ username })) as User | null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const collection = getUsersCollection();
    return (await collection.findOne({ email })) as User | null;
  }

  async getUser(userId: string): Promise<User | null> {
    const collection = getUsersCollection();
    try {
      return (await collection.findOne({ _id: new ObjectId(userId) })) as User | null;
    } catch (e) {
      return (await collection.findOne({ id: parseInt(userId) })) as User | null;
    }
  }

  async createUser(userData: Omit<User, "_id">): Promise<User> {
    const collection = getUsersCollection();
    const result = await collection.insertOne({
      ...userData,
      destinationAmount: userData.destinationAmount || "0",
      milestoneAmount: userData.milestoneAmount || "0",
      milestoneReward: userData.milestoneReward || "0",
      ongoingMilestone: userData.ongoingMilestone || "0",
      totalAdsCompleted: userData.totalAdsCompleted || 0,
      points: userData.points || 0,
      restrictionAdsLimit: null,
      restrictionDeposit: null,
      restrictionCommission: null,
      restrictedAdsCompleted: 0,
      createdAt: new Date(),
    });
    return { ...userData, _id: result.insertedId, createdAt: new Date() } as User;
  }

  async getAllUsers(): Promise<User[]> {
    const collection = getUsersCollection();
    return (await collection.find({}).sort({ createdAt: -1 }).toArray()) as User[];
  }

  // ============ USER STATUS ============
  async updateUserStatus(userId: string, status: string): Promise<User | null> {
    const collection = getUsersCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { status } },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  // ============ GENERAL UPDATE ============
  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const collection = getUsersCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updates },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  // ============ PASSWORD ============
  async updateUserPassword(userId: string, newPassword: string): Promise<User | null> {
    const collection = getUsersCollection();
    const hashedPassword = await hashPassword(newPassword);
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword } },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  // ============ MILESTONE AMOUNTS ============
  async addMilestoneAmount(userId: string, amount: string): Promise<User | null> {
    const collection = getUsersCollection();
    const user = await this.getUser(userId);
    if (!user) return null;
    
    const currentAmount = parseFloat(user.milestoneAmount || "0");
    const newAmount = currentAmount + parseFloat(amount);
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { milestoneAmount: newAmount.toFixed(2) } },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  async addMilestoneReward(userId: string, amount: string): Promise<User | null> {
    const collection = getUsersCollection();
    const user = await this.getUser(userId);
    if (!user) return null;
    
    const currentAmount = parseFloat(user.milestoneReward || "0");
    const newAmount = currentAmount + parseFloat(amount);
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { milestoneReward: newAmount.toFixed(2) } },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  async addDestinationAmount(userId: string, amount: string): Promise<User | null> {
    const collection = getUsersCollection();
    const user = await this.getUser(userId);
    if (!user) return null;
    
    const currentAmount = parseFloat(user.destinationAmount || "0");
    const newAmount = currentAmount + parseFloat(amount);
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { destinationAmount: newAmount.toFixed(2) } },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  // ============ RESET FIELDS ============
  async resetDestinationAmount(userId: string): Promise<User | null> {
    const collection = getUsersCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { destinationAmount: "0" } },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  async resetUserField(userId: string, field: string): Promise<User | null> {
    const collection = getUsersCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { [field]: field === "points" || field === "totalAdsCompleted" ? 0 : "0" } },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  // ============ ADD FIELD VALUE (Premium Manage) ============
  async addUserFieldValue(userId: string, field: string, amount: string): Promise<User | null> {
    const collection = getUsersCollection();
    const user = await this.getUser(userId);
    if (!user) return null;

    let newValue: any;
    const numAmount = parseFloat(amount);

    switch (field) {
      case "points":
        newValue = Math.min(100, (user.points || 0) + numAmount);
        break;
      case "milestoneAmount":
      case "bookingValue":
        newValue = (parseFloat(user.milestoneAmount || "0") + numAmount).toFixed(2);
        field = "milestoneAmount";
        break;
      case "milestoneReward":
      case "premiumTreasure":
        newValue = (parseFloat(user.milestoneReward || "0") + numAmount).toFixed(2);
        field = "milestoneReward";
        break;
      case "destinationAmount":
      case "normalTreasure":
        newValue = (parseFloat(user.destinationAmount || "0") + numAmount).toFixed(2);
        field = "destinationAmount";
        break;
      case "ongoingMilestone":
        newValue = (parseFloat(user.ongoingMilestone || "0") + numAmount).toFixed(2);
        break;
      default:
        newValue = numAmount;
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { [field]: newValue } },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  // ============ RESTRICTION / PROMOTION ============
  async setUserRestriction(userId: string, adsLimit: number, deposit: string, commission: string, pendingAmount?: string): Promise<User | null> {
    const collection = getUsersCollection();
    const user = await this.getUser(userId);
    if (!user) return null;

    const currentMilestone = parseFloat(user.milestoneAmount || "0");
    const depositAmount = parseFloat(deposit);
    const newMilestoneAmount = (currentMilestone - depositAmount).toFixed(2);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          restrictionAdsLimit: adsLimit,
          restrictionDeposit: deposit,
          restrictionCommission: commission,
          restrictedAdsCompleted: 0,
          ongoingMilestone: pendingAmount || deposit,
          milestoneAmount: newMilestoneAmount,
        },
      },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  async removeUserRestriction(userId: string): Promise<User | null> {
    const collection = getUsersCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          restrictionAdsLimit: null,
          restrictionDeposit: null,
          restrictionCommission: null,
          restrictedAdsCompleted: 0,
          ongoingMilestone: "0",
        },
      },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  async incrementRestrictedAds(userId: string): Promise<User | null> {
    const collection = getUsersCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $inc: { restrictedAdsCompleted: 1 } },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  // ============ ADS ============
  async incrementAdsCompleted(userId: string): Promise<User | null> {
    const collection = getUsersCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $inc: { totalAdsCompleted: 1 } },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  async getUserAdClickCount(userId: string): Promise<number> {
    const user = await this.getUser(userId);
    return user?.totalAdsCompleted || 0;
  }

  // ============ USER DETAILS ============
  async updateUserDetails(userId: string, details: { username?: string; mobileNumber?: string; password?: string }): Promise<User | null> {
    const collection = getUsersCollection();
    const updates: any = {};

    if (details.username) updates.username = details.username;
    if (details.mobileNumber) updates.mobileNumber = details.mobileNumber;
    if (details.password) updates.password = await hashPassword(details.password);

    if (Object.keys(updates).length === 0) return this.getUser(userId);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updates },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  // ============ BANK DETAILS ============
  async updateUserBankDetails(userId: string, bankDetails: { bankName?: string; accountNumber?: string; accountHolderName?: string; branchName?: string }): Promise<User | null> {
    const collection = getUsersCollection();
    const updates: any = {};

    if (bankDetails.bankName !== undefined) updates.bankName = bankDetails.bankName;
    if (bankDetails.accountNumber !== undefined) updates.accountNumber = bankDetails.accountNumber;
    if (bankDetails.accountHolderName !== undefined) updates.accountHolderName = bankDetails.accountHolderName;
    if (bankDetails.branchName !== undefined) updates.branchName = bankDetails.branchName;

    if (Object.keys(updates).length === 0) return this.getUser(userId);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updates },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  // ============ ADMIN TOGGLE ============
  async toggleAdmin(userId: string, isAdmin: number): Promise<User | null> {
    const collection = getUsersCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { isAdmin } },
      { returnDocument: "after" }
    );
    return result as User | null;
  }

  // ============================================================
  // SETTINGS STORAGE (MongoDB - PERSISTENT!)
  // ============================================================
  
  async getSettings(category: string): Promise<any[]> {
    try {
      const collection = getSettingsCollection();
      const settings = await collection.find({ category }).toArray();
      return settings;
    } catch (error) {
      console.error(`Error getting ${category} settings:`, error);
      return [];
    }
  }

  async saveSettings(category: string, type: string, data: any): Promise<boolean> {
    try {
      const collection = getSettingsCollection();
      await collection.updateOne(
        { category, type },
        { 
          $set: { 
            category,
            type,
            data,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
      return true;
    } catch (error) {
      console.error(`Error saving ${category} settings:`, error);
      return false;
    }
  }

  async deleteSettings(category: string, type: string): Promise<boolean> {
    try {
      const collection = getSettingsCollection();
      await collection.deleteOne({ category, type });
      return true;
    } catch (error) {
      console.error(`Error deleting ${category} settings:`, error);
      return false;
    }
  }

  // Slideshow specific
  async getSlideshow(): Promise<any[]> {
    try {
      const collection = getSettingsCollection();
      const slides = await collection.find({ category: "slideshow" }).sort({ createdAt: -1 }).toArray();
      return slides.map(s => ({ ...s.data, id: s._id.toString() }));
    } catch (error) {
      console.error("Error getting slideshow:", error);
      return [];
    }
  }

  async addSlide(slideData: any): Promise<any> {
    try {
      const collection = getSettingsCollection();
      const result = await collection.insertOne({
        category: "slideshow",
        type: "slide",
        data: slideData,
        createdAt: new Date()
      });
      return { ...slideData, id: result.insertedId.toString() };
    } catch (error) {
      console.error("Error adding slide:", error);
      return null;
    }
  }

  async updateSlide(slideId: string, slideData: any): Promise<any> {
    try {
      const collection = getSettingsCollection();
      await collection.updateOne(
        { _id: new ObjectId(slideId) },
        { $set: { data: slideData, updatedAt: new Date() } }
      );
      return { ...slideData, id: slideId };
    } catch (error) {
      console.error("Error updating slide:", error);
      return null;
    }
  }

  async deleteSlide(slideId: string): Promise<boolean> {
    try {
      const collection = getSettingsCollection();
      await collection.deleteOne({ _id: new ObjectId(slideId) });
      return true;
    } catch (error) {
      console.error("Error deleting slide:", error);
      return false;
    }
  }
}

export const mongoStorage = new MongoStorage();
