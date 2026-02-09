'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react'; // Import useState
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';
import { IconLockOpen, IconLockPassword, IconMailFilled, IconUserFilled } from '@tabler/icons-react';

const AddSubadminForm = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility

  // Define form validation schema with Yup
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .max(18, 'Password must be at most 18 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,18}$/,
        'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      )
      .required('Password is required'),
      role: Yup.string().required('Role is required'),
  });

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      name:'',
      email: '',
      password: '',
      role:'',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
               const token = localStorage.getItem('authToken');
        // Use environment variable for API base URL
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/sub-admin`,
          {
            name: values.name,
            email: values.email,
            password: values.password,
            role: values.role
          },
          {
          headers: {
            Authorization: `${token}`,
          }
        }
        );

        if (response.status === 200) {
          // Display success toast notification
          router.push('/sub-admin');
          toast.success(response.data.message);
        } else {
          // Handle other status codes
          toast.error('Add admin failed! Please try again.');
        }
      } catch (error: any) {
        // Safely handle error responses
        const errors = error.response?.data?.errors || {};
        const nameError = errors.name;
        const emailError = errors.email;
        const passwordError = errors.password;
        const roleError = errors.role;

        if (nameError && emailError && passwordError && roleError) {
          toast.error(`Error: Both name, email, password and role are incorrect.`);
        } else if (nameError) {
          toast.error(`Error: ${nameError}`);
        } else if (emailError) {
          toast.error(`Error: ${emailError}`);
        }  else if (passwordError) {
          toast.error(`Error: ${passwordError}`);
        } else if (roleError) {
          toast.error(`Error: ${roleError}`);
        } else {
          toast.error('Add admin failed. Please check your credentials.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form className="grid grid-cols-2 gap-4 my-10 dark:text-white" onSubmit={formik.handleSubmit}>
            <div>
        <label htmlFor="name">Name</label>
        <div className="relative text-white-dark">
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter Name"
            className="form-input ps-10 placeholder:text-white-dark"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <span className="absolute start-4 top-1/2 -translate-y-1/2">
            <IconUserFilled size={18} />
          </span>
        </div>
        {formik.touched.name && formik.errors.name && (
          <p className='text-xs mt-1 text-red-500'>
            {formik.errors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <div className="relative text-white-dark">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter Email"
            className="form-input ps-10 placeholder:text-white-dark"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <span className="absolute start-4 top-1/2 -translate-y-1/2">
            <IconMailFilled size={18} />
          </span>
        </div>
        {formik.touched.email && formik.errors.email && (
          <p className='text-xs mt-1 text-red-500'>
            {formik.errors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <div className="relative text-white-dark">
          <input
            id="password"
            name="password"
            type={passwordVisible ? 'text' : 'password'} // Toggle input type
            placeholder="Enter Password"
            className="form-input ps-10 placeholder:text-white-dark"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <span
            className="absolute start-4 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setPasswordVisible(!passwordVisible)} // Toggle visibility
          >
            {passwordVisible ? <IconLockOpen size={18}/> : <IconLockPassword size={18} />}
          </span>
        </div>
        {formik.touched.password && formik.errors.password && (
          <p className='text-xs mt-1 text-red-500'>
            {formik.errors.password}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="role">Role</label>
        <div className="relative text-white-dark">
          <select
            id="role"
            name="role"
            placeholder="select Role"
            className="form-input ps-10 placeholder:text-white-dark"
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}>
                <option value="">Select</option>
              <option value="subadmin">Sub admin</option>
            </select>
          <span className="absolute start-4 top-1/2 -translate-y-1/2">
            <IconUserFilled size={18} />
          </span>
        </div>
        {formik.touched.role && formik.errors.role && (
          <p className='text-xs mt-1 text-red-500'>
            {formik.errors.role}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={!formik.isValid || formik.isSubmitting}
        className="btn btn-gradient w-fit border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
      >
        {formik.isSubmitting ? "Loading..." : "Submit"}
      </button>
    </form>
  );
};

export default AddSubadminForm;
