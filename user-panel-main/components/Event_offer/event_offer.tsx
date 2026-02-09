"use client";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useRouter } from "next/navigation";

const Event_offer = () => {
  const router = useRouter();
  const [eventData, setEventData] = useState<any[]>([]);
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/getEvents`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200 && response.data.success) {
          setEventData(response.data.result);
        } else {
          console.error("Failed to load event data.");
        }
      } catch (error) {
        console.error("An error occurred while fetching event data.");
      }
    };

    fetchEventData();
  }, []);
  return (
    <div>
      <div>
        <div className="container mx-auto bg-[#ec742b] py-3 overflow-y-auto">
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
              <p className="mx-2  text-lg text-black font-semibold">Event</p>
            </div>
          </div>
          <div className="relative w-3/4 container mx-auto flex px-3 py-3">
            <Swiper
              slidesPerView={1}
              spaceBetween={30}
              loop={true}
              autoplay={{
                delay: 5000,
              }}
              navigation={{
                nextEl: ".swiper-button-next1", // Right arrow
                prevEl: ".swiper-button-prev1", // Left arrow
              }}
              breakpoints={{
                425: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                768: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                1024: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
              }}
              modules={[Navigation, Autoplay]}
            >
              {eventData &&
                eventData?.map((event, index) => (
                  <SwiperSlide
                    key={index}
                    className="rounded overflow-hidden shadow-lg"
                  >
                    <div>
                      <div className="hidden md:block">
      <Image
        width={500}
        height={500}
        className="w-full h-full"
        style={{ maxHeight: "400px" }}
        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${event.deskView}`}
        alt="Desktop Event View"
      />
      </div>
      <div className="block md:hidden">
      <Image
        width={500}
        height={500}
        className="w-full h-full"
        style={{ maxHeight: "400px" }}
        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${event.mobileView}`}
        alt="Mobile Event View"
      />
       </div>
                      <div className="px-6 py-4">
                        <div className="font-bold text-sm md:text-xl mb-2">
                          {event.title}
                        </div>
                        <p className="text-gray-700 text-sm md:text-base">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
            </Swiper>
            {/* Custom Next Button */}
            <div
              className="swiper-button-next1 swiper-custom-next lg:-right-[54px] md:-right-[54px] right-[-40px] absolute top-1/2 z-10 transform -translate-y-1/2 rounded-full px-4 py-2 cursor-pointer"
              style={{ backgroundColor: "orange", color: "white" }}
            >
              &#10095;
            </div>

            {/* Custom Previous Button */}
            <div
              className="swiper-button-prev1 swiper-custom-prev lg:-left-[54px] md:-left-[54px] left-[-40px] absolute top-1/2 z-10 transform -translate-y-1/2 rounded-full px-4 py-2 cursor-pointer"
              style={{ backgroundColor: "orange", color: "white" }}
            >
              &#10094;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event_offer;
