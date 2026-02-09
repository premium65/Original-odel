"use client";
import { Button, PasswordInput } from '@mantine/core';
import { IconStatusChange } from '@tabler/icons-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Define the validation schema using Yup
const validationSchema = Yup.object({
  oldPassword: Yup.string().required('Old Password is required'),
  newPassword: Yup.string()
        .min(6, "New Password must be at least 6 characters")
        .max(18, "New Password must be at most 18 characters")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,18}$/,
          "New Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )
        .required("New Password is required"),
        confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), ""], 'Must match "New Password" field value')
        .required("Confirm Password is required")
});

const ChangePasswordForm = () => {
  const router = useRouter();

  // Initialize form values based on the admin profile data
  const initialValues: any = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  // Handle form submission
  const handleEditSubmit = async (values: { oldPassword: string; newPassword: string; confirmPassword: string;}) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
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
        router.push('/dashboard')
      } else {
        toast.error('Failed to password change.');
      }
    } catch (error: any) {
      const errors = error.response?.data?.errors || {};
      console.log("Error", errors)
      const oldPasswordError = errors.oldPassword;
      const newPasswordError = errors.newPassword;
      const confirmPasswordError = errors.confirmPassword;
      if(oldPasswordError && newPasswordError && confirmPasswordError){
        toast.error('New, Old and Confirm Password required');
      } else if (oldPasswordError) {
        toast.error(`Error: ${oldPasswordError}`);
      } else if (newPasswordError) {
        toast.error(`Error: ${newPasswordError}`);
      } else if (confirmPasswordError) {
        toast.error(`Error: ${confirmPasswordError}`);
      } else {
        toast.error('An error occurred while changing password.');
      }
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
    <Form className="w-full max-w-md">
      {/* Old Password Field */}
      <div className="my-3">
        <label htmlFor="oldPassword" className="block font-semibold mb-2">Enter Old Password:</label>
        <Field
          name="oldPassword"
          as={PasswordInput}
          className="w-full"
        />
        <ErrorMessage
          name="oldPassword"
          component="div"
          className="text-red-500 text-sm mt-2"
        />
      </div>

      {/* New Password Field */}
      <div className="my-3">
        <label htmlFor="newPassword" className="block font-semibold mb-2">Enter New Password:</label>
        <Field
          name="newPassword"
          as={PasswordInput}
          className="w-full"
        />
        <ErrorMessage
          name="newPassword"
          component="div"
          className="text-red-500 text-sm mt-2"
        />
      </div>

      {/* Confirm Password Field */}
      <div className="my-3">
        <label htmlFor="confirmPassword" className="block font-semibold mb-2">Enter Confirm Password:</label>
        <Field
          name="confirmPassword"
          as={PasswordInput}
          className="w-full"
        />
        <ErrorMessage
          name="confirmPassword"
          component="div"
          className="text-red-500 text-sm mt-2"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center my-5">
        <Button type="submit" disabled={isSubmitting || !isValid} className={`px-4 py-2 rounded ${isSubmitting || !isValid ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' : ''} text-white`}>
          <IconStatusChange className="mr-2" /> Change Password
        </Button>
      </div>
    </Form>
  )}
</Formik>

      </div>
    </div>
  );
};

export default ChangePasswordForm;
