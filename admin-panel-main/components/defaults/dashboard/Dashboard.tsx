'use client';

import React, { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import { Fragment } from 'react';
import { useRouter } from 'next/navigation';

const DashboardComponent = () => {
    const router = useRouter()
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Retrieve token from localStorage
        const token = localStorage.getItem('authToken');
        // Fetch dashboard data with Bearer token
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/get-dashboard-data`,
          {
            headers: {
              Authorization: `${token}`, // Add Bearer prefix here
            },
          }
        );

        if (response.status === 200 && response.data.success) {
          setDashboardData(response.data.result.data);
        } else {
          console.error('Failed to load dashboard data.');
        }
      } catch (error: any) {
        // Handle errors
        console.error('An error occurred while fetching dashboard data.');
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      {dashboardData ? (
        <div>
          <div className="my-5">
            <Tab.Group>
              <div className="pl-4 space-x-2 sm:flex-[0_0_30%] sm:order-1">
                <Tab.List className="flex w-24 flex-row justify-center">
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={`${
                          selected ? '!bg-success text-white' : 'bg-gray-600 text-white'
                        } block rounded-l-md p-3.5 py-2 transition-all duration-300 hover:bg-success hover:text-white w-full text-left`}
                      >
                        Month
                      </button>
                    )}
                  </Tab>
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={`${
                          selected ? '!bg-success text-white' : 'bg-gray-600 text-white'
                        } block rounded-r-md p-3.5 py-2 transition-all duration-300 hover:bg-success hover:text-white w-full text-left`}
                      >
                        Year
                      </button>
                    )}
                  </Tab>
                </Tab.List>
              </div>
              <Tab.Panels>
                <Tab.Panel>
                  <div className="active">
                    <div className="mt-5">
                      <h2 className="text-xl font-semibold mb-4">Admin Income</h2>
                      <p>This Month's Profit: {dashboardData.monthlyProfit}</p>
                    </div>
                  </div>
                </Tab.Panel>
                <Tab.Panel>
                  <div className="active">
                    <div className="mt-5">
                      <h2 className="text-xl font-semibold mb-4">Admin Income</h2>
                      <p>This Year's Profit: {dashboardData.yearlyProfit}</p>
                    </div>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>

          <div className="my-6 grid grid-cols-1 gap-6 text-white sm:grid-cols-2 xl:grid-cols-2">
            {/* Total Approved User */}
            <div className="panel bg-gradient-to-r from-green-500 to-green-400">
              <div className="flex justify-between">
                <div className="text-md font-semibold">Total Approved User</div>
                <div className="dropdown">
                  <Dropdown
                    offset={[0, 5]}
                    placement="bottom-end"
                    btnClassName="hover:opacity-80"
                    button={<IconHorizontalDots className="opacity-70 hover:opacity-80" />}
                  >
                    <ul className="text-black dark:text-white-dark">
                      <li>
                        <Link href="/userList">User List</Link>
                      </li>
                    </ul>
                  </Dropdown>
                </div>
              </div>
              <div className="mt-5 flex items-center">
                <div className="text-3xl font-bold">{dashboardData.totalApprovedUser}</div>
              </div>
            </div>

            {/* Total Unapproved User */}
            <div className="panel bg-gradient-to-r from-violet-500 to-violet-400">
              <div className="flex justify-between">
                <div className="text-md font-semibold">Total Unapproved User</div>
                <div className="dropdown">
                  <Dropdown
                    offset={[0, 5]}
                    placement="bottom-end"
                    btnClassName="hover:opacity-80"
                    button={<IconHorizontalDots className="opacity-70 hover:opacity-80" />}
                  >
                    <ul className="text-black dark:text-white-dark">
                      <li>
                        <Link href="/userList">User List</Link>
                      </li>
                    </ul>
                  </Dropdown>
                </div>
              </div>
              <div className="mt-5 flex items-center">
                <div className="text-3xl font-bold">{dashboardData.totalUnapprovedUser}</div>
              </div>
            </div>

            {/* Total Completed Withdraw */}
            <div className="panel bg-gradient-to-r from-blue-500 to-blue-400">
              <div className="flex justify-between">
                <div className="text-md font-semibold">Total Completed Withdraw</div>
                <div className="dropdown">
                  <Dropdown
                    offset={[0, 5]}
                    placement="bottom-end"
                    btnClassName="hover:opacity-80"
                    button={<IconHorizontalDots className="opacity-70 hover:opacity-80" />}
                  >
                    <ul className="text-black dark:text-white-dark">
                      <li>
                        <Link href="/withdraw-list">Withdraw List</Link>
                      </li>
                    </ul>
                  </Dropdown>
                </div>
              </div>
              <div className="mt-5 flex items-center">
                <div className="text-3xl font-bold">{dashboardData.totalCompletedWithdraw}</div>
              </div>
            </div>

            {/* Total Pending Withdraw */}
            <div className="panel bg-gradient-to-r from-fuchsia-500 to-fuchsia-400">
              <div className="flex justify-between">
                <div className="text-md font-semibold">Total Pending Withdraw</div>
                <div className="dropdown">
                  <Dropdown
                    offset={[0, 5]}
                    placement="bottom-end"
                    btnClassName="hover:opacity-80"
                    button={<IconHorizontalDots className="opacity-70 hover:opacity-80" />}
                  >
                    <ul className="text-black dark:text-white-dark">
                      <li>
                        <Link href="/withdraw-list">Withdraw List</Link>
                      </li>
                    </ul>
                  </Dropdown>
                </div>
              </div>
              <div className="mt-5 flex items-center">
                <div className="text-3xl font-bold">{dashboardData.totalPendingWithdraw}</div>
              </div>
            </div>

            {/* Total Deposit */}
            <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
              <div className="flex justify-between">
                <div className="text-md font-semibold">Total Deposit</div>
                <div className="dropdown">
                  <Dropdown
                    offset={[0, 5]}
                    placement="bottom-end"
                    btnClassName="hover:opacity-80"
                    button={<IconHorizontalDots className="opacity-70 hover:opacity-80" />}
                  >
                    <ul className="text-black dark:text-white-dark">
                      <li>
                        <Link href="/deposit-list">Deposit List</Link>
                      </li>
                    </ul>
                  </Dropdown>
                </div>
              </div>
              <div className="mt-5 flex items-center">
                <div className="text-3xl font-bold">{dashboardData.totalDeposit}</div>
              </div>
            </div>

            {/* Total Commission */}
            <div className="panel bg-gradient-to-r from-red-500 to-red-400">
              <div className="flex justify-between">
                <div className="text-md font-semibold">Total Commission</div>
              </div>
              <div className="mt-5 flex items-center">
                <div className="text-3xl font-bold">{dashboardData.totalCommission}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='h-[200px] flex justify-center items-center'>
        <p>Loading dashboard data...</p>
        </div>
      )}
    </div>
  );
};

export default DashboardComponent;
