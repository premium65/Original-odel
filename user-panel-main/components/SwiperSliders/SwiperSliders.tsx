import React from "react";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import Image from "next/image";

export const SwiperSliders = () => {
  return (
    <>
      <div className="bg-white">
        <div className="lg:text-6xl md:text-6xl text-4xl pt-10 fon text-black  text-center font-bold">
          <p>Our Associations</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 text-center pt-4 px-2">
            At Goib.tech partner, we are proud to work closely with reputable
            associations and organisations that share our vision of world-class
            travel experiences.
          </p>
        </div>
        <div className="container w-3/4 mx-auto lg:p-20 md:p-20 p-0 lg:py-20 md:py-20 py-10">
          <div className="relative">
            <Swiper
              slidesPerView={5}
              spaceBetween={30}
              loop={true}
              autoplay={{
                delay: 2000,
              }}
              navigation={{
                nextEl: ".swiper-button-next1", // Right arrow
                prevEl: ".swiper-button-prev1", // Left arrow
              }}
              breakpoints={{
                300: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                1024: {
                  slidesPerView: 5,
                  spaceBetween: 10,
                },
              }}
              modules={[Navigation, Autoplay]}
              className="mySwiper"
            >
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo1.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo2.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo3.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo4.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo5.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo6.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo7.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo8.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo9.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo10.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo11.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo12.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo13.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="mx-2">
                  <Image
                    src="/images/logo14.png"
                    style={{ width: "60%", margin: "auto", height: "auto" }}
                    width={200}
                    height={200}
                    className=""
                    alt=""
                  />
                </div>
              </SwiperSlide>
            </Swiper>
            {/* Custom Next Button */}
            <div
              className="swiper-button-next1 swiper-custom-next lg:-right-[53px] md:-right-[53px] right-[0px] absolute top-1/2 z-10 transform -translate-y-1/2 rounded-full px-4 py-2 cursor-pointer"
              style={{ backgroundColor: "orange", color: "white" }}
            >
              &#10095;
            </div>

            {/* Custom Previous Button */}
            <div
              className="swiper-button-prev1 swiper-custom-prev lg:-left-[133px] md:-left-[133px] left-[0px] absolute top-1/2 z-10 transform -translate-y-1/2 rounded-full px-4 py-2 cursor-pointer"
              style={{ backgroundColor: "orange", color: "white" }}
            >
              &#10094;
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
