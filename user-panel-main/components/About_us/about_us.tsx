"use client";
import React, { useEffect, useState } from "react";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const About_us = () => {
  const router = useRouter();
  const [aboutData, setAboutData] = useState<any[]>([]);
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/type-cms/about`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200 && response.data.success) {
          setAboutData(response.data.result);
        } else {
          console.error("Failed to load about data.");
        }
      } catch (error) {
        console.error("An error occurred while fetching about data.");
      }
    };

    fetchAboutData();
  }, []);
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
              <p className="mx-2  text-lg text-black font-semibold">About Us</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-5 px-2">
          <div className="lg:w-5/6 md:w-5/6 w-full mx-auto ">
            <div className="flex justify-start items-center">
              <div className="flex w-full flex-col">
                <Tabs aria-label="Options" placement={"start"}>
                  {aboutData &&
                    aboutData?.map(
                      (about, index) =>
                        about.status == "active" && (
                          <Tab
                            key={`${index}`}
                            aria-label={`${about.title}`}
                            title={<span className="text-black">{`${about.title}`}</span>}
                          >
                            <Card>
                              <CardBody>
                                <div
                                  className="text-sm md:text-base text-black"
                                  dangerouslySetInnerHTML={{
                                    __html: about.content,
                                  }}
                                />
                              </CardBody>
                            </Card>
                          </Tab>
                        )
                    )}
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About_us;
