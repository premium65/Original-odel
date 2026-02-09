"use client"
import axios from "axios";
import React, { FC, useEffect, useState } from "react";
import { toast } from "react-toastify";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

interface WithdrawProps{
filter: string
}
dayjs.extend(utc);
dayjs.extend(timezone);
const WithdrawTable:FC<WithdrawProps> = ({filter}) => {
  const [withdrawData, setWithdrawData] = useState<any[]>([]);
  const renderDate = (date: string) => {
    const parsedDate = dayjs(date);
    return parsedDate.isValid() ? parsedDate.tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm') : 'Invalid Date';
  };
  const fetchWithdrawData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/wallet/get-transaction-history?filter=${filter}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setWithdrawData(response.data.result.data);
      } else {
        console.error("Failed to load withdraw data.");
      }
    } catch (error) {
      console.error("An error occurred while fetching withdraw data.");
    }
  };
  useEffect(() => {
    fetchWithdrawData();
  }, [filter]);
  return (
    <div>
      <div className="flex flex-col">
        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full border">
                <thead className="border-b">
                  <tr>
                    <th
                      scope="col"
                      className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                    >
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody>
                {withdrawData &&
                  withdrawData?.map(
                    (withdraw, index) =>(
                  <tr  key={`${index}`} className="border-b">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {renderDate(withdraw?.createdAt)}
                    </td>
                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                      ₹  {withdraw?.amount}
                    </td>
                    <td className="text-sm text-[#bf6613] font-light px-6 py-4 whitespace-nowrap">
                    {withdraw?.type}
                    </td>
                    <td
                          className={`text-sm font-light px-6 py-4 whitespace-nowrap capitalize ${
                            withdraw?.status === "completed"
                              ? "text-green-600"
                              : withdraw?.status === "pending"
                              ? "text-yellow-500"
                              : "text-red-600"
                          }`}
                        >
                          {withdraw?.status}
                        </td>
                    <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                    {withdraw?.reason}
                    </td>
                  </tr>))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawTable;
