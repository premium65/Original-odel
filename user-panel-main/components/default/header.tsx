"use client";

import {
  calculateCheckOutDate,
  getRandomDateAfter90Days,
  getRandomInt,
} from "@/hooks/RandomDateMonth";
import { authState } from "@/state/authAtom";
import { calendarState } from "@/state/calendarData";
import { siteSettingAtom } from "@/state/siteSettingAtom";
import { userAtom } from "@/state/userAtom";
import { walletAtom } from "@/state/walletAtom";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { MdOutlineClose, MdOutlineMenu } from "react-icons/md";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
const LoggedInHeader = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useRecoilState(userAtom);
  const [siteSettingData, setSiteSettingData] = useRecoilState(siteSettingAtom);
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(authState);
  const [walletData, setWalletData] = useRecoilState(walletAtom);
  const [calendarData, setCalendarData] = useRecoilState(calendarState);
  const pathname = usePathname();
  // Explicitly typing the ref to be an HTMLDivElement or null
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const profileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
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
  const fetchSiteSettingData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/siteSetting`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setSiteSettingData(response.data.result);
      } else {
        console.error("Failed to load site setting data.");
      }
    } catch (error) {
      console.error("An error occurred while fetching site setting data.");
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

  const randomCalendarData = async () => {
    // Generate random check-in date
    const checkInDateInfo = getRandomDateAfter90Days();
    const checkInDate = new Date(
      `${checkInDateInfo.month} ${checkInDateInfo.day}, ${checkInDateInfo.year}`
    );

    // Calculate the day of the week for check-in date
    const checkInDayOfWeek = checkInDate.toLocaleString("default", {
      weekday: "long",
    }); // Day of the week

    // Calculate check-out date based on check-in date
    const checkOutDate = calculateCheckOutDate(checkInDate);
    const checkOutDateInfo = {
      month: checkOutDate.toLocaleString("default", { month: "short" }), // Short month name
      day: String(checkOutDate.getDate()).padStart(2, "0"), // Two-digit day
      dayOfWeek: checkOutDate.toLocaleString("default", { weekday: "long" }), // Day of the week
      year: checkOutDate.getFullYear(),
    };

    // Generate random rooms and guests
    const rooms = getRandomInt(1, 3); // Random number between 1 and 3 rooms
    const guests = getRandomInt(1, 5); // Random number between 1 and 5 guests

    // Merge random booking data with the fetched data
    const mergedData = {
      checkIn: {
        day: checkInDateInfo.day,
        month: checkInDateInfo.month,
        year: checkInDateInfo.year,
        dayOfWeek: checkInDayOfWeek, // Use calculated day of the week
      },
      checkOut: {
        day: checkOutDateInfo.day,
        month: checkOutDateInfo.month,
        year: checkOutDateInfo.year,
        dayOfWeek: checkOutDateInfo.dayOfWeek,
      },
      rooms,
      guests,
    };

    // Set the merged data in Recoil state
    setCalendarData(mergedData);
  };
  // Update user data whenever route changes
  useEffect(() => {
    fetchUserData();
    fetchWalletData();
    fetchSiteSettingData();
    randomCalendarData();
  }, [pathname]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear the auth token from localStorage
    localStorage.removeItem("userToken");
    // Calculate the expiration date for the cookie (set it to a past date)
    const expires = new Date();
    expires.setTime(expires.getTime() - 1); // Set the expiration time to a past date

    // Update the document.cookie to clear the token
    document.cookie = `token=; path=/; expires=${expires.toUTCString()};`;
    setUserData(null); // Clear Recoil state
    setIsLoggedIn(false);
    toast.warning("Loggedout successfully");
    router.push("/login"); // Redirect to login page
  };

  return (
    <header className="bg-white fixed top-0 z-50 left-0 right-0 h-[90px]">
      <div className="container mx-auto">
        <div className="border-gray-200  px-4 lg:px-6 p-5">
          <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/images/go.png"
                width={200}
                height={200}
                className="mr-3 w-24 h-auto"
                alt="Flowbite Logo"
              />
            </Link>
            {/* Mobile Section */}
            <div className="flex md:hidden">
              <button id="hamburger" onClick={toggleMenu}>
                {isMenuOpen ? (
                  <MdOutlineClose size={24} color="black" />
                ) : (
                  <MdOutlineMenu size={24} color="black" />
                )}
              </button>
            </div>

            <div
              className={`${
                isMenuOpen ? "block" : "hidden"
              } fixed inset-0 z-40 bg-[#ec742b] md:bg-transparent md:static md:flex md:justify-end md:w-auto mt-[90px] md:mt-0`}
            >
              <div className="flex flex-col items-center justify-center h-full md:flex-row md:items-center gap-3">
                <div className="lg:hidden md:hidden flex justify-center items-center -mt-10">
                  <div className="border-2 rounded-xl w-fit ml-auto p-2 bg-white">
                    <div className="flex justify-center items-center">
                      <Image
                        src={
                          userData?.profilePic
                            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${userData?.profilePic}`
                            : "/images/user.jpg"
                        }
                        width={200}
                        height={200}
                        className="w-10 rounded-full h-10"
                        alt=""
                      />

                      <p className="text-[#717171] font-semibold text-sm mx-2">
                        {userData?.userName}
                      </p>
                    </div>
                  </div>
                </div>
                <ul className=" flex-col lg:hidden md:hidden block mt-2 text-center p-2 justify-end lg:space-x-8 lg:mt-0">
                  <li>
                    <Link
                      className="text-lg hover:text-orange-200 font-semibold text-white"
                      href={"/account-details"}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Account
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link
                      className="text-lg hover:text-orange-200 font-semibold text-white"
                      href={"/booking"}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Booking
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link
                      className="text-lg hover:text-orange-200 font-semibold text-white"
                      href={"/wallet"}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Wallet
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link
                      className="text-lg hover:text-orange-200 font-semibold text-white"
                      href={"/level"}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Level
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link
                      className="text-lg hover:text-orange-200 font-semibold text-white"
                      href={"/booking-history"}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Booking History
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link
                      className="text-lg  hover:text-orange-200 font-semibold text-white"
                      href={"/event"}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Event & Offers
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link
                      className="text-lg  hover:text-orange-200 font-semibold text-white"
                      href={"/customer-service"}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Contact Us
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link
                      className="text-lg  hover:text-orange-200 font-semibold text-white"
                      href={"/about-us"}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      About Us
                    </Link>
                  </li>
                  <li className="mt-2">
                    <Link
                      className="text-lg hover:text-orange-200 font-semibold text-white"
                      href={"/help"}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Help
                    </Link>
                  </li>
                  <li className="mt-2">
                    <button
                      className="text-lg hover:text-orange-200 font-semibold text-white"
                      onClick={() => {
                        setIsMenuOpen(false), handleLogout();
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Desktop section */}
            <div className="hidden lg:flex md:flex items-center justify-between">
              <div className="hidden lg:flex md:flex  items-center lg:order-2">
                <div className="header-link-btn mx-2">
                  <Link
                    className=" hover:text-[#c59953] text-[16px] font-semibold text-[#717171]"
                    href={"/account-details"}
                  >
                    My Account
                  </Link>
                </div>
                <div className="header-link-btn mx-2">
                  <Link
                    className="text-[16px] hover:text-[#c59953] font-semibold text-[#717171]"
                    href={"/booking"}
                  >
                    Booking
                  </Link>
                </div>
                <div className="header-link-btn mx-2">
                  <Link
                    className="text-[16px] hover:text-[#c59953] font-semibold text-[#717171]"
                    href={"/event"}
                  >
                    Event & Offers
                  </Link>
                </div>
                <div className="header-link-btn mx-2">
                  <Link
                    className="text-[16px] hover:text-[#c59953] font-semibold text-[#717171]"
                    href={"/customer-service"}
                  >
                    Contact Us
                  </Link>
                </div>
                <div className="header-link-btn mx-2">
                  <Link
                    className="text-[16px] hover:text-[#c59953] font-semibold text-[#717171]"
                    href={"/about-us"}
                  >
                    About Us
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:block relative md:block hidden">
              <div
                onClick={profileMenu}
                className="flex cursor-pointer border-2 px-4 py-2 rounded-xl  items-center"
              >
                {" "}
                <Image
                  src={
                    userData?.profilePic
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${userData?.profilePic}`
                      : "/images/user.jpg"
                  }
                  width={200}
                  height={200}
                  className="w-10 rounded-full h-10"
                  alt=""
                />
                <div className="flex flex-col">
                  <p className="text-[#717171] font-semibold text-sm mx-2">
                    {userData?.userName}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6  text-[#717171]"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
              {isProfileOpen && (
                <div
                  ref={profileMenuRef}
                  className="absolute top-12 z-50 w-[205px]"
                >
                  <div className="text-white bg-[#ec742b] cursor-pointer rounded-xl p-5">
                    <div className="">
                      <Link
                        className="text-sm hover:text-orange-200 font-semibold text-white"
                        href={"/account-details"}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Account Details
                      </Link>
                    </div>
                    <div className="">
                      <Link
                        className="text-sm hover:text-orange-200 font-semibold text-white"
                        href={"/wallet"}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Wallet
                      </Link>
                    </div>
                    <div className="">
                      <Link
                        className="text-sm hover:text-orange-200 font-semibold text-white"
                        href={"/level"}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Level
                      </Link>
                    </div>
                    <div className="">
                      <Link
                        className="text-sm hover:text-orange-200 font-semibold text-white"
                        href={"/booking-history"}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Booking History
                      </Link>
                    </div>
                    <div className="">
                      <Link
                        className="text-sm hover:text-orange-200 font-semibold text-white"
                        href={"/help"}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Help
                      </Link>
                    </div>
                    <div className="">
                      <button
                        className="text-sm hover:text-orange-200 font-semibold text-white"
                        onClick={() => {
                          setIsProfileOpen(false), handleLogout();
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LoggedInHeader;
