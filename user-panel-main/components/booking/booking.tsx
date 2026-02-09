"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { userAtom } from "@/state/userAtom";
import axios from "axios";
import { bookingAtom } from "@/state/bookingAtom";
import { toast } from "react-toastify";
import { walletAtom } from "@/state/walletAtom";
import CountUp from "react-countup";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import {
  calculateCheckOutDate,
  getRandomDateAfter90Days,
  getRandomInt,
} from "@/hooks/RandomDateMonth";
import { CongratsModal, NoticeModal } from "../ModalPopup/Modals";
import { SwiperSliders } from "../SwiperSliders/SwiperSliders";
interface BonusEntry {
  _id: string;
  userId: string;
  userCode: string;
  amount: number;
  status: "active" | "inactive" | "new";
  userStatus: "new" | "completed";
  taskCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
const Booking = () => {
  const router = useRouter();
  const [userData, setUserData] = useRecoilState(userAtom);
  const [bookingData, setBookingData] = useRecoilState(bookingAtom);
  const [walletData, setWalletData] = useRecoilState(walletAtom);
  const [isFirstModalOpen, setFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setSecondModalOpen] = useState(false);
  const [premiumTaskData, setPremiumTaskData] = useState<any>();
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [congratsModalOpen, setCongratsModalOpen] = useState(false);
  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [isBonusAvailable, setIsBonusAvailable] = useState<boolean>();
  const [bonusData, setBonusData] = useState<BonusEntry[]>([]);
  const actualReward: number | undefined = bonusData[0]?.amount;
  const taskCountLimit:string = `${process.env.NEXT_PUBLIC_TASK_COUNT}`;
  const [rewards, setRewards] = useState(Array(3).fill(null)); // Initialize rewards as null
  const [clickedIndex, setClickedIndex] = useState(null); // Track the clicked div index
  const [isRewardRevealed, setIsRewardRevealed] = useState(false); // Track if rewards are revealed
  const openFirstModal = () => setFirstModalOpen(true);
  const closeFirstModal = () => {
    setFirstModalOpen(false);
  };
  const openSecondModal = () => {
    closeFirstModal(); // Close the first modal
    setSecondModalOpen(true); // Open the second modal
  };
  const closeSecondModal = () => {
    setSecondModalOpen(false);
  };
  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/wallet/get-user-wallet`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setWalletData(response.data.result.data);
      } else {
        console.error("Failed to load user wallet data.");
      }
    } catch (error) {
      console.error("An error occurred while fetching user wallet data.");
    }
  };
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/get-account-details`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setUserData(response.data.result.data);
      } else {
        console.error("Failed to load users data.");
      }
    } catch (error) {
      console.error("An error occurred while fetching users data.");
    }
  };

  const fetchBookingData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/get-bookings`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        const Availdata = response.data.result.data[0];
        const Nodata = response.data.result.noData;
        setBonusData(response.data.result.bonusData);
        setIsBonusAvailable(response.data.bonus);

        // Generate random check-in date
        const checkInDateInfo = getRandomDateAfter90Days();
        const checkInDate = new Date(
          `${checkInDateInfo.month} ${checkInDateInfo.day}, ${checkInDateInfo.year}`
        );

        // Calculate check-out date based on check-in date
        const checkOutDate = calculateCheckOutDate(checkInDate);
        const checkOutDateInfo = {
          month: checkOutDate.toLocaleString("default", { month: "short" }), // Short month name
          day: String(checkOutDate.getDate()).padStart(2, "0"), // Two-digit day
        };

        // Generate random rooms and guests
        const rooms = getRandomInt(1, 3); // Random number between 1 and 3 rooms
        const guests = getRandomInt(1, 5); // Random number between 1 and 5 guests
        const bookData = Availdata || Nodata;
        // Merge random booking data with the fetched data
        const mergedData = {
          ...bookData,
          checkIn: {
            day: checkInDateInfo.day,
            month: checkInDateInfo.month,
          },
          checkOut: {
            day: checkOutDateInfo.day,
            month: checkOutDateInfo.month,
          },
          rooms,
          guests,
        };
        setBookingData(mergedData);
      } else {
        console.error("Failed to load booking data.");
      }
    } catch (error) {
      console.error("An error occurred while fetching booking data.");
    }
  };
  const fetchPremiumTaskData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/get-premium-task`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        const Availdata = response.data.result.data[0];
        setIsPremium(response.data.success);
        setCongratsModalOpen(true);
        setPremiumTaskData(Availdata ? Availdata : response.data.result.noData);
      } else {
        console.error("Failed to load premium task data.");
      }
    } catch (error) {
      setIsPremium(false);
      console.error("An error occurred while fetching premium task data.");
    }
  };
  const purchase = async () => {
    try {
      let purchaseData = {
        price: bookingData?.price,
        taskId: bookingData?._id,
        commissionFee: bookingData?.commissionFee,
        premium: isPremium,
      };

      if (isPremium && premiumTaskData) {
        purchaseData = {
          price: premiumTaskData?.amount,
          taskId: premiumTaskData?._id,
          commissionFee: premiumTaskData?.commissionFee,
          premium: isPremium,
        };
      }
      const token = localStorage.getItem("userToken");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/purchase-booking`,
        purchaseData,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        toast.success(response.data.message);
        await fetchBookingData();
        await fetchPremiumTaskData();
        await fetchUserData();
        await fetchWalletData();
      } else {
        toast.error("Failed to booking.");
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };
  useEffect(() => {
    fetchBookingData();
    fetchPremiumTaskData();
  }, []);
  useEffect(() => {

    // Open notice modal if taskCount is 30
    if (userData && userData?.taskCount >= parseInt(taskCountLimit)) {
      setNoticeModalOpen(true);
    }

    // Check for bonus modal condition
    if (isBonusAvailable && bonusData.length > 0) {
      // Check if task count matches
      const taskMatch = bonusData.filter(
        (bonus: any) => bonus.taskCount === userData?.taskCount
      );
      console.log("TaskMatch", taskMatch);
      // Check if status matches
      const statusMatch = bonusData.filter(
        (bonus: any) => bonus.status === "active"
      );
      setBonusData(statusMatch);
      // If there's any matching bonus entry, open the bonus modal
      if (
        bonusData.length > 0 &&
        taskMatch.length > 0 &&
        statusMatch.length > 0
      ) {
        setBonusModalOpen(true);
      }
    }
  }, [router, userData, isBonusAvailable]);

  const handleRewardClick = (index: any) => {
    setClickedIndex(index); // Set the index of the clicked div

    const multiplierOptionsAdd = [0.5, 0.6, 0.7, 0.8];
    const multiplierOptionsSubtract = [0.5, 0.4, 0.3];

    // Calculate new rewards
    const newRewards = rewards.map((reward, i) => {
      if (i === index) {
        // Display actualReward in the clicked div
        return actualReward;
      } else {
        // Display a calculated reward in the other divs
        const randomMultiplier =
          Math.random() > 0.5
            ? multiplierOptionsAdd[
                Math.floor(Math.random() * multiplierOptionsAdd.length)
              ]
            : -multiplierOptionsSubtract[
                Math.floor(Math.random() * multiplierOptionsSubtract.length)
              ];

        return Math.round(actualReward + actualReward * randomMultiplier);
      }
    });
    updateBonusData(actualReward, bonusData[0]._id);
    setRewards(newRewards);
    setIsRewardRevealed(true);
  };
  const updateBonusData = async (
    bonusAmount: number | undefined,
    id: String
  ) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update-user-bonus`,
        {
          amount: bonusAmount,
          bonusId: id,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200) {
        await fetchWalletData();
        await fetchBookingData();
        toast.success(response.data.message);
      } else {
        toast.error("Update Bonus failed! Please try again.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };
  const handleModalClose = () => {
    setBonusModalOpen(false);
    resetRewards();
  };

  const resetRewards = () => {
    setRewards(Array(3).fill(null)); // Reset rewards to initial state
    setIsRewardRevealed(false); // Reset reveal status
  };
  if (!userData) {
    return (
      <div className="flex h-[300px] justify-center items-center">
        <Spinner label="Loading..." color="warning" />
      </div>
    );
  }

  return (
    <div>
      <section className="relatve bg-[url('/images/room2.jpg')] bg-center bg-no-repeat bg-cover">
        <div className="mx-auto w-full px-5 py-16 md:px-10 md:py-24 lg:py-32 ">
          <div className="bg-black/20 p-4">
            <div className="mx-auto mb-12 flex lg:flex-row md:flex-row flex-col items-center justify-between w-full  text-left md:mb-16 lg:mb-20">
              <div className="lg:w-4/12 md:w-4/12 w-full ml-auto">
                <h1 className="mb-2 text-4xl font-semibold text-white md:text-6xl">
                  {isPremium ? premiumTaskData?.name : bookingData?.name}
                </h1>

                <p className="text-white pt-1 text-sm font-semibold">
                  Home / Detail page
                </p>
                <p className="text-white pt-2 text-lg font-semibold">
                  Booking Count: {userData?.taskCount ?? "N/A"}
                </p>
                <div className="">
                  <Button
                    onPress={() => {
                      if (
                        userData?.taskCount >= parseInt(taskCountLimit) ||
                        (walletData?.totalBalance ?? 0) < 10000
                      ) {
                        if (isPremium && walletData && (walletData?.totalBalance <= premiumTaskData?.amount)) {
                          openFirstModal();
                        } else {
                        setNoticeModalOpen(true);
                        }
                      } else if (
                        isBonusAvailable &&
                        bonusData[0]?.taskCount === userData?.taskCount &&
                        bonusData[0]?.status === "active" &&
                        bonusData[0]?.userStatus === "new"
                      ) {
                        setBonusModalOpen(true);
                      } else {
                        openFirstModal();
                      }
                    }}
                    className="bg-[#39502f] mt-4 flex items-center hover:bg-[#418a21] text-white font-bold py-2 px-4 rounded"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                      />
                    </svg>
                    <p className="mx-2 text-sm font-semibold">
                      Book Now & Earn Rewards
                    </p>
                  </Button>
                </div>
                <div className="pt-4">
                  <Button
                    onPress={() => {
                      if (
                        userData?.taskCount >= parseInt(taskCountLimit) ||
                        (walletData?.totalBalance ?? 0) < 10000
                      ) {
                        if (isPremium && walletData && (walletData?.totalBalance <= premiumTaskData?.amount)) {
                          openFirstModal();
                        } else {
                        setNoticeModalOpen(true);
                        }
                      } else if (
                        isBonusAvailable &&
                        bonusData[0]?.taskCount === userData?.taskCount &&
                        bonusData[0]?.status === "active" &&
                        bonusData[0]?.userStatus === "new"
                      ) {
                        setBonusModalOpen(true);
                      } else {
                        openFirstModal();
                      } 
                    }}
                    className="bg-orange-500 text-white"
                  >
                    Book now
                  </Button>
                </div>
                <Modal
                  isOpen={isFirstModalOpen}
                  onOpenChange={(open: any) =>
                    open ? openFirstModal() : closeFirstModal()
                  }
                  placement="center"
                >
                  <ModalContent>
                    <>
                      {walletData &&
                      (walletData?.totalBalance <= premiumTaskData?.amount) ? (
                        // Low Balance Alert
                        <>
                          <ModalHeader className="flex border-2 pb-2 flex-col gap-1 text-black">
                            Alert
                          </ModalHeader>
                          <ModalBody>
                            <div className="border-b-2 pb-2 text-black">
                              <p className="text-base">
                                Your balance is low, please{" "}
                                <Link
                                  href={"/deposit"}
                                  className="text-blue-500"
                                >
                                  deposit
                                </Link>{" "}
                                to continue to your purchase.
                              </p>
                              <p className="text-base">
                                Please go to the Wallet page if your deposit was
                                completed.
                              </p>
                              <p className="text-base font-bold">
                                Amount Needed to Deposit: ₹{" "}
                                {`${Math.abs(premiumTaskData?.amount)}`}
                              </p>
                              <p className="text-base">
                                Gold Suite 5X commission
                              </p>
                            </div>
                          </ModalBody>
                          <ModalFooter className="w-full mx-auto">
                            <Button
                              className="w-full bg-orange-500 text-white mx-auto"
                              onPress={() => {
                                router.push("/deposit");
                              }}
                            >
                              Deposit
                            </Button>
                          </ModalFooter>
                        </>
                      ) : (
                        // Order Details
                        <>
                          <ModalHeader className="flex border-2 pb-2 flex-col gap-1 text-black">
                            Order Details
                          </ModalHeader>
                          <ModalBody>
                            {isPremium ? (
                              <>
                                <div className="border-b-2 pb-2 text-black">
                                  <p className="text-xl font-bold">
                                    {premiumTaskData?.name}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between text-black">
                                  <div className="">
                                    <p className="font-semibold">
                                      Order Number:
                                    </p>
                                  </div>
                                  <div className="">
                                    <p>{premiumTaskData?._id}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-black">
                                  <div className="">
                                    <p className="font-semibold">
                                      Booking Count:
                                    </p>
                                  </div>
                                  <div className="">
                                    <p>{premiumTaskData?.taskNo}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-black">
                                  <div className="">
                                    <p className="font-semibold">Price:</p>
                                  </div>
                                  <div className="">
                                    <p>₹ {premiumTaskData?.amount}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-black">
                                  <div className="">
                                    <p className="font-semibold">Commission:</p>
                                  </div>
                                  <div className=" text-black">
                                    <p>₹ {((premiumTaskData && premiumTaskData?.commissionFee * premiumTaskData?.amount * 0.01) ?? 0).toFixed(2)}</p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>{userData?.taskCount <= parseInt(taskCountLimit) && <>
                                <div className="border-b-2 pb-2 text-black">
                                  <p className="text-xl font-bold">
                                    {bookingData?.name}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between text-black">
                                  <div className="">
                                    <p className="font-semibold">
                                      Order Number:
                                    </p>
                                  </div>
                                  <div className="">
                                    <p>{bookingData?._id}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-black">
                                  <div className="">
                                    <p className="font-semibold">
                                      Booking Count:
                                    </p>
                                  </div>
                                  <div className="">
                                    <p>{bookingData?.count}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-black">
                                  <div className="">
                                    <p className="font-semibold">Price:</p>
                                  </div>
                                  <div className="">
                                    <p>₹ {bookingData?.price}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-black">
                                  <div className="">
                                    <p className="font-semibold">Commission:</p>
                                  </div>
                                  <div className="">
                                    <p>₹ {((bookingData && bookingData?.commissionFee * bookingData?.price * 0.01) ?? 0).toFixed(2)}</p>
                                  </div>
                                </div></>}
                              </>
                            )}
                          </ModalBody>
                          <ModalFooter className="w-full mx-auto">
                            <Button
                              className="w-full bg-orange-500 text-white mx-auto"
                              onPress={openSecondModal}
                            >
                              Book now
                            </Button>
                          </ModalFooter>
                        </>
                      )}
                    </>
                  </ModalContent>
                </Modal>
                <Modal
                  isOpen={noticeModalOpen}
                  onOpenChange={() => setNoticeModalOpen(!noticeModalOpen)}
                  placement="center"
                >
                  <NoticeModal />
                </Modal>
                <Modal
                  isOpen={bonusModalOpen}
                  onOpenChange={handleModalClose}
                  placement="center"
                  size={"4xl"}
                >
                  <ModalContent className="w-full max-w-4xl bg-[url('/images/bonus_bg.png')]">
                    <>
                      <ModalHeader className="flex border-b pb-2 flex-col gap-1">
                        <Image
                          width={200}
                          height={200}
                          src={"/images/bonus_head.png"}
                          alt="Bonus_head"
                          className="mx-auto"
                        />
                      </ModalHeader>
                      <ModalBody
                        className="w-full h-full bg-cover px-12 bg-center p-4 overflow-auto"
                        style={{ maxHeight: "465px" }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 mx-2 lg:px-12 md:px-10 px-8 gap-4 mt-4">
                          {rewards.map((reward, index) => (
                            <div className="container mx-auto" key={index}>
                              <div className="flex justify-center lg:mt-20 md:mt-10 mt-0">
                                <div className="box">
                                  <div
                                    className={`box-body relative ${
                                      isRewardRevealed ? "active" : ""
                                    }`}
                                    onClick={() =>
                                      !isRewardRevealed &&
                                      handleRewardClick(index)
                                    }
                                  >
                                    <p
                      className={`img text-2xl font-bold ${
                        index === clickedIndex ? "text-green-500" : "text-white"
                      }`}
                    >
                                      ₹
                                      {reward !== null
                                        ? reward
                                        : "Click to reveal"}
                                    </p>
                                    <div className="box-lid">
                                      <div className="box-bowtie"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ModalBody>
                    </>
                  </ModalContent>
                </Modal>

                <Modal
                  isOpen={congratsModalOpen}
                  onOpenChange={() => {setCongratsModalOpen(!congratsModalOpen), openFirstModal()}}
                  placement="center"
                >
                  <CongratsModal />
                </Modal>
                <Modal
                  isOpen={isSecondModalOpen}
                  onOpenChange={(open: any) =>
                    open ? setSecondModalOpen(true) : closeSecondModal()
                  }
                  placement="center"
                >
                  <ModalContent>
                    <ModalHeader className="flex border-2 pb-2 flex-col gap-1 text-black">
                      Share Your Opinion
                    </ModalHeader>
                    <ModalBody>
                      <p className="text-sm text-black">Please select at least one</p>

                      <div className="flex items-center mb-2">
                        <input
                          checked
                          id="default-radio-1"
                          type="radio"
                          value=""
                          name="default-radio"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <label className="ms-2 text-sm font-medium text-gray-900">
                          Clean environment, superb experience!sssss
                        </label>
                      </div>
                      <div className="flex items-center mb-2">
                        <input
                          checked
                          id="default-radio-2"
                          type="radio"
                          value=""
                          name="default-radio"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <label className="ms-2 text-sm font-medium text-gray-900">
                          Warm hearth service during the journey!
                        </label>
                      </div>
                      <div className="flex items-center mb-2">
                        <input
                          checked
                          id="default-radio-2"
                          type="radio"
                          value=""
                          name="default-radio"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <label className="ms-2 text-sm font-medium text-gray-900">
                          Great and safe place all the way!
                        </label>
                      </div>
                      <div className="flex items-center mb-2">
                        <input
                          checked
                          id="default-radio-2"
                          type="radio"
                          value=""
                          name="default-radio"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <label className="ms-2 text-sm font-medium text-gray-900">
                          Excellent service of the staffs ; Friendly , Attentive
                          , helpful
                        </label>
                      </div>
                      <div className="flex items-center mb-2">
                        <input
                          checked
                          id="default-radio-2"
                          type="radio"
                          value=""
                          name="default-radio"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <label className="ms-2 text-sm font-medium text-gray-900">
                          The location is convenient for everyone, easy to
                          access and reach
                        </label>
                      </div>
                      <div className="flex items-center mb-2">
                        <input
                          checked
                          id="default-radio-2"
                          type="radio"
                          value=""
                          name="default-radio"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <label className="ms-2 text-sm font-medium text-gray-900">
                          Reasonable, Affordable, and cheap
                        </label>
                      </div>
                      <div className="flex items-center ">
                        <input
                          checked
                          id="default-radio-2"
                          type="radio"
                          value=""
                          name="default-radio"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <label className="ms-2 text-sm font-medium text-gray-900">
                          Spacious , comfortable , and peaceful modern rooms
                        </label>
                      </div>
                    </ModalBody>
                    <ModalFooter className="w-full mx-auto">
                      <Button
                        className="w-full bg-orange-500 text-white  mx-auto"
                        onPress={() => {
                          closeSecondModal(), purchase();
                        }}
                      >
                        Submit Order
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </div>
              {bookingData && (
                <div className="lg:w-6/12 md:w-6/12 w-full ml-auto lg:mt-0 md:mt-5 mt-5">
                  <div className="mx-auto  grid justify-center text-center gap-4 grid-cols-1  md:grid-cols-3">
                    <div className="relative overflow-hidden rounded-lg border bg-white/10 select-none hover:shadow hover:shadow-teal-200 p-2">
                      <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                        <div className="">
                          <h2 className="font-bold text-lg text-white">
                            Check In
                          </h2>
                        </div>
                        <div className="">
                          <h3 className="font-bold text-6xl text-white py-5">
                            <CountUp
                              end={bookingData.checkIn.day}
                              duration={1}
                            />
                          </h3>
                          <div className="flex items-center justify-center">
                            <p className="text-sm text-white text-muted-foreground font-semibold">
                              {bookingData.checkIn.month}
                            </p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke-width="1.5"
                              stroke="currentColor"
                              className="w-5 text-white mx-2 h-auto"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="m19.5 8.25-7.5 7.5-7.5-7.5"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg border bg-white/10 select-none hover:shadow hover:shadow-teal-200 p-2">
                      <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                        <div className="">
                          <h2 className="font-bold text-lg text-white">
                            Check Out
                          </h2>
                        </div>
                        <div className="">
                          <h3 className="font-bold text-6xl text-white py-5">
                            <CountUp
                              end={bookingData.checkOut.day}
                              duration={1}
                            />
                          </h3>
                          <div className="flex items-center justify-center">
                            <p className="text-sm text-white text-muted-foreground font-semibold">
                              {bookingData.checkOut.month}
                            </p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke-width="1.5"
                              stroke="currentColor"
                              className="w-5 text-white mx-2 h-auto"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="m19.5 8.25-7.5 7.5-7.5-7.5"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg border bg-white/10 select-none hover:shadow hover:shadow-teal-200 p-2">
                      <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                        <div className="">
                          <div className="flex items-center justify-center">
                            <p className="text-4xl text-white text-muted-foreground font-bold">
                              <CountUp end={bookingData.rooms} duration={1} />
                            </p>
                            <p className="font-semibold text-white text-lg ml-2">
                              Room
                            </p>
                          </div>
                          <div className="flex items-center pt-5 justify-center">
                            <p className="text-4xl text-white text-muted-foreground font-bold">
                              <CountUp end={bookingData.guests} duration={1} />
                            </p>
                            <p className="font-semibold text-white text-lg ml-2">
                              Guests
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 bg-white/10 rounded mt-5">
                    <div className="text-2xl text-center font-bold text-white">
                      <p>Promotion Code Apply here</p>
                    </div>
                    <div className="bg-[#e2b771] my-5 text-center font-sembold py-2 rounded text-white">
                      <a href="">Check Availablity</a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="relative overflow-hidden lg:p-0 md:p-2 p-2 bg-white">
          <div className="lg:mt-40 md:mt-20 mt-10 lg:pb-[0rem] md:pb-[20rem] pb-[2rem] sm:pt-24 sm:pb-40 lg:pt-40 ">
            <div className="relative mx-auto max-w-7xl  px-4 sm:static sm:px-6 lg:px-8">
              <div className="sm:max-w-lg">
                <h1 className="font text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  {isPremium ? premiumTaskData?.name : bookingData?.name}
                </h1>
                <p className="mt-4 text-sm text-gray-500">
                  {isPremium
                    ? premiumTaskData?.description
                    : bookingData?.description}
                </p>
              </div>

              <div>
                <div className="mt-20">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none lg:absolute lg:inset-y-0 lg:mx-auto w-full lg:max-w-7xl"
                  >
                    <div className="lg:absolute transform  sm:top-0 sm:translate-x-8 lg:left-1/2 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-8">
                      <div className="flex justify-center items-center space-x-6 lg:space-x-8">
                        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-x-5 gap-y-6 lg:gap-y-8">
                          {(isPremium
                            ? premiumTaskData?.hotelImages
                            : bookingData?.hotelImages
                          )?.map((images: any, index: any) => (
                            <div
                              key={index}
                              className="lg:h-64 md:h-64 mx-auto lg:w-44 md:w-44 h-64 w-52 overflow-hidden rounded-lg sm:opacity-0 lg:opacity-100"
                            >
                              <Image
                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/hotelImages/${images}`}
                                width={200}
                                height={200}
                                className="h-full w-full mx-auto object-cover object-center"
                                alt={""}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="max-w-screen-xl bg-white lg:pt-0 md:pt-0 mx-auto">
          <p className="text-lg md:text-xl text-black lg:text-4xl font-bold lg:text-left md:text-center text-center ">
            Amenity
          </p>
        </div>
        <div className="bg-white flex lg:flex-row md:flex-col flex-col items-center max-w-screen-xl mx-auto justify-between">
          <div className="container relative  z-40 mx-auto mt-12">
            <div className="flex flex-wrap justify-center mx-auto lg:w-full md:w-5/6 xl:shadow-small-blue">
              <a
                href="#"
                className="block w-1/2 py-10 text-center border lg:w-1/3"
              >
                <div>
                  <Image
                    src="/images/icon1.png"
                    width={200}
                    height={200}
                    className="block w-20 h-20 mx-auto"
                    alt=""
                  />

                  <p className="pt-4 text-sm font-medium capitalize font-body text-green-900 lg:text-lg md:text-base md:pt-6">
                    Room Service
                  </p>
                </div>
              </a>

              <a
                href="#"
                className="block w-1/2 py-10 text-center border lg:w-1/3"
              >
                <div>
                  <Image
                    src="/images/icon2.png"
                    width={200}
                    height={200}
                    className="block w-20 h-20 mx-auto"
                    alt=""
                  />

                  <p className="pt-4 text-sm font-medium capitalize font-body text-green-900 lg:text-lg md:text-base md:pt-6">
                    Airconditioner
                  </p>
                </div>
              </a>

              <a
                href="#"
                className="block w-1/2 py-10 text-center border lg:w-1/3"
              >
                <div>
                  <Image
                    src="/images/icon3.png"
                    width={200}
                    height={200}
                    className="block w-20 h-20 mx-auto"
                    alt=""
                  />

                  <p className="pt-4 text-sm font-medium capitalize font-body text-green-900 lg:text-lg md:text-base md:pt-6">
                    Swimming Pool
                  </p>
                </div>
              </a>

              <a
                href="#"
                className="block w-1/2 py-10 text-center border lg:w-1/3"
              >
                <div>
                  <Image
                    src="/images/icon4.png"
                    width={200}
                    height={200}
                    className="block w-20 h-20 mx-auto"
                    alt=""
                  />

                  <p className="pt-4 text-sm font-medium capitalize font-body text-green-900 lg:text-lg md:text-base md:pt-6">
                    Breakfast
                  </p>
                </div>
              </a>

              <a
                href="#"
                className="block w-1/2 py-10 text-center border lg:w-1/3"
              >
                <div>
                  <Image
                    src="/images/icon5.png"
                    width={200}
                    height={200}
                    className="block w-20 h-20 mx-auto"
                    alt=""
                  />

                  <p className="pt-4 text-sm font-medium capitalize font-body text-green-900 lg:text-lg md:text-base md:pt-6">
                    Laundry
                  </p>
                </div>
              </a>
              <a
                href="#"
                className="block w-1/2 py-10 text-center border lg:w-1/3"
              >
                <div>
                  <Image
                    src="/images/icon6.png"
                    width={200}
                    height={200}
                    className="block w-20 h-20 mx-auto"
                    alt=""
                  />

                  <p className="pt-4 text-sm font-medium capitalize font-body text-green-900 lg:text-lg md:text-base md:pt-6">
                    Parking Space
                  </p>
                </div>
              </a>
              <a
                href="#"
                className="block w-1/2 py-10 text-center border lg:w-1/3"
              >
                <div>
                  <Image
                    src="/images/icon7.png"
                    width={200}
                    height={200}
                    className="block w-20 h-20 mx-auto"
                    alt=""
                  />

                  <p className="pt-4 text-sm font-medium capitalize font-body text-green-900 lg:text-lg md:text-base md:pt-6">
                    Pickup & Drop
                  </p>
                </div>
              </a>
              <a
                href="#"
                className="block w-1/2 py-10 text-center border lg:w-1/3"
              >
                <div>
                  <Image
                    src="/images/icon8.png"
                    width={200}
                    height={200}
                    className="block w-20 h-20 mx-auto"
                    alt=""
                  />

                  <p className="pt-4 text-sm font-medium capitalize font-body text-green-900 lg:text-lg md:text-base md:pt-6">
                    Parking Space
                  </p>
                </div>
              </a>
            </div>
          </div>
          <div className=" mx-auto bg-white py-8 px-4 lg:py-16 lg:px-6">
            <div className="">
              <p className="text-base md:text-xl text-black text-center pb-5">
                The reservation information is displayed in detail for your
                viewing
              </p>
            </div>
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 flex flex-col sm:flex-row flex-wrap -mb-4 -mx-2">
                <div className="w-full sm:w-1/2 mb-4 px-2 ">
                  <div className="h-full py-4 px-6 border border-[#efaa3a] border-t-0 border-l-0 rounded-br-xl">
                    <h3 className="text-sm font-bold text-black text-md mb-6">
                      Trial Bonus
                    </h3>
                    <p className="text-2xl text-black font-bold">
                      ₹ {Math.round(walletData?.levelBonus ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-1/2 mb-4 px-2 ">
                  <div className="h-full py-4 px-6 border border-[#efaa3a] border-t-0 border-l-0 rounded-br-xl">
                    <h3 className="text-sm font-bold text-black text-md mb-6">
                      Balance
                    </h3>
                    <p className="text-2xl text-black font-bold">
                      {" "}
                      ₹ {Math.round(walletData?.totalBalance ?? 0)}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-1/2 mb-4 px-2 ">
                  <div className="h-full py-4 px-6 border border-[#efaa3a] border-t-0 border-l-0 rounded-br-xl">
                    <h3 className="text-sm text-black font-bold text-md mb-6">
                      Today commission
                    </h3>
                    <p className="text-2xl text-black font-bold">
                      ₹ {Math.round(walletData?.totalCommission ?? 0)}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-1/2 mb-4 px-2 ">
                  <div className="h-full py-4 px-6 border border-[#efaa3a] border-t-0 border-l-0 rounded-br-xl">
                    <h3 className="text-sm text-black font-bold text-md mb-6">
                      Pending Amount
                    </h3>
                    <p className="text-2xl text-black font-bold">
                      ₹ {Math.round(walletData?.pendingAmount ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SwiperSliders />
    </div>
  );
};

export default Booking;
