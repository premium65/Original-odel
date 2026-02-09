"use client"
import { useRouter } from "next/navigation";
import React from "react";

const Deposit = () => {
  const router = useRouter();
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
              }}>
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
              <p className="mx-2  text-lg text-black font-semibold">Deposit</p>
            </div>
          </div>
        </div>
        <div className="bg-white">
          <div className="container mx-auto py-5 dark:text-white">
            <div className="flex mt-5 items-center justify-center">
              <div className="flex w-fit rounded-full mx-2 bg-gradient-to-tr from-red-400 via-orange-400 to-rose-400 p-1 shadow-lg">
                <a href="/deposit_crypto">
                  {" "}
                  <button className="flex-1 text-black font-bold text-xl bg-white px-6 py-1 rounded-full">
                    Crypto
                  </button>
                </a>
              </div>
              <div className="flex w-fit rounded-full text-black mx-2 bg-gradient-to-tr from-red-400 via-orange-400 to-rose-400 p-1 shadow-lg">
                <a href="/deposit-fiat">
                  <button className="flex-1 font-bold text-xl bg-white px-6 py-1 rounded-full">
                    Bank
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
