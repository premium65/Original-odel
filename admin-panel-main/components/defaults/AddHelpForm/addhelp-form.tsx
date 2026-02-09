'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddHelp = () => {
  const router = useRouter();

  // Define form validation schema with Yup
  const validationSchema = Yup.object({
    question: Yup.string().required('Question is required'),
    answer: Yup.string().required('Answer is required'),
    status: Yup.string().required('Status is required'),
  });

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      categoryId: '', // Assuming this will be implemented later
      question: '',
      answer: '',
      status: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/faq`,
          {
            categoryId: values.categoryId || '', // Set categoryId appropriately
            question: values.question,
            answer: values.answer,
            status: values.status,
          },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200) {
          router.push('/help-list');
          toast.success(response.data.message);
        } else {
          toast.error('Add help failed! Please try again.');
        }
      } catch (error: any) {
        toast.error('Add help failed. Please check your credentials.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form className="my-10 dark:text-white" onSubmit={formik.handleSubmit}>
      <div className='grid grid-cols-2 gap-4 my-5'>
        <div>
          <label htmlFor="question">Question</label>
          <textarea
            id="question"
            name="question"
            className="form-input ps-10 placeholder:text-white-dark"
            value={formik.values.question}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.question && formik.errors.question && (
            <p className="text-xs mt-1 text-red-500">{formik.errors.question}</p>
          )}
        </div>

        <div>
          <label htmlFor="answer">Answer</label>
          <textarea
            id="answer"
            name="answer"
            className="form-input ps-10 placeholder:text-white-dark"
            value={formik.values.answer}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.answer && formik.errors.answer && (
            <p className="text-xs mt-1 text-red-500">{formik.errors.answer}</p>
          )}
        </div>

        <div>
          <label htmlFor="status">Status</label>
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

export default AddHelp;
