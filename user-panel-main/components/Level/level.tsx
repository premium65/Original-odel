"use client";
import React from "react";
import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
const Level = () => {
  const router = useRouter();
  const [isFirstModalOpen, setFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setSecondModalOpen] = useState(false);
  const [isThirdModalOpen, setThirdModalOpen] = useState(false);
  const [isFourModalOpen, setFourModalOpen] = useState(false);
  const [isFiveModalOpen, setFiveModalOpen] = useState(false);
  const [isSixModalOpen, setSixModalOpen] = useState(false);
  const openFirstModal = () => setFirstModalOpen(true);
  const openSecondModal = () => setSecondModalOpen(true);
  const openThirdModal = () => setThirdModalOpen(true);
  const openFourModal = () => setFourModalOpen(true);
  const openFiveModal = () => setFiveModalOpen(true);
  const openSixModal = () => setSixModalOpen(true);
  const closeFirstModal = () => {
    setFirstModalOpen(false);
  };
  const closeSecondModal = () => {
    setSecondModalOpen(false);
  };
  const closeThirdModal = () => {
    setThirdModalOpen(false);
  };
  const closeFourModal = () => {
    setFourModalOpen(false);
  };
  const closeFiveModal = () => {
    setFiveModalOpen(false);
  };
  const closeSixModal = () => {
    setSixModalOpen(false);
  };

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
              <p className="mx-2  text-lg text-black font-semibold">Level</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white pt-10 pb-[100px] flex justify-center items-center">
        <div className="space-y-16">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            <Button onPress={openFirstModal} className="w-full h-auto no-bg">
              <div
                className="lg:w-[24rem] md:w-[22rem] w-[18rem] cursor-pointer lg:h-[16rem] md:h-[12rem] h-[10rem] m-auto bg-[radial-gradient(346.87%_97.15%_at_2.85%_47.78%,_#1d012d1a_0%,_#8e40c14d_56.25%,_#8039af4d_100%)]
             rounded-xl relative text-white shadow-2xl transition-transform transform hover:scale-110"
              >
                <div className="w-full px-8 absolute top-8">
                  <div className="flex relative justify-between">
                    <div className="">
                      <Image
                        src="/images/go.png"
                        width={200}
                        height={200}
                        className="lg:w-auto md:w-auto w-auto lg:h-14 md:h-12 h-10"
                        alt=""
                      />
                    </div>
                    <div className="absolute right-0">
                      <Image
                        src="/images/build.png"
                        width={200}
                        height={200}
                        className="lg:w-[180px] md:w-[130px] w-[100px] lg:h-[180px] md:h-[130px] h-[100px]"
                        alt=""
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="font-bold text-black text-left lg:text-xl md:text-xl text-lg">
                      Trial Card
                    </p>
                  </div>
                  <div className="lg:pt-6 md:pt-4 pt-2 pr-6">
                    <div className="flex justify-between">
                      <div className="text-black">
                        <p className="lg:text-lg md:text-lg text-sm font-regular">
                          No 1
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Button>
            <Modal
              isOpen={isFirstModalOpen}
              className="p-5"
              onOpenChange={(open: any) =>
                open ? openFirstModal() : closeFirstModal()
              }
              placement="center"
            >
              <ModalContent>
                {(onClose: any) => (
                  <>
                    <ModalHeader className="flex border-b-2 lg:text-2xl md:text-xl text-lg  pb-2 flex-col gap-1 text-black">
                      Trial Card
                    </ModalHeader>
                    <ModalBody>
                      <div className="flex items-center justify-between text-black">
                        <div className="">
                          <p className="font-semibold">
                            The commission rate is:
                          </p>
                        </div>
                        <div className="">
                          <p>1%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-black">
                        <div className="">
                          <p className="font-semibold">Number of ratings:</p>
                        </div>
                        <div className="">
                          <p>30 ratings</p>
                        </div>
                      </div>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
            <Button onPress={openSecondModal} className="w-full h-auto no-bg">
              <div
                className="lg:w-[24rem] md:w-[22rem] w-[18rem] cursor-pointer lg:h-[16rem] md:h-[12rem] h-[10rem] m-auto bg-[radial-gradient(346.87%_97.15%_at_2.85%_47.78%,_#88a0c9bf_0%,_#8a94c7bf_47.4%,_#dbe1febf_92.71%)]
             rounded-xl relative text-white shadow-2xl transition-transform transform hover:scale-110"
              >
                <div className="w-full px-8 absolute top-8">
                  <div className="flex relative justify-between">
                    <div className="">
                      <Image
                        src="/images/go.png"
                        width={200}
                        height={200}
                        className="lg:w-auto md:w-auto w-auto lg:h-14 md:h-12 h-10"
                        alt=""
                      />
                    </div>
                    <div className="absolute right-0">
                      <Image
                        src="/images/build.png"
                        width={200}
                        height={200}
                        className="lg:w-[180px] md:w-[130px] w-[100px] lg:h-[180px] md:h-[130px] h-[100px]"
                        alt=""
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="font-bold text-black text-left lg:text-xl md:text-xl text-lg">
                      Sapphire Card
                    </p>
                  </div>
                  <div className="lg:pt-6 md:pt-4 pt-2 pr-6">
                    <div className="flex justify-between">
                      <div className="text-black">
                        <p className="text-lg font-regular">No 2</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Button>
            <Modal
              isOpen={isSecondModalOpen}
              className="p-5"
              onOpenChange={(open: any) =>
                open ? openSecondModal() : closeSecondModal()
              }
              placement="center"
            >
              <ModalContent>
                {(onClose: any) => (
                  <>
                    <ModalHeader className="flex border-b-2 text-2xl  pb-2 flex-col gap-1 text-black">
                      Sapphire card
                    </ModalHeader>
                    <ModalBody>
                      <div className="flex items-center justify-between text-black">
                        <div className="">
                          <p className="font-semibold">
                            The commission rate is:
                          </p>
                        </div>
                        <div className="">
                          <p>1.1%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-black">
                        <div className="">
                          <p className="font-semibold">Number of ratings:</p>
                        </div>
                        <div className="">
                          <p>30 ratings</p>
                        </div>
                      </div>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
            <Button onPress={openThirdModal} className="w-full h-auto no-bg">
              <div
                className="lg:w-[24rem] md:w-[22rem] w-[18rem] cursor-pointer lg:h-[16rem] md:h-[12rem] h-[10rem] m-auto bg-[radial-gradient(346.87%_97.15%_at_2.85%_47.78%,_#c1c3d1_0%,_#d8dbdd_51.04%,_#e6e8f1_100%)]
             rounded-xl relative text-white shadow-2xl transition-transform transform hover:scale-110"
              >
                <div className="w-full px-8 absolute top-8">
                  <div className="flex relative justify-between">
                    <div className="">
                      <Image
                        src="/images/go.png"
                        width={200}
                        height={200}
                        className="lg:w-auto md:w-auto w-auto lg:h-14 md:h-12 h-10"
                        alt=""
                      />
                    </div>
                    <div className="absolute right-0">
                      <Image
                        src="/images/build.png"
                        width={200}
                        height={200}
                        className="lg:w-[180px] md:w-[130px] w-[100px] lg:h-[180px] md:h-[130px] h-[100px]"
                        alt=""
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="font-bold text-black text-left lg:text-xl md:text-xl text-lg">
                      White Silver Card
                    </p>
                  </div>
                  <div className="lg:pt-6 md:pt-4 pt-2 pr-6">
                    <div className="flex justify-between">
                      <div className="text-black">
                        <p className="text-lg font-regular">No 3</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Button>
            <Modal
              isOpen={isThirdModalOpen}
              className="p-5"
              onOpenChange={(open: any) =>
                open ? openThirdModal() : closeThirdModal()
              }
              placement="center"
            >
              <ModalContent>
                {(onClose: any) => (
                  <>
                    <ModalHeader className="flex border-b-2 text-2xl  pb-2 flex-col gap-1 text-black">
                      White silver card
                    </ModalHeader>
                    <ModalBody>
                      <div className="flex items-center justify-between text-black">
                        <div className="">
                          <p className="font-semibold">
                            The commission rate is:
                          </p>
                        </div>
                        <div className="">
                          <p>1.1%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-black">
                        <div className="">
                          <p className="font-semibold">Number of ratings:</p>
                        </div>
                        <div className="">
                          <p>30 ratings</p>
                        </div>
                      </div>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
            <Button onPress={openFourModal} className="w-full h-auto no-bg">
              <div
                className="lg:w-[24rem] md:w-[22rem] w-[18rem] cursor-pointer lg:h-[16rem] md:h-[12rem] h-[10rem] m-auto bg-[radial-gradient(346.87%_97.15%_at_2.85%_47.78%,_#ffa50080_0%,_#ebb53480_56.25%,_#f8c05a80_100%)]
             rounded-xl relative text-white shadow-2xl transition-transform transform hover:scale-110"
              >
                <div className="w-full px-8 absolute top-8">
                  <div className="flex relative justify-between">
                    <div className="">
                      <Image
                        src="/images/go.png"
                        width={200}
                        height={200}
                        className="lg:w-auto md:w-auto w-auto lg:h-14 md:h-12 h-10"
                        alt=""
                      />
                    </div>
                    <div className="absolute right-0">
                      <Image
                        src="/images/build.png"
                        width={200}
                        height={200}
                        className="lg:w-[180px] md:w-[130px] w-[100px] lg:h-[180px] md:h-[130px] h-[100px]"
                        alt=""
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="font-bold text-black text-left lg:text-xl md:text-xl text-lg">
                      Gold Card
                    </p>
                  </div>
                  <div className="lg:pt-6 md:pt-4 pt-2 pr-6">
                    <div className="flex justify-between">
                      <div className="text-black">
                        <p className="text-lg font-regular">No 4</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Button>
            <Modal
              isOpen={isFourModalOpen}
              className="p-5"
              onOpenChange={(open: any) =>
                open ? openFourModal() : closeFourModal()
              }
              placement="center"
            >
              <ModalContent>
                {(onClose: any) => (
                  <>
                    <ModalHeader className="flex border-b-2 text-2xl  pb-2 flex-col gap-1 text-black">
                      Gold card
                    </ModalHeader>
                    <ModalBody>
                      <div className="flex items-center justify-between text-black">
                        <div className="">
                          <p className="font-semibold">
                            The commission rate is:
                          </p>
                        </div>
                        <div className="">
                          <p>1.1%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-black">
                        <div className="">
                          <p className="font-semibold">Number of ratings:</p>
                        </div>
                        <div className="">
                          <p>30 ratings</p>
                        </div>
                      </div>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
            <Button onPress={openFiveModal} className="w-full h-auto no-bg">
              <div
                className="lg:w-[24rem] md:w-[22rem] w-[18rem] cursor-pointer lg:h-[16rem] md:h-[12rem] h-[10rem] m-auto bg-[radial-gradient(346.87%_97.15%_at_2.85%_47.78%,_#8282ddbf_0%,_#b4b4f3bf_56.25%,_#e5e5ffbf_100%)]
             rounded-xl relative text-white shadow-2xl transition-transform transform hover:scale-110"
              >
                <div className="w-full px-8 absolute top-8">
                  <div className="flex relative justify-between">
                    <div className="">
                      <Image
                        src="/images/go.png"
                        width={200}
                        height={200}
                        className="lg:w-auto md:w-auto w-auto lg:h-14 md:h-12 h-10"
                        alt=""
                      />
                    </div>
                    <div className="absolute right-0">
                      <Image
                        src="/images/build.png"
                        width={200}
                        height={200}
                        className="lg:w-[180px] md:w-[130px] w-[100px] lg:h-[180px] md:h-[130px] h-[100px]"
                        alt=""
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="font-bold text-black text-left lg:text-xl md:text-xl text-lg">
                      Diamond Card
                    </p>
                  </div>
                  <div className="lg:pt-6 md:pt-4 pt-2 pr-6">
                    <div className="flex justify-between">
                      <div className="text-black">
                        <p className="text-lg font-regular">No 5</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Button>
            <Modal
              isOpen={isFiveModalOpen}
              className="p-5"
              onOpenChange={(open: any) =>
                open ? openFiveModal() : closeFiveModal()
              }
              placement="center"
            >
              <ModalContent>
                {(onClose: any) => (
                  <>
                    <ModalHeader className="flex border-b-2 text-2xl  pb-2 flex-col gap-1 text-black">
                      Diamond Card
                    </ModalHeader>
                    <ModalBody>
                      <div className="flex items-center justify-between text-black">
                        <div className="">
                          <p className="font-semibold">
                            The commission rate is:
                          </p>
                        </div>
                        <div className="">
                          <p>1.1%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-black">
                        <div className="">
                          <p className="font-semibold">Number of ratings:</p>
                        </div>
                        <div className="">
                          <p>30 ratings</p>
                        </div>
                      </div>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
            <Button onPress={openSixModal} className="w-full h-auto no-bg">
              <div
                className="lg:w-[24rem] md:w-[22rem] w-[18rem] cursor-pointer lg:h-[16rem] md:h-[12rem] h-[10rem] m-auto bg-[radial-gradient(346.87%_97.15%_at_2.85%_47.78%,_#161920bf_0%,_#42475280_0.01%,_#878a90bf_56.25%,_#bbbbbbbf_100%)]
             rounded-xl relative text-white shadow-2xl transition-transform transform hover:scale-110"
              >
                <div className="w-full px-8 absolute top-8">
                  <div className="flex relative justify-between">
                    <div className="">
                      <Image
                        src="/images/go.png"
                        width={200}
                        height={200}
                        className="lg:w-auto md:w-auto w-auto lg:h-14 md:h-12 h-10"
                        alt=""
                      />
                    </div>
                    <div className="absolute right-0">
                      <Image
                        src="/images/build.png"
                        width={200}
                        height={200}
                        className="lg:w-[180px] md:w-[130px] w-[100px] lg:h-[180px] md:h-[130px] h-[100px]"
                        alt=""
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="font-bold text-black text-left lg:text-xl md:text-xl text-lg">
                      Titanium Gold Card
                    </p>
                  </div>
                  <div className="lg:pt-6 md:pt-4 pt-2 pr-6">
                    <div className="flex justify-between">
                      <div className="text-black">
                        <p className="text-lg font-regular">No 6</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Button>
            <Modal
              isOpen={isSixModalOpen}
              className="p-5"
              onOpenChange={(open: any) =>
                open ? openSixModal() : closeSixModal()
              }
              placement="center"
            >
              <ModalContent>
                {(onClose: any) => (
                  <>
                    <ModalHeader className="flex border-b-2 text-2xl  pb-2 flex-col gap-1 text-black">
                      Titanium Gold Card
                    </ModalHeader>
                    <ModalBody>
                      <div className="flex items-center justify-between text-black">
                        <div className="">
                          <p className="font-semibold">
                            The commission rate is:
                          </p>
                        </div>
                        <div className="">
                          <p>1.1%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-black">
                        <div className="">
                          <p className="font-semibold">Number of ratings:</p>
                        </div>
                        <div className="">
                          <p>30 ratings</p>
                        </div>
                      </div>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Level;
