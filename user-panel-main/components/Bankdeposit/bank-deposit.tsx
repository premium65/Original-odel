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
import { walletAtom } from "@/state/walletAtom";
import { useRouter } from "next/navigation";

const Bankdeposit: React.FC = () => {
  const router = useRouter();
  const [amount, setAmount] = useState<string>(""); // amount as string
  const [isFirstModalOpen, setIsFirstModalOpen] = useState<boolean>(false);
  const [walletData, setWalletData] = useRecoilState(walletAtom);
  const [siteSettingData, setSiteSettingData] = useRecoilState(siteSettingAtom);
  const availableBalance = walletData?.totalBalance;

  const handleAmountClick = (value: number) => {
    setAmount(value.toString());
  };

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
            <Link href="">
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
            </Link>
            <p>Book Now & Earn Rewards</p>
          </div>
        </div>
        <div className="bg-gray-200 shadow py-5 container mx-auto">
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
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 text-black"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <p className="mx-2 text-lg text-black font-semibold">
                Bank Deposit
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white py-10 ">
          <div className="w-5/6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <form className="border-2 p-5 rounded-xl">
                <div className="text-lg pb-3 flex items-center justify-between font-bold text-black">
                  <p>Account Available Balance</p>
                  <p>₹{Math.round(availableBalance ?? 0)}</p>
                </div>
                <div className="mt-4">
                  <label className="block text-[#666]">Deposit Amount</label>
                  <input
                    className="shadow-inner bg-gray-100 rounded-full text-[#666] p-4 border-none block mt-1 w-full"
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="pt-4">
                    <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4">
                      {[
                        10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000,
                      ].map((value, index) => (
                        <div
                          key={index}
                          className="hover:bg-[#ec742b] border-2 text-[#aeaeae] border-[#aeaeae] text-sm hover:text-white font-semibold text-center rounded-xl p-3 cursor-pointer"
                          onClick={() => handleAmountClick(value)}
                        >
                          <p>₹{value.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="block font-semibold text-[#666]">
                    Selected Amount: ₹{amount}
                  </p>
                </div>

                <div className="mt-3">
                  <button
                    onClick={openFirstModal}
                    type="button"
                    className="px-8 py-3 text-white font-semibold rounded bg-[#e2b771]"
                    disabled={!amount}
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
                          <div className="container mx-auto py-5 text-black">
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

              <div className="bg-gray-100 p-8 rounded-xl">
                <h2 className="font-bold text-black text-lg">Notes</h2>
                <ul className="list-disc text-sm text-black mt-4 list-inside">
                  <li>
                    1. Users can choose WhatsApp and Telegram for top-ups and
                    recharges.
                  </li>
                  <li>
                    2. Submit transfer receipts or relevant screenshots for
                    system verification.
                  </li>
                  <li>
                    3. Confirmation time varies based on blockchain traffic.
                  </li>
                  <li>4. Complete the transfer within the specified time.</li>
                  <li>
                    5. Ensure the selected network matches the platform's
                    network.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bankdeposit;
