"use client";

import React, { useState, useEffect, useRef } from "react";
import WithdrawTable from "../Withdrawtable/withdraw-table";
import DepositTable from "../Deposit-table/deposit-table";
import { useRecoilValue } from "recoil";
import { walletAtom } from "@/state/walletAtom";
import { userAtom } from "@/state/userAtom";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { option } from "framer-motion/client";
const Wallet = () => {
  const router = useRouter();
  const userData = useRecoilValue(userAtom);
  const walletData = useRecoilValue(walletAtom);
  const [filter, setFilter] = useState<string>("");
  const [transactionData, setTransactionData] = useState<string>("");

  const fetchTransactionHistoryData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/wallet/get-transaction-history?filter=${filter}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setTransactionData(response.data.result.data);
      } else {
        console.error("Failed to load users data.");
      }
    } catch (error) {
      console.error("An error occurred while fetching users data.");
    }
  };

  useEffect(() => {
    fetchTransactionHistoryData();
  }, [filter]);
  return (
    <div>
      <div>
        <div className="container mx-auto bg-[#ec742b] py-3">
          <div className="text-center flex items-center justify-center mx-2 text-white font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="size-6 mx-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>

            <p>Book Now & Earn Rewards</p>
          </div>
        </div>
        <div className="bg-gray-200 shadow  py-5 container mx-auto">
          <div className="w-5/6 mx-auto ">
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
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6 text-black"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <p className="mx-2  text-lg text-black font-semibold">Wallet</p>
            </div>
          </div>
        </div>
        <div className="bg-white  ">
          <div className="container mx-auto py-16 text-black">
            <div className="text-center">
              <h2 className="font-bold text-2xl md:text-4xl my-4">
                Task Count : {userData?.taskCount}
              </h2>
              <div className="text-sm md:text-base max-w-2xl md:max-w-4xl mx-auto text-black">
                <p>
                  The reservation information is displayed in detail for your
                  viewing
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 mx-auto max-w-xl md:max-w-2xl gap-4 my-4">
              <div className="p-4 border flex flex-col items-center rounded max-w-sm text-black">
                <div className="text-lg md:text-2xl lg:text-4xl font-bold">
                  ₹ {Math.round(walletData?.levelBonus ?? 0)}
                </div>
                <div className="text-sm md:text-base text-300 text-uppercase">
                  Trial Bonus
                </div>
              </div>
              <div className="p-4 border flex flex-col items-center rounded max-w-sm text-black">
                <div className="text-lg md:text-2xl lg:text-4xl font-bold">
                  ₹ {Math.round(walletData?.totalBalance ?? 0)}
                </div>
                <div className="text-sm md:text-base text-300 text-uppercase">
                  Balance
                </div>
              </div>
              <div className="p-4 border flex flex-col items-center rounded max-w-sm text-black">
                <div className="text-lg md:text-2xl lg:text-4xl font-bold">
                  ₹ {Math.round(walletData?.totalCommission ?? 0)}
                </div>
                <div className="text-sm md:text-base text-300 text-uppercase">
                  Today commission
                </div>
              </div>
              <div className="p-4 border flex flex-col items-center rounded max-w-sm text-black">
                <div className="text-lg md:text-2xl lg:text-4xl font-bold">
                  ₹ {Math.round(walletData?.pendingAmount ?? 0)}
                </div>
                <div className="text-sm md:text-base text-300 text-uppercase">
                  Pending Amount
                </div>
              </div>
            </div>
            <div className="flex mt-5 items-center justify-center">
              <div className="flex w-fit rounded-full mx-2 bg-gradient-to-tr from-red-400 via-orange-400 to-rose-400 p-1 shadow-lg">
                <a href="/deposit">
                  {" "}
                  <button className="flex-1 font-bold text-sm md:text-base lg:text-xl text-black bg-white px-6 py-1 rounded-full">
                    Deposit
                  </button>
                </a>
              </div>
              <div className="flex w-fit rounded-full mx-2 bg-gradient-to-tr from-red-400 via-orange-400 to-rose-400 p-1 shadow-lg">
                <a href="/withdraw">
                  <button className="flex-1 font-bold text-sm md:text-base lg:text-xl text-black bg-white px-6 py-1 rounded-full">
                    Withdraw
                  </button>
                </a>
              </div>
            </div>
            <div className=" mx-auto max-w-xl md:max-w-2xl gap-4 my-4">
              <div className="p-2 border flex  flex-col items-center rounded  bg-white">
                <div className="flex pb-4 items-center w-full justify-between">
                  <div className="">
                    <div className="text-lg md:text-2xl lg:text-4xl text-black font-bold">
                      ₹ {Math.round(walletData?.levelBonus ?? 0)}
                    </div>
                    <div className="text-sm md:text-base text-300 text-black text-uppercase">
                      Trial Bonus
                    </div>
                  </div>
                  <div className="">
                    <form className="max-w-sm mx-auto">
                      <select
                        id="countries"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5   "
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="" selected>
                          Select
                        </option>
                        <option value="withdraw">Withdraw</option>
                        <option value="deposit">Deposit</option>
                      </select>
                    </form>
                  </div>
                </div>
                {!filter ? (
                  <div className="text-center border-t-2 text-black p-4 w-full">
                    <p>There is no Data</p>
                  </div>
                ) : filter === "withdraw" ? (
                  <div className="w-full">
                    <WithdrawTable filter={filter} />
                  </div>
                ) : (
                  <div className="w-full">
                    <DepositTable filter={filter} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
