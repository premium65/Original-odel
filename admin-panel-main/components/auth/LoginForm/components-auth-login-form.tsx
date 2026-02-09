'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'; // Import useState
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';
import { IconLockOpen, IconLockPassword, IconMailFilled } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { fetchSubModulesFailure, fetchSubModulesStart, fetchSubModulesSuccess } from '@/store/allowedModulesSlice';

const ComponentsAuthLoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility
  const [role, setRole] = useState('')
  const [restrictData, setRestrictData] = useState<any[]>([])
  const [token, setToken] = useState<string>('')
  const { data: allowedModulesData, allowedLoading, allowedError } = useSelector((state: IRootState) => state.allowedModules);
  // Define form validation schema with Yup
  const validationSchema = Yup.object({
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
  });
  const setLoginCookie = (token: string, days: number) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000); // Set the expiration time based on the number of days
    document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()};`;
};

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Use environment variable for API base URL
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/login`,
          {
            email: values.email,
            password: values.password,
          }
        );

        if (response.status === 200) {
          setRole(response.data.result.role)
          setToken(response.data.token)
          setRestrictData(response.data.result.restriction)
           // Save token to localStorage
           localStorage.setItem('authToken', response.data.token);
           setLoginCookie(response.data.token, 7);
          // Display success toast notification
          toast.success(response.data.message);
          if(response.data.result.role === 'superadmin'){
           router.push("/dashboard")
          }
        } else {
          // Handle other status codes
          toast.error('Login failed! Please try again.');
        }
      } catch (error: any) {
        // Safely handle error responses
        const errors = error.response?.data?.errors || {};
        const emailError = errors.email;
        const passwordError = errors.password;

        if (emailError && passwordError) {
          toast.error(`Error: Both email and password are incorrect.`);
        } else if (emailError) {
          toast.error(`Error: ${emailError}`);
        } else if (passwordError) {
          toast.error(`Error: ${passwordError}`);
        } else {
          toast.error('Login failed. Please check your credentials.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });
  useEffect(() => {
    const fetchSubmodulesData = async () => {
        dispatch(fetchSubModulesStart());
        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/submodules`,
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );
    
          if (response.status === 200 && response.data.success) {
            const subModulesData = response.data.result.data
            if (subModulesData && restrictData) {
                const filteredModules = subModulesData.filter((submodule:any) =>
                    restrictData.includes(submodule._id)
                );

                dispatch(fetchSubModulesSuccess(filteredModules));
            }
          } else {
            dispatch(fetchSubModulesFailure('Failed to load submodules data.'));
            console.error('Failed to load submodules data.');
          }
        } catch (error) {
            dispatch(fetchSubModulesFailure('An error occurred while fetching submodules data.'));
            console.error('An error occurred while fetching submodules data.');
        }
      };
      if(role === "subadmin"){
        fetchSubmodulesData();
          } 
        }, [dispatch, token, role, router]);
        useEffect(() => {
          if (Array.isArray(allowedModulesData) && allowedModulesData.length > 0) {
            // Define the submodules and their respective routes
            const subModuleRoutes = [
              { subModule: "Users", route: "/userList" },
              { subModule: "Users Registration Request", route: "/userRegReq" },
              { subModule: "Booking List", route: "/booking-list" },
              { subModule: "Premium Booking List", route: "/premium-list" },
              { subModule: "Premium List", route: "/premium-list" },
              { subModule: "Premium History", route: "/premium-history" },
              { subModule: "Address", route: "/addresses-list" },
              { subModule: "Landmarks", route: "/landmarks-list" },
              { subModule: "Event List", route: "/event-list" },
              { subModule: "Bonus", route: "/bonus-history-list" },
              { subModule: "Deposit", route: "/deposit-list" },
              { subModule: "Withdraw", route: "/withdraw-list" },
              { subModule: "Help", route: "/help-list" },
              { subModule: "About", route: "/about-list" },
              { subModule: "Policy", route: "/policy-list" },
              { subModule: "Site setting", route: "/site-setting" },
              { subModule: "Sub Admin", route: "/sub-admin" },
              { subModule: "Sub Admin Logs", route: "/sub-admin-logs" },
              { subModule: "Modules", route: "/modules" },
              { subModule: "Sub Modules", route: "/sub-modules" },
            ];
        
            // Find the first matching submodule in allowedModulesData
            const matchingRoute = subModuleRoutes.find(({ subModule }) =>
              allowedModulesData.some((module) => module.subModule === subModule)
            );
        
            // If a match is found, redirect to the corresponding route
            if (matchingRoute) {
              router.push(matchingRoute.route);
            }
          }
        }, [allowedModulesData, router]);
        
  return (
    <form className="space-y-5 dark:text-white" onSubmit={formik.handleSubmit}>
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
      <button
        type="submit"
        disabled={!formik.isValid || formik.isSubmitting}
        className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
      >
        {formik.isSubmitting ? "Loading..." : "Login"}
      </button>
    </form>
  );
};

export default ComponentsAuthLoginForm;
