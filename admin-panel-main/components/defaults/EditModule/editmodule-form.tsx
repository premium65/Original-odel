'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';

const EditModules: React.FC<{ id: any }> = ({ id }) => {
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState<string>(''); // State for storing modules
  useEffect(() => {
    const fetchSingleModule = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/singlemodule/${id}`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        if (response.status === 200) {
          const moduleData = response.data.result; // Ensure this returns the correct structure
          // Set initial values for Formik based on fetched data
          formik.setValues({
            pagename: moduleData.pagename || '',
            status: moduleData.status || '',
          });
          setSelectedModule(moduleData.pagename); // Set the selected module ID
        } else {
          console.error('Failed to fetch module');
        }
      } catch (error) {
        console.error('Error fetching module');
      }
    };
    fetchSingleModule();
  }, [id]);

  // Define form validation schema with Yup
  const validationSchema = Yup.object({
    pagename: Yup.string().required('Module is required'),
    status: Yup.string().required('Status is required'),
  });

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      pagename: '',
      status: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const token = localStorage.getItem('authToken');

        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules`,
          {
            id:id,
            pagename: values.pagename,
            status: values.status,
          },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200) {
          router.push('/modules');
          toast.success(response.data.message);
        } else {
          toast.error('Add Module failed! Please try again.');
        }
      } catch (error: any) {
        const errors = error.response?.data?.error || {};
        const pagenameError = errors.pagename;
        if(pagenameError)
        {   toast.error(`Error: ${pagenameError}`);} else {
        toast.error('Add Module failed. Please check your credentials.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form className="grid grid-cols-2 gap-4 my-10 dark:text-white" onSubmit={formik.handleSubmit}>
      <div>
        <label htmlFor="pagename">Module</label>
        <div className="relative text-white-dark">
          <select
            id="pagename"
            name="pagename"
            className="form-input ps-10 placeholder:text-white-dark"
            value={formik.values.pagename}
            onChange={(e) => {
              formik.handleChange(e);
              setSelectedModule(e.target.value); // Set the selected module ID
            }}
            onBlur={formik.handleBlur}
          >
            <option value="">Select Module</option>
              <option value={selectedModule}>
                {selectedModule}
              </option>
          </select>
        </div>
        {formik.touched.pagename && formik.errors.pagename && (
          <p className="text-xs mt-1 text-red-500">{formik.errors.pagename}</p>
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

export default EditModules;
