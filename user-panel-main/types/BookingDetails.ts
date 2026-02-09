export interface BookingData {
    _id: string;
    commissionFee: number;
    name: string;
    price: number;
    description: string;
    locationImage: string;
    landScapeImage: string;
    hotelImages: string[]; // since it's an array of strings
    count: number;
    taskNo: number;
    checkIn: CheckIn;
    checkOut: CheckOut;
    rooms: number;
    guests: number;
    createdAt: Date;
    updatedAt: Date;
  }
  interface CheckIn {
    day: number;
    month: string;
  }
  
  interface CheckOut {
    day: number;
    month: string;
  }
  