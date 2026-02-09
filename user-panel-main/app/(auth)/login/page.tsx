"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
/* import { CountryCode } from "libphonenumber-js"; */
import { useRouter } from "next/navigation";
import { useSetRecoilState } from "recoil";
import { authState } from "@/state/authAtom";
import CountrySelect from "@/components/CountrySelect/countrySelect";
import { getCountryCallingCode } from "react-phone-number-input/input";

const Page = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const setIsLoggedIn = useSetRecoilState(authState);
  const [country, setCountry] = useState<any>("IN"); // default to India

  const setLoginCookie = (token: string, days: number) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000); // Set the expiration time based on the number of days
    document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()};`;
  };
  const formik = useFormik({
    initialValues: {
      countryCode: "+91",
      mobile: "",
      password: "",
    },
    validationSchema: Yup.object({
      mobile: Yup.string()
        .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
        .required("Mobile number is required"),
      /*   .test("is-valid-mobile", "Invalid mobile number for the selected country", validateMobileNumber) */ password:
        Yup.string()
          .min(6, "Password must be at least 6 characters")
          .max(18, "Password must be at most 18 characters")
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,18}$/,
            "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character."
          )
          .required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
          {
            phoneNo: values.mobile,
            password: values.password,
            countryCode: values.countryCode,
          }
        );
        if (response.status === 200) {
          localStorage.setItem("userToken", response.data.token);
          setLoginCookie(response.data.token, 1);
          setIsLoggedIn(true);
          toast.success(response.data.message);
          formik.resetForm();
          router.push("/");
        }
      } catch (error: any) {
        const errors = error.response.data.errors;
        if (error.status === 400) {
          toast.error(error.response.data.message);
        }
        // Displaying errors for each field
        if (errors.phoneNo) {
          toast.error(errors.phoneNo);
        }
        if (errors.password) {
          toast.error(errors.password);
        }
        if (errors.countryCode) {
          toast.error(errors.countryCode);
        }
      }
    },
  });
  return (
    <div className="relative py-10 h-auto bg-gray-50">
      <div className="absolute top-20 left-2 w-full h-[500px] lg:w-[500px] lg:h-[500px] bg-[#D1208A80] rounded-full mix-blend-multiply filter blur-[150px] opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-20 right-32 w-full h-[500px] lg:w-[250px] lg:h-[500px] bg-[#FFB20080] rounded-full mix-blend-multiply filter blur-[150px] opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="hidden xl:block absolute bottom-10 left-32 w-full h-[300px] lg:w-[300px] lg:h-[500px] bg-[#FFB20080] rounded-full mix-blend-multiply filter blur-[150px] opacity-70 animate-blob animation-delay-4000 -z-50 pointer-events-none"></div>
      <div className="absolute bottom-10 right-52 w-full h-[300px] lg:w-[250px] lg:h-[300px] bg-[#CAEEF580] rounded-full mix-blend-multiply filter blur-[150px] opacity-70 animate-blob animation-delay-4000 -z-50 pointer-events-none"></div>

      <div className="flex min-h-auto flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
            Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            For security, please login to access your information
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 z-10">
            {" "}
            {/* Added z-10 here */}
            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              <div>
                <label
                  htmlFor="countryCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <div className="mt-1">
                  <input
                    id="mobile"
                    name="mobile"
                    type="number"
                    className="block w-full appearance-none rounded-md border text-black border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.mobile}
                    maxLength={10}
                    pattern="\d*"
                  />
                  {formik.touched.mobile && formik.errors.mobile && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.mobile}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="">
                  <div className="relative mt-1">
                    <input
                      id="password"
                      name="password"
                      type={passwordVisible ? "text" : "password"}
                      className="block w-full appearance-none rounded-md border text-black border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
                    />
                    <span
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  <div>
                    {formik.touched.password && formik.errors.password && (
                      <p className="mt-2 text-sm text-red-600">
                        {formik.errors.password}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className={`w-full uppercase rounded-md bg-[#523200] px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-indigo-600 ring-offset-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    !formik.isValid ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!formik.isValid}
                >
                  Login
                </button>
              </div>
            </form>
            <div className="mt-6">
              <div className="">
                <div className="relative flex items-center justify-center text-sm">
                  <span className="text-black">Not yet Registered?</span>
                  <div className="text-[#523200] px-5 text-center font-semibold py-2 rounded">
                    <Link href={"/register"}>Create An Account</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
