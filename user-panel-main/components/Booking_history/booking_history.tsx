"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface BookingHistoryData {
  _id: string;
  userId: string;
  type: string;
  balBefore: string;
  balAfter: string;
  amount: number;
  field: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const BookingHistory = () => {
  const router = useRouter();
  const [bookingHistory, setBookingHistory] = useState<BookingHistoryData[]>(
    []
  );

  const fetchBookingHistoryData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/get-booking-history`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setBookingHistory(response.data.result.data);
      } else {
        console.error("Failed to load booking history.");
      }
    } catch (error) {
      console.error("An error occurred while fetching booking history.");
    }
  };

  useEffect(() => {
    fetchBookingHistoryData();
  }, []);

  return (
    <div>
      <div>
        <div className="container mx-auto bg-[#ec742b] py-3">
          <div className="text-center flex items-center justify-center mx-2 text-white font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6 mx-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>
            <p>Book Now & Earn Rewards</p>
          </div>
        </div>
        <div className="bg-gray-200 shadow py-5 container mx-auto">
          <div className="lg:w-5/6 md:w-5/6 w-full mx-auto ">
            <div className="flex justify-start items-center">
              <button
                onClick={() => {
                  router.back();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6 text-black"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <p className="mx-2 text-lg text-black font-semibold">
                Booking History
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:w-5/6 md:w-5/6 w-full py-10 mx-auto">
        <div className="text-gray-900 bg-gray-200 rounded-xl">
          <div className="p-4 flex">
            <h1 className="text-3xl">Booking History</h1>
          </div>
          <div className="px-3 pt-2 py-4 flex justify-center">
            <table className="lg:w-full md:w-full w-5/4 text-md bg-white shadow-md rounded mb-4">
              <tbody>
                <tr className="border-b">
                  <th className="text-right p-3 px-5">Date</th>
                  <th className="text-right p-3 px-5">Type</th>
                  <th className="text-right p-3 px-5">Balance Before Change</th>
                  <th className="text-right p-3 px-5">Amount</th>
                </tr>
                {bookingHistory.map((booking) => (
                  <tr
                    className="border-b hover:bg-orange-100 bg-gray-100"
                    key={booking._id}
                  >
                    <td className="p-3 px-5 text-right">
                      {new Date(booking.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 px-5 text-right">{booking.type}</td>
                    <td className="p-3 px-5 text-right">₹{Math.round(parseFloat(booking.balBefore))}</td>
                    {booking.type == "RATING_PRINCIPLE" ? (
                      <td className="text-red-500 font-semibold p-3 px-5 text-right">
                        -₹{Math.round(booking.amount)}
                      </td>
                    ) : (
                      <td className="text-green-500 font-semibold p-3 px-5 text-right">
                        +₹{Math.round(booking.amount)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
