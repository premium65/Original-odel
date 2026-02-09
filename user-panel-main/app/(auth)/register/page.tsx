"use client";
import React, { useState } from "react";
import "react-phone-number-input/style.css";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { getCountryCallingCode } from "react-phone-number-input/input";
import CountrySelect from "@/components/CountrySelect/countrySelect";

const RegistrationPage = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [country, setCountry] = useState<any>("IN"); // default to India

  const formik = useFormik({
    initialValues: {
      name: "",
      countryCode: "+91",
      mobile: "",
      password: "",
      confirm: "",
      invitation: "",
      termsAndConditions: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().matches(/^.*\S.*$/, "Name cannot be empty or just spaces").required("Name is required"),
      mobile: Yup.string()
        .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
        .required("Mobile number is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .max(18, "Password must be at most 18 characters")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,18}$/,
          "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )
        .required("Password is required"),
      confirm: Yup.string()
        .oneOf([Yup.ref("password"), ""], 'Must match "password" field value')
        .required("Confirm Password is required"),
      invitation: Yup.string().required("Invitation Code is required"),
      termsAndConditions: Yup.bool().oneOf(
        [true],
        "You need to accept the terms and conditions"
      ),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register-request`,
          {
            username: values.name,
            phoneNo: values.mobile,
            password: values.password,
            confirmPassword: values.confirm,
            isTerms: values.termsAndConditions,
            inviteCode: values.invitation,
            countryCode: values.countryCode,
          }
        );
        if (response.status === 200) {
          toast.success(response.data.message);
          formik.resetForm();
          router.push("/login");
        }
      } catch (error: any) {
        const errors = error.response.data.errors;
        if (error.status === 500 || error.status === 400) {
          toast.error(error.response.data.message);
        }
        // Displaying errors for each field
        if (errors.username) {
          toast.error(errors.username);
        }
        if (errors.phoneNo) {
          toast.error(errors.phoneNo);
        }
        if (errors.password) {
          toast.error(errors.password);
        }
        if (errors.confirmPassword) {
          toast.error(errors.confirmPassword);
        }
        if (errors.isTerms) {
          toast.error(errors.isTerms);
        }
        if (errors.inviteCode) {
          toast.error(errors.inviteCode);
        }
        if (errors.countryCode) {
          toast.error(errors.countryCode);
        }
      }
    },
  });
  return (
    <div className="relative bg-gray-50 lg:overflow-visible md:overflow-visible overflow-auto pb-10">
      <div className="absolute top-20 left-2 w-full h-[500px] lg:w-[500px] lg:h-[500px] bg-[#D1208A80] rounded-full mix-blend-multiply filter blur-[150px] opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-20 right-28 w-full h-[500px] lg:w-[250px] lg:h-[500px] bg-[#FFB20080] rounded-full mix-blend-multiply filter blur-[150px] opacity-70 animate-blob animation-delay-2000 z-0 pointer-events-none"></div>
      <div className="hidden xl:block absolute bottom-10 left-10 w-full h-[500px] lg:w-[150px] lg:h-[500px] bg-[#FFB20080] rounded-full mix-blend-multiply filter blur-[150px] opacity-70 animate-blob animation-delay-4000 z-0 pointer-events-none"></div>
      <div className="absolute bottom-10 right-26  w-full h-[500px] lg:w-[500px] lg:h-[500px] bg-[#CAEEF580] rounded-full mix-blend-multiply filter blur-[150px] opacity-70 animate-blob animation-delay-4000 z-0 pointer-events-none"></div>

      <div className="flex min-h-screen flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Register
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter below details to register your account
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 z-10">
            {" "}
            {/* Added z-10 here */}
            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="block w-full appearance-none rounded-md border text-black border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.name}
                    </p>
                  )}
                </div>
              </div>
                            <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country with Mobile number
                </label>
                <div className="mt-1 flex gap-2">
                  <div className="w-32">
                <CountrySelect
                  value={country}
                  onChange={(selectedCountry:any) => {
                    setCountry(selectedCountry);
                    formik.setFieldValue("countryCode", `+${getCountryCallingCode(selectedCountry)}`);
                  }}
                /></div>
                                <div className="flex-1">
                  <input
                    id="mobile"
                    name="mobile"
                    type="number"
                    className="w-full bg-white rounded-md border text-black border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
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
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {formik.errors.password}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirm"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <div className="relative mt-1">
                    <input
                      id="confirm"
                      name="confirm"
                      type={confirmPasswordVisible ? "text" : "password"}
                      className="block w-full appearance-none rounded-md border text-black border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.confirm}
                    />
                    <span
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                      onClick={() =>
                        setConfirmPasswordVisible(!confirmPasswordVisible)
                      }
                    >
                      {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {formik.touched.confirm && formik.errors.confirm && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.confirm}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="invitation"
                  className="block text-sm font-medium text-gray-700"
                >
                  Invitation Code
                </label>
                <div className="mt-1">
                  <input
                    id="invitation"
                    name="invitation"
                    type="text"
                    className="block w-full appearance-none rounded-md border text-black border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.invitation}
                  />
                  {formik.touched.invitation && formik.errors.invitation && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.invitation}
                    </p>
                  )}
                </div>
              </div>

              <div className="z-50">
                <input
                  id="termsAndConditions"
                  name="termsAndConditions"
                  type="checkbox"
                  className="mr-2"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.termsAndConditions}
                />
                <label
                  htmlFor="termsAndConditions"
                  className="text-sm text-gray-900"
                >
                  I agree to the{" "}
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    className="text-[#523200] hover:text-indigo-500"
                  >
                    Terms and conditions
                  </Link>
                </label>
                <div className="block">
                  {formik.touched.termsAndConditions &&
                    formik.errors.termsAndConditions && (
                      <p className="mt-2 text-sm text-red-600">
                        {formik.errors.termsAndConditions}
                      </p>
                    )}
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className={`w-full uppercase rounded-md bg-[#523200] px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1`}
  /*                 disabled={!formik.isValid} */
                  title={!formik.isValid ? "Please fill in all details or fix errors" : ""}
                >
                  {formik.isSubmitting ? "Loading":"Register"}
                </button>
              </div>
            </form>
            <div className="mt-6">
              <div className="">
                <div className="relative flex items-center justify-center text-sm">
                  <span className="text-black">Already have an account?</span>
                  <div className="text-[#523200] ml-1 text-center font-semibold py-2 rounded">
                    <Link href={"/login"}>Login</Link>
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

export default RegistrationPage;
