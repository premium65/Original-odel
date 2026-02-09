'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';

interface EditBonusProps {
  id: any;
}

const EditBonus: React.FC<EditBonusProps> = ({ id }) => {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('')
  const [singleBonus, setSingleBonus] = useState({
    amount: '',
    taskCount: '',
    status: '',
    userCode: ''
  });

  // Define form validation schema with Yup
  const validationSchema = Yup.object({
    amount: Yup.string().required('Bonus Amount is required'),
    taskCount: Yup.string().required('Task Count is required'),
    status: Yup.string().required('Status is required'),
  });

  useEffect(() => {
    const fetchBonusData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/single-bonus/${id}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        const bonus = response.data.result;
        setSingleBonus({
          amount: bonus.amount || '',
          taskCount: bonus.taskCount || '',
          status: bonus.status || '',
          userCode: bonus.userCode || ''
        });
        setUserId(bonus.userId)
      } catch (error) {
        console.error('Failed to load bonus data.');
      }
    };
    
    if (id) {
      fetchBonusData();
    }
  }, [id]);

  // Initialize Formik
  const formik = useFormik({
    initialValues: singleBonus,
    enableReinitialize: true, // Reinitialize form when singleBonus changes
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/update-bonus`,
          {
            amount: values.amount,
            taskCount: values.taskCount,
            status: values.status,
            _id: id,
          },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200) {
          router.push(`/bonus-list/${userId}`);
          toast.success(response.data.message);
        } else {
          toast.error('Update Bonus failed! Please try again.');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Something went wrong.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form className="my-10 dark:text-white" onSubmit={formik.handleSubmit}>
      <div className="grid grid-cols-2 gap-4 my-5">
        <div>
          <label htmlFor="amount">Bonus Amount</label>
          <div className="relative text-white-dark">
            <input
              id="amount"
              name="amount"
              className="form-input ps-10 placeholder:text-white-dark"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          {formik.touched.amount && formik.errors.amount && (
            <p className="text-xs mt-1 text-red-500">{formik.errors.amount}</p>
          )}
        </div>
        <div>
          <label htmlFor="taskCount">Task Count</label>
          <div className="relative text-white-dark">
            <input
              id="taskCount"
              name="taskCount"
              className="form-input ps-10 placeholder:text-white-dark"
              value={formik.values.taskCount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          {formik.touched.taskCount && formik.errors.taskCount && (
            <p className="text-xs mt-1 text-red-500">{formik.errors.taskCount}</p>
          )}
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <div className="relative text-white-dark">
            <select
              id="status"
              name="status"
              className="form-input ps-10 placeholder:text-white-dark"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="deactive">Deactive</option>
            </select>
          </div>
          {formik.touched.status && formik.errors.status && (
            <p className="text-xs mt-1 text-red-500">{formik.errors.status}</p>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={!formik.isValid || formik.isSubmitting}
        className="btn btn-gradient w-fit border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
      >
        {formik.isSubmitting ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
};

export default EditBonus;
