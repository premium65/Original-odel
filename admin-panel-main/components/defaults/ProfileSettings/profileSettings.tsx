"use client";
import { Button, TextInput } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { fetchProfileSuccess } from '@/store/adminProfileSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Define the validation schema using Yup
const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  phoneNumber: Yup.number().typeError('Invalid phone number').required('Phone number is required'),
});

const ProfileSettings = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const adminProfileData = useSelector((state: IRootState) => state.adminProfile.data);

  // Initialize form values based on the admin profile data
  const initialValues: any = {
    name: adminProfileData?.name || '',
    email: adminProfileData?.email || '',
    phoneNumber: adminProfileData?.phoneNumber || '',
    _id: adminProfileData?._id || '',
  };

  // Handle form submission
  const handleEditSubmit = async (values: { name: string; email: string; phoneNumber: number; _id: string }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/adminProfile`,
          values,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        toast.success(response.data.message);
        dispatch(fetchProfileSuccess(response.data.result));
        router.push('/dashboard')
      } else {
        toast.error('Failed to update profile.');
      }
    } catch (error: any) {
      const errors = error.response?.data?.error || {};
      const nameError = errors.name;
      const emailError = errors.email;
      const mobileError = errors.mobile;
      if(nameError && emailError && mobileError){
        toast.error('Name, Email and Mobile number required');
      } else if (nameError) {
        toast.error(`Error: ${nameError}`);
      } else if (emailError) {
        toast.error(`Error: ${emailError}`);
      } else if (mobileError) {
        toast.error(`Error: ${mobileError}`);
      } else {
        toast.error('An error occurred while updating profile.');
      }
      toast.error('An error occurred while updating profile.');
    }
  };

  return (
    <div className="my-10">
      <div className="flex justify-start items-center w-3/4">
      <Formik
  initialValues={initialValues}
  validationSchema={validationSchema}
  onSubmit={handleEditSubmit}
>
  {({ isSubmitting, isValid }) => (
    <Form className="w-full max-w-md mx-auto">
      {/* Name Field */}
      <div className="my-3">
        <label htmlFor="name" className="block font-semibold mb-2">Enter Name:</label>
        <Field
          name="name"
          as={TextInput}
          className="w-full border rounded px-3 py-2"
        />
        <ErrorMessage
          name="name"
          component="div"
          className="text-red-500 text-sm mt-2"
        />
      </div>

      {/* Email Field */}
      <div className="my-3">
        <label htmlFor="email" className="block font-semibold mb-2">Enter Email Address:</label>
        <Field
          name="email"
          as={TextInput}
          className="w-full border rounded px-3 py-2"
        />
        <ErrorMessage
          name="email"
          component="div"
          className="text-red-500 text-sm mt-2"
        />
      </div>

      {/* Phone Number Field */}
      <div className="my-3">
        <label htmlFor="phoneNumber" className="block font-semibold mb-2">Enter Phone Number:</label>
        <Field
          name="phoneNumber"
          type="text"
          as={TextInput}
          className="w-full border rounded px-3 py-2"
        />
        <ErrorMessage
          name="phoneNumber"
          component="div"
          className="text-red-500 text-sm mt-2"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center my-5">
        <Button type="submit" disabled={isSubmitting || !isValid} className={`px-4 py-2 rounded ${isSubmitting || !isValid ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' : ''} text-white`}>
          <IconCheck className="mr-2" /> Save Changes
        </Button>
      </div>
    </Form>
  )}
</Formik>

      </div>
    </div>
  );
};

export default ProfileSettings;
