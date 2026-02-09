"use client";
import {
  calculateCheckOutDate,
  getRandomDateAfter90Days,
  getRandomInt,
} from "@/hooks/RandomDateMonth";
import { calendarState } from "@/state/calendarData";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaHamburger } from "react-icons/fa";
import { MdOutlineClose, MdOutlineMenu } from "react-icons/md";
import { useRecoilState } from "recoil";

const Header = () => {
  // State to toggle the mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [calendarData, setCalendarData] = useRecoilState(calendarState);
  // Function to toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
  useEffect(() => {
    randomCalendarData();
  }, [pathname]);
  return (
    <header className="container mx-auto">
      <div className="bg-white border-gray-200 px-4 lg:px-6 top-0 left-0 right-0 h-[90px] p-5 fixed z-50">
        <nav className="flex flex-wrap items-center justify-between p-3">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/go.png"
              width={150}
              height={150}
              className="mr-3 w-24 h-auto"
              alt="Flowbite Logo"
            />
          </Link>
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
            } fixed inset-0 z-40 bg-white md:bg-transparent md:static md:flex md:justify-end md:w-auto mt-[90px] md:mt-0`}
          >
            <div className="flex flex-col items-center justify-center h-full md:flex-row md:items-center gap-3">
              <Link
                className="btn-1 btn-small bg-transparent text-black rounded btn-alt mb-4 md:mb-0"
                href={"/login"}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                className="btn-1 btn-small rounded text-black bg-transparent btn-alt"
                href={"/register"}
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
