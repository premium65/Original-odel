"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { walletAtom } from "@/state/walletAtom";
import { useRecoilState } from "recoil";
import { userAtom } from "@/state/userAtom";
import { getCountryCallingCode } from "react-phone-number-input/input";
import CountrySelect from "../CountrySelect/countrySelect";

const Withdraw = () => {
  const router = useRouter();
  const [amount, setAmount] = useState<number>();
  const [walletData, setWalletData] = useRecoilState(walletAtom);
  const [userData, setUserData] = useRecoilState(userAtom);
  const [country, setCountry] = useState<any>("IN"); // default to India
  const availableBalance = walletData?.totalBalance;

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
 // Withdraw submission handler
 const handleWithdrawSubmit = async () => {
  try {
    const token = localStorage.getItem("userToken");
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/wallet/withdraw-request`,
      {
        amount,
        availableBalance,
      },
      {
        headers: {
          Authorization: `${token}`,
        },
      }
    );

    if (response.status === 200) {
      toast.success(response.data.message);
      await fetchWalletData();
      setAmount(0); // Clear the amount field
    }
  } catch (error: any) {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Failed to submit withdraw request.");
    }
  }
};
  const formik = useFormik({
    initialValues: {
      holderName: "",
      countryCode: "+91",
      phoneNo: "",
      accountNo: "",
      bankName: "",
      IFSC: "",
      UPI: "",
    },
    validationSchema: Yup.object({
      holderName: Yup.string().required("Holder Name is required"),
      phoneNo: Yup.string()
        .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
        .required("Mobile number is required"),
        accountNo: Yup.string().required("Account Number is required"),
      bankName: Yup.string().required("Bank Name is required"),
      IFSC: Yup.string().required("IFSC is required"),
    }),
    onSubmit: async (values) => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update-bank-details`,
          {
            holderName: values.holderName,
            phoneNo: values.phoneNo,
            accountNo: values.accountNo,
            bankName: values.bankName,
            IFSC: values.IFSC,
            UPI: values.UPI,
            countryCode: values.countryCode,
          },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        if (response.status === 200) {
          toast.success(response.data.message);
          await fetchUserData();
          formik.resetForm();
        }
      } catch (error: any) {
        const errors = error.response.data.errors;
        if (error.status === 500) {
          toast.error(error.response.data.message);
        }
        // Displaying errors for each field
        if (errors.holderName) {
          toast.error(errors.holderName);
        }
        if (errors.phoneNo) {
          toast.error(errors.phoneNo);
        }
        if (errors.accountNo) {
          toast.error(errors.accountNo);
        }
        if (errors.bankName) {
          toast.error(errors.bankName);
        }
        if (errors.IFSC) {
          toast.error(errors.IFSC);
        }
        if (errors.UPI) {
          toast.error(errors.UPI);
        }
        if (errors.countryCode) {
          toast.error(errors.countryCode);
        }
      }
    },
  });
  return (
    <div>
      <div>
        <div className="container mx-auto bg-[#ec742b] py-3">
          <div className="text-center flex items-center justify-center mx-2 text-white font-semibold">
            <a href="">
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
            </a>
            <p>Book Now & Earn Rewards</p>
          </div>
        </div>
        <div className="bg-gray-200 shadow  py-5 container mx-auto">
          <div className="w-5/6 mx-auto ">
            <div className="flex justify-start items-center">
            <button
              onClick={() => {
                router.back();
              }}>
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
              <p className="mx-2  text-lg text-black font-semibold">
                Withdraw
              </p>
            </div>
          </div>
        </div>
        {Array.isArray(userData?.bankDetails) && userData?.bankDetails.length > 0 ? (<><div className="bg-white py-10">
          <div className="w-5/6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <form className="border-2 p-5 rounded-xl">
                <div className="text-lg pb-3 flex items-center justify-between font-bold text-black">
                  <p>Account Available Balance</p>
                  <p>₹{availableBalance}</p>
                </div>
                <div className="mt-4">
                  <label className="block text-[#666]">Withdraw Amount</label>
                  <input
                    className="shadow-inner bg-gray-100 rounded-full text-[#666] p-4 border-none block mt-1 w-full"
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={amount}
                    required
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                  />
                </div>

                <div className="mt-3">
                  <button
                    onClick={handleWithdrawSubmit}
                    type="button"
                    className="px-8 py-3 text-white font-semibold rounded bg-[#e2b771]"
                  >
                    Withdraw
                  </button>
                </div>
              </form>

              <div className="bg-gray-100 p-8 rounded-xl">
                <h2 className="font-bold text-lg text-black">Notes</h2>
                <ul className="list-disc text-black text-sm mt-4 list-inside">
                  <li>
                    1.Minimum withdrawal amount is 500 Rupees
                  </li>
                  <li>
                    2. Please bind your own bank accounts correctly.
                  </li>
                  <li>
                    3. If User enter the bank information wrongly, contact the customer support team on the same time.
                  </li>
                  <li>4. Withdrawal hours are 10.00 to 22:00 daily</li>
                  <li>
                    5. The total amount of Balance can withdraw for all users.
                  </li>
                  <li>
                    6. Maximum 1 hour will take for received withdrawal amount (Time may vary depending on servers of various banks).
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div></>) : (<>
        <div className="bg-white lg:w-5/12 md:w-full w-full p-4 mx-auto py-10">
          <div className=" ">
            <div className="">
              <form className="border-2 p-5 rounded-xl" onSubmit={formik.handleSubmit}>
                <p className="text-lg font-semibold text-gray-500 border-b-2 pb-2">
                  Enter your account details
                </p>
                <div className="pt-4">
                  <label className="block  text-[#666]">Account Holder</label>
                  <input
                    className="shadow-inner bg-gray-100 rounded-lg text-[#666]   p-4 border-none block mt-1 w-full"
                    id="holderName"
                    type="text"
                    placeholder="Enter your name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.holderName}
                  />
                   {formik.touched.holderName && formik.errors.holderName && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.holderName}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="countryCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mobile Number
                  </label>
                  <div className="mt-1">
                  <CountrySelect
                  value={country}
                  onChange={(selectedCountry:any) => {
                    setCountry(selectedCountry);
                    formik.setFieldValue("countryCode", `+${getCountryCallingCode(selectedCountry)}`);
                  }}
                />
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    id="mobile"
                    name="phoneNo"
                    type="text"
                    placeholder="Enter Mobile Number"
                    className="shadow-inner bg-gray-100 rounded-lg text-[#666]   p-4 border-none block mt-1 w-full"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phoneNo}
                    maxLength={10}
                    pattern="\d*"
                  />
                  {formik.touched.phoneNo && formik.errors.phoneNo && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.phoneNo}
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <label className="block  text-[#666]">Account Number</label>
                  <input
                    className="shadow-inner bg-gray-100 rounded-lg text-[#666]   p-4 border-none block mt-1 w-full"
                    id="accountNo"
                    type="text"
                    placeholder="Enter your account number"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.accountNo}
                  />
                                 {formik.touched.accountNo && formik.errors.accountNo && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.accountNo}
                    </p>
                  )}
                </div>
                <div className="pt-4">
                  <label className="block  text-[#666]">Name of the Bank</label>
                  <input
                    className="shadow-inner bg-gray-100 rounded-lg text-[#666]   p-4 border-none block mt-1 w-full"
                    id="bankName"
                    type="text"
                    placeholder="Enter your bank name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.bankName}
                  />
                                 {formik.touched.bankName && formik.errors.bankName && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.bankName}
                    </p>
                  )}
                </div>
                <div className="pt-4">
                  <label className="block  text-[#666]">IFSC Code</label>
                  <input
                    className="shadow-inner bg-gray-100 rounded-lg text-[#666]   p-4 border-none block mt-1 w-full"
                    id="IFSC"
                    type="text"
                    placeholder="Enter your IFSC code"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.IFSC}
                  />
                                 {formik.touched.IFSC && formik.errors.IFSC && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.IFSC}
                    </p>
                  )}
                </div>
                <div className="pt-4">
                  <label className="block  text-[#666]">
                    UPI ID ( optional )
                  </label>
                  <input
                    className="shadow-inner bg-gray-100 rounded-lg text-[#666]   p-4 border-none block mt-1 w-full"
                    id="UPI"
                    type="text"
                    placeholder="Enter your UPI ID"
                    onChange={formik.handleChange}
                    value={formik.values.UPI}
                  />
                </div>
                <div className="flex items-center justify-between mt-8">
                  <button
                    type="submit"
                    className={`w-full py-3 text-white font-semibold rounded bg-[#e2b771] ${
                    !formik.isValid ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                    disabled={!formik.isValid}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div></>)}
      </div>
    </div>
  );
};

export default Withdraw;
