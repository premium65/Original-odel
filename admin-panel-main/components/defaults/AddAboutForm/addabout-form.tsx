'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const AddAbout = () => {
  const router = useRouter();

  // Define form validation schema with Yup
  const validationSchema = Yup.object({
    identifier: Yup.string().required('Identifier is required'),
    title: Yup.string().required('Title is required'),
    content: Yup.string().required('Content is required'),
    status: Yup.string().required('Status is required'),
  });

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      identifier: '',
      title: '',
      content: '',
      status: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/cms`,
          {
            identifier: values.identifier,
            title: values.title,
            content: values.content,
            status: values.status,
            type: "about"
          },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 201) {
          router.push('/about-list');
          toast.success(response.data.message);
        } else {
          toast.error('Add about failed! Please try again.');
        }
      } catch (error: any) {
        toast.error('Add about failed. Please check your credentials.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form className="my-10 dark:text-white" onSubmit={formik.handleSubmit}>
      <div className='grid grid-cols-2 gap-4 my-5'>
        <div>
          <label htmlFor="identifier">Identifier</label>
          <input
            id="identifier"
            name="identifier"
            type='text'
            className="form-input ps-3 placeholder:text-white-dark"
            value={formik.values.identifier}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.identifier && formik.errors.identifier && (
            <p className="text-xs mt-1 text-red-500">{formik.errors.identifier}</p>
          )}
        </div>

        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type='text'
            className="form-input ps-3 placeholder:text-white-dark"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.title && formik.errors.title && (
            <p className="text-xs mt-1 text-red-500">{formik.errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            className="form-input ps-3 placeholder:text-white-dark"
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
        <div className="col-span-1 my-3 md:col-span-2">
          <label htmlFor="content">Content</label>
          <CKEditor
            editor={ClassicEditor}
            data={formik.values.content}
            onChange={(event, editor) => {
              const data = editor.getData();
              formik.setFieldValue('content', data);
            }}
          />
          {formik.touched.content && formik.errors.content && (
            <p className="text-xs mt-1 text-red-500">{formik.errors.content}</p>
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

export default AddAbout;
