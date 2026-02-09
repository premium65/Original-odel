"use client";
import Link from "next/link";
import React, { useState } from "react";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { useRecoilState } from "recoil";
import { siteSettingAtom } from "@/state/siteSettingAtom";
import { useRouter } from "next/navigation";
const Crypto = () => {
  const router = useRouter();
  const [isFirstModalOpen, setIsFirstModalOpen] = useState<boolean>(false);
  const [siteSettingData, setSiteSettingData] = useRecoilState(siteSettingAtom);
  const openFirstModal = () => {
    setIsFirstModalOpen(true);
  };

  const closeFirstModal = () => {
    setIsFirstModalOpen(false);
  };
  return (
    <div>
      <div>
        <div className="container mx-auto bg-[#ec742b] py-3">
          <div className="text-center flex items-center justify-center mx-2 text-white font-semibold">
            <a href="">
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
            </a>
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
                  className="w-6 h-6 text-black"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <p className="mx-2  text-lg text-black font-semibold">
                Crypto Deposit
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white py-10  ">
          <div className=" w-5/6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <form className="border-2 p-5 rounded-xl">
                <div>
                  <label className="block  text-[#666]">Select Crypto</label>
                  <select
                    id="countries"
                    required
                    className="shadow-inner bg-gray-100 text-[#666] rounded-lg   p-4 border-none block mt-1 w-full"
                  >
                    <option selected value="BTC">
                      BTC
                    </option>
                    <option value="ETH">ETH</option>
                    <option value="SOL">SOL</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label className="block text-[#666]">Enter Amount</label>
                  <input
                    className="shadow-inner bg-gray-100 rounded-lg text-[#666]   p-4 border-none block mt-1 w-full"
                    id="amount"
                    type="number"
                    required
                    placeholder="Enter Amount"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-[#666]">
                    Enter your transaction hash
                  </label>
                  <input
                    className=" shadow-inner bg-gray-100 rounded-lg text-[#666]  p-4 border-none block mt-1 w-full"
                    id="transaction"
                    type="number"
                    required
                    placeholder="Enter your transaction hash"
                  />
                </div>

                <div className="mt-3">
                  <button
                    onClick={openFirstModal}
                    type="button"
                    className="px-8 py-3 text-white font-semibold rounded bg-[#e2b771]"
                  >
                    Deposit
                  </button>
                  <Modal
                    isOpen={isFirstModalOpen}
                    onOpenChange={(open: boolean) =>
                      open ? openFirstModal() : closeFirstModal()
                    }
                    placement="center"
                  >
                    <ModalContent>
                      <ModalBody>
                        <div className="bg-white  ">
                          <div className="container mx-auto py-5 dark:text-white">
                            <div className="flex mt-5 items-center justify-center">
                              <div className="flex w-fit rounded-full mx-2 bg-gradient-to-tr from-red-400 via-orange-400 to-rose-400 p-1 shadow-lg">
                                <a href={`${siteSettingData?.telegramLink}`}>
                                  {" "}
                                  <button className="flex-1 font-bold text-xl bg-white text-black px-6 py-1 rounded-full">
                                    Telegram
                                  </button>
                                </a>
                              </div>
                              <div className="flex w-fit rounded-full mx-2 bg-gradient-to-tr from-red-400 via-orange-400 to-rose-400 p-1 shadow-lg">
                                <a href={`${siteSettingData?.whatsappLink}`}>
                                  <button className="flex-1 font-bold text-xl bg-white text-black px-6 py-1 rounded-full">
                                    Whatsapp
                                  </button>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ModalBody>
                    </ModalContent>
                  </Modal>
                </div>
              </form>

              <aside className="">
                <div className="bg-gray-100 p-8 rounded-xl">
                  <h2 className="font-bold text-lg">Notes</h2>
                  <ul className="list-disc text-sm text-black mt-4 list-inside">
                    <li>
                      1.Users can choose What’sapp and telegram option for own
                      topup and recharges.
                    </li>
                    <li>
                      2.After making the transfer according to the account
                      provided by the customer service of the platform, be sure
                      to submit the receipt of successful transfer or other
                      relevant screenshots to the account for system
                      verification purpose.
                    </li>
                    <li>
                      3. After confirming your request for deposit , it takes
                      time for the transaction to be confirmed on the
                      blockchain. The confirmation time varies depending on the
                      blockchain and its current network traffic.
                    </li>
                    <li>
                      4. The transfer should be done within the time given by
                      the respective customer support.
                    </li>
                    <li>
                      5.Please make sure that the selected network matches the
                      network of the platform you are withdrawing funds from. If
                      you select the wrong network, your funds might be lost and
                      cannot be recovered.
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Crypto;
