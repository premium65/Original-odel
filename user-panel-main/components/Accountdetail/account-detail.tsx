"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { userAtom } from "@/state/userAtom";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Spinner,
  Button,
} from "@nextui-org/react";
import CryptoJS from "crypto-js";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const AccountDetail = () => {
  const router = useRouter();
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [userData, setUserData] = useRecoilState(userAtom);
  const [gender, setGender] = useState<any>(userData?.gender || "");
  const [isFirstModalOpen, setIsFirstModalOpen] = useState<boolean>(false);
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
  const handleUpdateGender = async () => {
    if (!gender) {
      // Show an error if the gender is not selected
      return toast.error("Please select a valid gender.");
    }

    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update-gender`,
        { gender: gender },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        toast.success(response.data.message);
        await fetchUserData();
      } else {
        toast.error("Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error updating gender:", error);
      toast.error("Failed to update gender");
    }
  };

  const handleProfilePicUpload = async (e: any) => {
    const profilePic = e.target.files[0];
    if (!profilePic) {
      return toast.error("Please select a profile picture first");
    }

    const formData = new FormData();
    formData.append("profilePic", profilePic);

    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/update-profile-pic`,
        formData,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        toast.success(response.data.message);
        await fetchUserData();
      } else {
        toast.error("Failed to update profile picture");
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const handleCopyInvitationCode = () => {
    navigator.clipboard.writeText(
      userData?.invitationCode ? userData?.invitationCode : ""
    );
    toast.success("Invitation code copied to clipboard");
  };
  const openFirstModal = () => {
    setIsFirstModalOpen(true);
  };

  const closeFirstModal = () => {
    setIsFirstModalOpen(false);
  };
  const encryptObject = (encryptValue: any) => {
    try {
      let ciphertext = CryptoJS.AES.encrypt(
        JSON.stringify(encryptValue),
        `${process.env.NEXT_PUBLIC_CRYPTOSECRETKEY}`
      ).toString();
      return ciphertext;
    } catch (err) {
      return "";
    }
  };
  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string()
        .min(6, "Old Password must be at least 6 characters")
        .max(18, "Old Password must be at most 18 characters")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,18}$/,
          "Old Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )
        .required("Old Password is required"),
      newPassword: Yup.string()
        .min(6, "New Password must be at least 6 characters")
        .max(18, "New Password must be at most 18 characters")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,18}$/,
          "New Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )
        .required("New Password is required"),
      confirmPassword: Yup.string()
        .oneOf(
          [Yup.ref("newPassword"), ""],
          'Must match "password" field value'
        )
        .required("Confirm Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        const result = await encryptObject({
          oldPassword: values.oldPassword,
          password: values.newPassword,
          confirmPassword: values.confirmPassword,
        });
        const token = localStorage.getItem("userToken");
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/changePassword`,
          {
            id: result,
          },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        if (response.status === 200) {
          toast.success(response.data.message);
          formik.resetForm();
        }
      } catch (error: any) {
        const errors = error.response.data.errors;
        if (error.status === 500) {
          toast.error(error.response.data.message);
        }
        // Displaying errors for each field
        if (errors.oldPassword) {
          toast.error(errors.oldPassword);
        }
        if (errors.password) {
          toast.error(errors.password);
        }
        if (errors.confirmPassword) {
          toast.error(errors.confirmPassword);
        }
      }
    },
  });
  if (!userData) {
    return (
      <div className="flex h-[300px] justify-center items-center">
        <Spinner label="Loading..." color="warning" />
      </div>
    );
  }
  return (
    <div>
      <div className="container mx-auto bg-[#ec742b] py-3">
        <div className="text-center flex items-center justify-center mx-2 text-white font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6 mx-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
            />
          </svg>

          <p>Book Now & Earn Rewards</p>
        </div>
      </div>

      <div className="bg-gray-200 shadow py-5 container mx-auto">
        <div className="w-5/6 mx-auto">
          <div className="flex justify-start items-center">
            <button
              onClick={() => {
                router.back();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 text-black"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <p className="mx-2 text-lg text-black font-semibold">
              Account Details
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white my-5 max-w-xl mx-auto shadow overflow-hidden sm:rounded-lg">
        <div className="flex p-5 items-center justify-start">
          <div>
            <Image
              src={
                userData?.profilePic
                  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${userData?.profilePic}`
                  : "/images/user.jpg"
              }
              width={200}
              height={200}
              className="w-20 rounded-full h-20"
              alt=""
            />
          </div>
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-xl leading-6 font-bold text-gray-900">
              {userData?.userName}
            </h3>
            <p className="text-sm mt-1 text-black">#{userData?.userId}</p>
            <div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={async (e: any) => {
                  await handleProfilePicUpload(e);
                }}
              />
              <label
                htmlFor="file-upload"
                className="bg-[#ec742b] hover:bg-blue-700 text-sm mt-1 text-white py-1 px-2 rounded cursor-pointer"
              >
                Upload Profile Picture
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Phone Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userData?.phoneCode} {userData?.phoneNo}
              </dd>
            </div>

            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Invitation code
              </dt>
              <dd className="mt-1 text-sm flex items-center text-gray-900 sm:mt-0 sm:col-span-2">
                {userData?.invitationCode}
                <div title="Copy" onClick={handleCopyInvitationCode}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6 mx-2 cursor-pointer"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6"
                    />
                  </svg>
                </div>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <label className="text-sm font-medium text-gray-500">
                Password
              </label>
              <form className="flex items-center justify-between">
                <div className="relative">
                  <div className="">
                    <input
                      type="password"
                      placeholder="............."
                      className=" text-sm text-gray-900 px-3 py-2 bg-transparent  flex items-center border-2 border-[#ec742b] rounded sm:mt-0 sm:col-span-2"
                    ></input>
                  </div>
                  <div className="absolute top-0 cursor-pointer -right-2">
                    <Button onPress={openFirstModal}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 text-orange-500"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              </form>
              <Modal
                isOpen={isFirstModalOpen}
                onOpenChange={(open: any) =>
                  open ? openFirstModal() : closeFirstModal()
                }
                placement="center"
              >
                <ModalContent>
                  {(onClose: any) => (
                    <>
                      <ModalHeader className="flex border-2 text-black pb-2 flex-col gap-1">
                        Change Password
                      </ModalHeader>
                      <ModalBody>
                        <div className="border-b-2 pb-2">
                          <form
                            className="space-y-6"
                            onSubmit={formik.handleSubmit}
                          >
                            <div>
                              <label
                                htmlFor="oldPassword"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Old Password
                              </label>
                              <div className="">
                                <div className="relative mt-1">
                                  <input
                                    id="oldPassword"
                                    name="oldPassword"
                                    type={
                                      oldPasswordVisible ? "text" : "password"
                                    }
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.oldPassword}
                                    placeholder="Enter your Old Password"
                                  />
                                  <span
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                    onClick={() =>
                                      setOldPasswordVisible(!oldPasswordVisible)
                                    }
                                  >
                                    {oldPasswordVisible ? (
                                      <FaEyeSlash />
                                    ) : (
                                      <FaEye />
                                    )}
                                  </span>
                                </div>
                                <div>
                                  {formik.touched.oldPassword &&
                                    formik.errors.oldPassword && (
                                      <p className="mt-2 text-sm text-red-600">
                                        {formik.errors.oldPassword}
                                      </p>
                                    )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <label
                                htmlFor="newPassword"
                                className="block text-sm font-medium text-gray-700"
                              >
                                New Password
                              </label>
                              <div>
                                <div className="relative mt-1">
                                  <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={
                                      newPasswordVisible ? "text" : "password"
                                    }
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.newPassword}
                                    placeholder="Enter your New Password"
                                  />
                                  <span
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                    onClick={() =>
                                      setNewPasswordVisible(!newPasswordVisible)
                                    }
                                  >
                                    {newPasswordVisible ? (
                                      <FaEyeSlash />
                                    ) : (
                                      <FaEye />
                                    )}
                                  </span>
                                </div>
                                <div>
                                  {formik.touched.newPassword &&
                                    formik.errors.newPassword && (
                                      <p className="mt-2 text-sm text-red-600">
                                        {formik.errors.newPassword}
                                      </p>
                                    )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Confirm New Password
                              </label>
                              <div>
                                <div className="relative mt-1">
                                  <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                      confirmPasswordVisible
                                        ? "text"
                                        : "password"
                                    }
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.confirmPassword}
                                    placeholder="Re Enter New Password"
                                  />
                                  <span
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                    onClick={() =>
                                      setConfirmPasswordVisible(
                                        !confirmPasswordVisible
                                      )
                                    }
                                  >
                                    {confirmPasswordVisible ? (
                                      <FaEyeSlash />
                                    ) : (
                                      <FaEye />
                                    )}
                                  </span>
                                </div>
                                <div>
                                  {formik.touched.confirmPassword &&
                                    formik.errors.confirmPassword && (
                                      <p className="mt-2 text-sm text-red-600">
                                        {formik.errors.confirmPassword}
                                      </p>
                                    )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <button
                                type="submit"
                                className={`w-full uppercae rounded-md bg-[#523200] px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-indigo-600 ring-offset-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                                  !formik.isValid
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                disabled={!formik.isValid}
                              >
                                Submit
                              </button>
                            </div>
                          </form>
                        </div>
                      </ModalBody>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <label className="text-sm font-medium text-gray-500">
                Gender
              </label>
              <select
                value={gender}
                required
                onChange={(e) => setGender(e.target.value)}
                className="text-sm text-gray-900 px-3 w-full py-2 bg-transparent border-2 border-[#ec742b] rounded sm:mt-0 sm:col-span-2"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div className="bg-gray-50 p-5">
              <button
                onClick={handleUpdateGender}
                className="bg-[#ec742b] hover:bg-[#fd9256] text-white text-sm py-2 px-5 rounded"
              >
                Update
              </button>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
