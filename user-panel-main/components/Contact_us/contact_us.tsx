"use client";
import { siteSettingAtom } from "@/state/siteSettingAtom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useRecoilState } from "recoil";

const Contact_us = () => {
  const router = useRouter()
  const [siteSettingData, setSiteSettingData] = useRecoilState(siteSettingAtom);
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
              className="size-6 mx-2text-black"
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
          <div className="lg:w-5/6 md:w-5/6 w-full mx-auto ">
            <div className="flex justify-start items-center">
              <button onClick={() => {router.back()}}>
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
              <p className="mx-2  text-lg text-black font-semibold">
                Customer Service
              </p>
            </div>
          </div>
        </div>
        <div className="mt-20 bg-white shadow-xl  lg:w-1/2 md:w-full w-full mx-auto rounded-xl p-10">
          <div className="text-2xl font-bold text-center text-black">
            <p>Choose your Service</p>
          </div>
          <div className="flex flex-col md:flex-row mt-5 items-center justify-center">
            <div className="transform   transition duration-300 hover:scale-105">
              <a href={`${siteSettingData?.telegramLink}`}>
                <Image
                  src="/images/telegram.png"
                  style={{ width: "100%", margin: "auto", height: "auto" }}
                  width={200}
                  height={200}
                  className=""
                  alt=""
                />
              </a>
            </div>
            <div className="transform   transition duration-300 hover:scale-105">
              <a href={`${siteSettingData?.whatsappLink}`}>
                <Image
                  src="/images/whatsapp.png"
                  style={{ width: "100%", margin: "auto", height: "auto" }}
                  width={200}
                  height={200}
                  className=""
                  alt=""
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact_us;
