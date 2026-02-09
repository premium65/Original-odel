"use client";

import { IoAlarmOutline } from "react-icons/io5";
import { Autoplay, Navigation } from "swiper/modules";
// Import Swiper components and modules
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles

import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";
import { useRecoilState, useRecoilValue } from "recoil";
import { userAtom } from "@/state/userAtom";
import { walletAtom } from "@/state/walletAtom";
import { SwiperSliders } from "@/components/SwiperSliders/SwiperSliders";
import { calendarState } from "@/state/calendarData";
import CountUp from "react-countup";
import Link from "next/link";
export default function Home() {
  const walletData = useRecoilValue(walletAtom);
  const [userData, setUserData] = useRecoilState(userAtom);
  const [calendarData, setCalendarData] = useRecoilState(calendarState);

  return (
    <>
      <div className="">
        <div
          className="relative"
          style={{
            height: "400px",
            backgroundPosition: "center bottom",
            backgroundSize: "cover",
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src="/images/hotel.mp4" type="video/mp4" />
            <source src="movie.ogg" type="video/ogg" />
            Your browser does not support the video tag.
          </video>
          <div
            className="  "
            style={{
              height: "260px",
              backgroundPosition: "center bottom",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute left-0 -bottom-[54px] right-0">
              <div className=" text-[22px] text-white text-center font-bold">
                <p>Book Hotels and Homestays</p>
              </div>
              <div className="lg:w-3/4 md:w-full w-full mx-auto relative lg:bg-white md:bg-white bg-white/0  p-5 py-10 rounded-xl lg:mt-3 md:mt-2 mt-0">
                <form>
                  <div className="grid gap-6 mb-6 md:grid-cols-6">
                    <div className="col-span-2 bg-white rounded-xl p-4 border-2">
                      <div className=" relative">
                        <div className="text-[14px] absolute -top-7 left-0 lg:bg-white md:bg-white bg-white rounded-full p-1 px-2 font-semibold text-[#717171]">
                          <p>Check-In</p>
                        </div>
                        <div className="text-[18px] text-black font-semibold">
                          <p>
                            <CountUp
                              end={parseInt(calendarData.checkIn.day)}
                              duration={2}
                            />{" "}
                            {calendarData.checkIn.month}
                          </p>
                        </div>
                        <div className="text-[12px] font-normal text-[#717171]">
                          <p>{calendarData.checkIn.dayOfWeek}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 rounded-xl bg-white p-4 border-2">
                      <div className=" relative">
                        <div className="text-[14px] absolute -top-7 left-0 bg-white rounded-full p-1 px-2  font-semibold text-[#717171]">
                          <p>Check-Out</p>
                        </div>
                        <div className="text-[18px] text-black font-semibold">
                          <p>
                            <CountUp
                              end={parseInt(calendarData.checkOut.day)}
                              duration={2}
                            />{" "}
                            {calendarData.checkOut.month}
                          </p>
                        </div>
                        <div className="text-[12px] font-normal text-[#717171]">
                          <p>{calendarData.checkOut.dayOfWeek}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1 bg-white rounded-xl p-4 border-2">
                      <div className=" relative">
                        <div className="text-[14px] absolute -top-7 left-0 bg-white rounded-full p-1 px-2  font-semibold text-[#717171]">
                          <p>Rooms</p>
                        </div>
                        <div className="text-[18px] text-black font-semibold">
                          <p>
                            <CountUp end={calendarData.rooms} duration={2} />
                          </p>
                        </div>
                        <div className="text-[12px] font-normal text-[#717171]">
                          <p>Rooms</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1 bg-white rounded-xl p-4 border-2">
                      <div className=" relative">
                        <div className="text-[14px] absolute -top-7 left-0 bg-white rounded-full p-1 px-2  font-semibold text-[#717171]">
                          <p>Guests</p>
                        </div>
                        <div className="text-[18px] text-black font-semibold">
                          <p>
                            <CountUp end={calendarData.guests} duration={2} />
                          </p>
                        </div>
                        <div className="text-[12px] font-normal text-[#717171]">
                          <p>Guests</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-5 text-center left-0 right-0">
                    <button
                      type="submit"
                      className="text-white bg-[#ff6d38] font-semibold py-3 px-8 rounded-full text-base md:text-xl lg:text-[22px]"
                    >
                      Search Rooms
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-16 p-2 bg-[#eff3f8]">
        {userData && walletData && (
          <>
            <div className="py-10 lg:w-3/4 md:w-full w-full mx-auto">
              <div className="flex items-center justify-between">
                <p className="text-black pt-2 text-lg font-semibold">
                  Booking Count: {userData?.taskCount}
                </p>
                <div className="">
                  <Link
                    href={"/booking"}
                    className="text-white bg-[#ff6d38] font-semibold py-3 px-8 rounded-lg text-base md:text-xl lg:text-sm"
                  >
                    Book now
                  </Link>
                </div>
              </div>
            </div>
            <div className="lg:w-3/4 bg-white rounded-xl p-10 md:w-full w-full mx-auto">
              <div className=" mx-auto  px-4  lg:px-6">
                <div className="">
                  <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 -mb-4 -mx-2">
                    <div className="w-full  mb-4 px-2 ">
                      <div className="h-full py-4 px-6 border border-[#efaa3a] border-t-0 border-l-0 rounded-br-xl">
                        <h3 className="text-sm text-black font-bold text-md mb-6">
                          Trial Bonus
                        </h3>
                        <p className="text-2xl text-black font-bold">
                          ₹ {Math.round(walletData?.levelBonus)}
                        </p>
                      </div>
                    </div>
                    <div className="w-full  mb-4 px-2 ">
                      <div className="h-full py-4 px-6 border border-[#efaa3a] border-t-0 border-l-0 rounded-br-xl">
                        <h3 className="text-sm font-bold text-black text-md mb-6">
                          Balance
                        </h3>
                        <p className="text-2xl text-black font-bold">
                          {" "}
                          ₹ {Math.round(walletData?.totalBalance)}
                        </p>
                      </div>
                    </div>

                    <div className="w-full  mb-4 px-2 ">
                      <div className="h-full py-4 px-6 border border-[#efaa3a] border-t-0 border-l-0 rounded-br-xl">
                        <h3 className="text-sm text-black font-bold text-md mb-6">
                          Today commission
                        </h3>
                        <p className="text-2xl text-black font-bold">
                          ₹ {Math.round(walletData?.totalCommission)}
                        </p>
                      </div>
                    </div>

                    <div className="w-full  mb-4 px-2 ">
                      <div className="h-full py-4 px-6 border border-[#efaa3a] border-t-0 border-l-0 rounded-br-xl">
                        <h3 className="text-sm font-bold text-black text-md mb-6">
                          Pending Amount
                        </h3>
                        <p className="text-2xl text-black font-bold">
                          ₹ {Math.round(walletData?.pendingAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="py-10 lg:mt-20 md:mt-20 mt-12 p-5 rounded-xl bg-white lg:w-3/4 md:w-full w-full mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black">Offers for you</h1>
          </div>
          <div className=" relative ">
            <Swiper
              slidesPerView={2}
              spaceBetween={10}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
              }}
              navigation={{
                nextEl: ".swiper-button-next", // Right arrow
                prevEl: null, // Disable left arrow
              }}
              modules={[Navigation, Autoplay]} // Enable Navigation module
              className="mySwiper"
              breakpoints={{
                // When the viewport width is >= 640px (mobile), show 1 slide
                300: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                // When the viewport width is >= 768px (tablet), show 2 slides
                768: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                // When the viewport width is >= 1024px (desktop), show 3 slides
                1024: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
              }}
            >
              <SwiperSlide>
                {" "}
                <div className="">
                  <div className="flex mx-2 flex-col justify-center lg:h-[30vh] md:h-[50] h-70">
                    <div className="relative flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl  p-3 w-full mx-auto border-2 h-[85%]">
                      <div className="w-full md:w-1/3 bg-white grid place-items-center">
                        <Image
                          src="/images/image1.avif"
                          width={200}
                          height={200}
                          className="rounded-xl object-cover h-full"
                          alt="Flowbite Logo"
                        />
                      </div>
                      <div className="w-full md:w-2/3 bg-white flex justify-between flex-col space-y-2 p-3">
                        <h3 className="font-bold text-gray-800 text-left text-[18px]">
                          LIVE: Up to 50% OFF* on <br /> Hotels & Homestays in
                          India!
                        </h3>

                        <p className="text-[16px] flex items-baseline font-normal text-[#777]">
                          Valid till: 22nd Sep'24
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                {" "}
                <div className="">
                  <div className="flex mx-2 flex-col justify-center lg:h-[30vh] md:h-[50] h-70">
                    <div className="relative  flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl  p-3 w-full mx-auto border-2 h-[85%]">
                      <div className="w-full md:w-1/3 bg-white grid place-items-center">
                        <Image
                          src="/images/image2.avif"
                          width={200}
                          height={200}
                          className="rounded-xl object-cover h-full"
                          alt="Flowbite Logo"
                        />
                      </div>
                      <div className="w-full md:w-2/3 bg-white flex justify-between flex-col space-y-2 p-3">
                        <h3 className="font-bold text-gray-800 text-left text-[18px]">
                          Plan a pilgrimage with up to <br /> 50% OFF*
                        </h3>

                        <p className="text-[16px] flex items-baseline font-normal text-[#777]">
                          Valid till: *Limited Period Offers
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                {" "}
                <div className="">
                  <div className="flex mx-2 flex-col justify-center lg:h-[30vh] md:h-[50] h-70">
                    <div className="relative  flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl  p-3 w-full mx-auto border-2 h-[85%]">
                      <div className="w-full md:w-1/3 bg-white grid place-items-center">
                        <Image
                          src="/images/image3.avif"
                          width={200}
                          height={200}
                          className="rounded-xl object-cover h-full"
                          alt="Flowbite Logo"
                        />
                      </div>
                      <div className="w-full md:w-2/3 bg-white flex justify-between flex-col space-y-2 p-3">
                        <h3 className="font-bold text-gray-800 text-left text-[18px]">
                          Get FLAT 15% OFF* on Treebo <br /> Hotels.
                        </h3>

                        <p className="text-[16px] flex items-baseline font-normal text-[#777]">
                          Valid till: *Limited Period Offers
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                {" "}
                <div className="">
                  <div className="flex mx-2 flex-col justify-center lg:h-[30vh] md:h-[50] h-70">
                    <div className="relative  flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl  p-3 w-full mx-auto border-2 h-[85%]">
                      <div className="w-full md:w-1/3 bg-white grid place-items-center">
                        <Image
                          src="/images/image4.avif"
                          width={200}
                          height={200}
                          className="rounded-xl object-cover h-full"
                          alt="Flowbite Logo"
                        />
                      </div>
                      <div className="w-full md:w-2/3 bg-white flex justify-between flex-col space-y-2 p-3">
                        <h3 className="font-bold text-gray-800 text-left text-[18px]">
                          FLAT 15% SAVINGS* on Stays
                          <br /> at Taj!
                        </h3>

                        <p className="text-[16px] flex items-baseline  font-normal text-[#777]">
                          Valid till: 30th Sep'24
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                {" "}
                <div className="">
                  <div className="flex mx-2 flex-col justify-center lg:h-[30vh] md:h-[50] h-70">
                    <div className="relative  flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl  p-3 w-full mx-auto border-2 h-[85%]">
                      <div className="w-full md:w-1/3 bg-white grid place-items-center">
                        <Image
                          src="/images/image1.avif"
                          width={200}
                          height={200}
                          className="rounded-xl object-cover h-full"
                          alt="Flowbite Logo"
                        />
                      </div>
                      <div className="w-full md:w-2/3 bg-white flex justify-between flex-col space-y-2 p-3">
                        <h3 className="font-bold text-gray-800 text-left text-[18px]">
                          LIVE: Up to 50% OFF* on <br /> Hotels & Homestays in
                          India!
                        </h3>

                        <p className="text-[16px] flex items-baseline font-normal text-[#777]">
                          Valid till: 22nd Sep'24
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
            <div
              className="swiper-button-next swiper-custom-next right-0 absolute top-1/2 z-10 transform -translate-y-1/2  rounded-full px-4 py-2 cursor-pointer"
              style={{ backgroundColor: "orange", color: "white" }}
            >
              &#10095;
            </div>
          </div>
        </div>
        <div className="lg:w-3/4 md:2/4 w-full lg:my-20 md:my-12 my-10 p-5 bg-white mx-auto">
          <div className=" relative ">
            <div className="relative lg:block md:block hidden z-10">
              <div className="p-5 absolute bg-[url('/images/image5.avif')] w-[12.5rem] h-[20rem] bg-cover">
                <div className="flex text-white px-3 py-1 rounded-full bg-[#e47544] items-center">
                  <IoAlarmOutline />
                  <span className="text-xs ml-2">Ends in 6h: 19m: 11s</span>
                </div>
              </div>
            </div>
            <Swiper
              slidesPerView={3}
              spaceBetween={10}
              navigation={{
                nextEl: ".swiper-button-next1", // Right arrow
                prevEl: null, // Disable left arrow
              }}
              breakpoints={{
                // When the viewport width is >= 640px (mobile), show 1 slide
                300: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                // When the viewport width is >= 768px (tablet), show 2 slides
                768: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                // When the viewport width is >= 1024px (desktop), show 3 slides
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 10,
                },
              }}
              modules={[Navigation]} // Enable Navigation module
              className="mySwiper"
            >
              <SwiperSlide>
                {" "}
                <div className="px-1">
                  <div className="rounded-lg border-2 bg-white">
                    <a
                      className="relative mx-3 mt-3 flex h-[8rem] w-92 rounded-xl"
                      href="#"
                    >
                      <Image
                        src="/images/i1.jif"
                        width={200}
                        height={200}
                        className="object-cover w-full"
                        alt="Flowbite Logo"
                      />
                    </a>
                    <div className="mt-5 p-4">
                      <div className="text-[16px] text-black font-semibold">
                        <p>Z Express Inxs</p>
                      </div>
                      <p className="text-sm text-black">Bangalore</p>
                      <div className="flex items-center justify-between">
                        <div className="flex mt-5 items-center justify-start">
                          <div className="text-sm font-semibold bg-green-500 px-2 py-1 text-white rounded">
                            <p>4.3 / 5</p>
                          </div>
                          <div className="ml-2 text-sm text-black">
                            <p>9 Ratings</p>
                          </div>
                        </div>
                        <div className="flex mt-5 items-center justify-start">
                          <div className="text-[22px] font-semibold  px-2 py-1 text-black rounded">
                            <span className="mr-1 ">&#8377;</span>
                            <span>1319</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-right text-[#777]">
                        <strong>1 room </strong>
                        <span>Per night</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                {" "}
                <div className="px-1">
                  <div className="rounded-lg border-2 bg-white">
                    <a
                      className="relative mx-3 mt-3 flex h-[8rem] w-92 rounded-xl"
                      href="#"
                    >
                      <Image
                        src="/images/i1.jif"
                        width={200}
                        height={200}
                        className="object-cover w-full"
                        alt="Flowbite Logo"
                      />
                    </a>
                    <div className="mt-5 p-4">
                      <div className="text-[16px] text-black font-semibold">
                        <p>Z Express Inxs</p>
                      </div>
                      <p className="text-sm text-black">Bangalore</p>
                      <div className="flex items-center justify-between">
                        <div className="flex mt-5 items-center justify-start">
                          <div className="text-sm font-semibold bg-green-500 px-2 py-1 text-white rounded">
                            <p>4.3 / 5</p>
                          </div>
                          <div className="ml-2 text-sm text-black">
                            <p>9 Ratings</p>
                          </div>
                        </div>
                        <div className="flex mt-5 items-center justify-start">
                          <div className="text-[22px] font-semibold  px-2 py-1 text-black rounded">
                            <span className="mr-1 ">&#8377;</span>
                            <span>1319</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-right text-[#777]">
                        <strong>1 room </strong>
                        <span>Per night</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                {" "}
                <div className="px-1">
                  <div className="rounded-lg border-2 bg-white">
                    <a
                      className="relative mx-3 mt-3 flex h-[8rem] w-92 rounded-xl"
                      href="#"
                    >
                      <Image
                        src="/images/i1.jif"
                        width={200}
                        height={200}
                        className="object-cover w-full"
                        alt="Flowbite Logo"
                      />
                    </a>
                    <div className="mt-5 p-4">
                      <div className="text-[16px] text-black font-semibold">
                        <p>Z Express Inxs</p>
                      </div>
                      <p className="text-sm text-black">Bangalore</p>
                      <div className="flex items-center justify-between">
                        <div className="flex mt-5 items-center justify-start">
                          <div className="text-sm font-semibold bg-green-500 px-2 py-1 text-white rounded">
                            <p>4.3 / 5</p>
                          </div>
                          <div className="ml-2 text-sm text-black">
                            <p>9 Ratings</p>
                          </div>
                        </div>
                        <div className="flex mt-5 items-center justify-start">
                          <div className="text-[22px] font-semibold  px-2 py-1 text-black rounded">
                            <span className="mr-1 ">&#8377;</span>
                            <span>1319</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-right text-[#777]">
                        <strong>1 room </strong>
                        <span>Per night</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                {" "}
                <div className="px-1">
                  <div className="rounded-lg border-2 bg-white">
                    <a
                      className="relative mx-3 mt-3 flex h-[8rem] w-92 rounded-xl"
                      href="#"
                    >
                      <Image
                        src="/images/i1.jif"
                        width={200}
                        height={200}
                        className="object-cover w-full"
                        alt="Flowbite Logo"
                      />
                    </a>
                    <div className="mt-5 p-4">
                      <div className="text-[16px] text-black font-semibold">
                        <p>Z Express Inxs</p>
                      </div>
                      <p className="text-sm text-black">Bangalore</p>
                      <div className="flex items-center justify-between">
                        <div className="flex mt-5 items-center justify-start">
                          <div className="text-sm font-semibold bg-green-500 px-2 py-1 text-white rounded">
                            <p>4.3 / 5</p>
                          </div>
                          <div className="ml-2 text-sm text-black">
                            <p>9 Ratings</p>
                          </div>
                        </div>
                        <div className="flex mt-5 items-center justify-start">
                          <div className="text-[22px] font-semibold  px-2 py-1 text-black rounded">
                            <span className="mr-1 ">&#8377;</span>
                            <span>1319</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-right text-[#777]">
                        <strong>1 room </strong>
                        <span>Per night</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                {" "}
                <div className="px-1">
                  <div className="rounded-lg border-2 bg-white">
                    <a
                      className="relative mx-3 mt-3 flex h-[8rem] w-92 rounded-xl"
                      href="#"
                    >
                      <Image
                        src="/images/i1.jif"
                        width={200}
                        height={200}
                        className="object-cover w-full"
                        alt="Flowbite Logo"
                      />
                    </a>
                    <div className="mt-5 p-4">
                      <div className="text-[16px] text-black font-semibold">
                        <p>Z Express Inxs</p>
                      </div>
                      <p className="text-sm text-black">Bangalore</p>
                      <div className="flex items-center justify-between">
                        <div className="flex mt-5 items-center justify-start">
                          <div className="text-sm font-semibold bg-green-500 px-2 py-1 text-white rounded">
                            <p>4.3 / 5</p>
                          </div>
                          <div className="ml-2 text-black text-sm">
                            <p>9 Ratings</p>
                          </div>
                        </div>
                        <div className="flex mt-5 items-center justify-start">
                          <div className="text-[22px] font-semibold  px-2 py-1 text-black rounded">
                            <span className="mr-1 ">&#8377;</span>
                            <span>1319</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-right text-[#777]">
                        <strong>1 room </strong>
                        <span>Per night</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
            <div
              className="swiper-button-next1 swiper-custom-next right-0 absolute top-1/2 z-10 transform -translate-y-1/2  rounded-full px-4 py-2 cursor-pointer"
              style={{ backgroundColor: "orange", color: "white" }}
            >
              &#10095;
            </div>
          </div>
        </div>
        <div className="lg:w-3/4 md:w-full w-full mx-auto">
          <div className="bg-gray-100">
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-[22px] text-black font-bold text-start ">
                Popular Destinations
              </h1>
              <p className="text-[16px] text-[#46484d] font-normal mb-8">
                We have selected some best locations around the world for you.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-2xl shadow-lg group">
                  <Image
                    src="/images/b1.webp"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    alt="Flowbite Logo"
                  />

                  <div className="absolute inset-0 bg-black/30">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-2xl font-bold text-white">Mumbai</h3>
                      <p className="text-white">
                        Cosmpolitan and financial capital of India
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl shadow-lg group">
                  <Image
                    src="/images/b2.jpg"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    alt="Flowbite Logo"
                  />

                  <div className="absolute inset-0 bg-black/30">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-2xl font-bold text-white">
                        Ho Chi Minh
                      </h3>
                      <p className="text-white">
                        Economical, historical and entertainment centre of
                        Vietnam
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl shadow-lg group">
                  <Image
                    src="/images/b3.webp"
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover"
                    alt="Flowbite Logo"
                  />

                  <div className="absolute inset-0 bg-black/30">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-2xl font-bold text-white">Paris</h3>
                      <p className="text-white">The City of Light</p>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl shadow-lg group">
                  <Image
                    src="/images/b4.jpg"
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover"
                    alt="Flowbite Logo"
                  />

                  <div className="absolute inset-0 bg-black/30">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-2xl font-bold text-white">Krabi</h3>
                      <p className="text-white">
                        A quaint destination featuring endless natural beauty
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl shadow-lg group">
                  <Image
                    src="/images/b5.webp"
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover"
                    alt="Flowbite Logo"
                  />

                  <div className="absolute inset-0 bg-black/30">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-2xl font-bold text-white">
                        Maldives
                      </h3>
                      <p className="text-white">
                        An ultimate luxurious and romantic holiday destination
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl shadow-lg group">
                  <Image
                    src="/images/b6.jpg"
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover"
                    alt="Flowbite Logo"
                  />

                  <div className="absolute inset-0 bg-black/30">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-2xl font-bold text-white">Phuket</h3>
                      <p className="text-white">
                        A tropical paradise boasting of stunning beaches
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl shadow-lg group">
                  <Image
                    src="/images/b7.jpg"
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover"
                    alt="Flowbite Logo"
                  />

                  <div className="absolute inset-0 bg-black/30">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-2xl font-bold text-white">Bali</h3>
                      <p className="text-white">Land of the Gods</p>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl shadow-lg group">
                  <Image
                    src="/images/b8.webp"
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover"
                    alt="Flowbite Logo"
                  />

                  <div className="absolute inset-0 bg-black/30">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-2xl font-bold text-white">
                        Hyderabad
                      </h3>
                      <p className="text-white">
                        The glorious city of Nizams known for radiant pearls{" "}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl shadow-lg group">
                  <Image
                    src="/images/b9.jpg"
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover"
                    alt="Flowbite Logo"
                  />

                  <div className="absolute inset-0 bg-black/30">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-2xl font-bold text-white">Shimla</h3>
                      <p className="text-white">
                        Endearing combination of snow-covered peaks and blue sky{" "}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SwiperSliders />
    </>
  );
}
