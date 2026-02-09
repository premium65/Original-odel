'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import axios from 'axios';

interface Module {
  _id: string;
  pagename: string;
}

// Define the submodules based on the main module
const subModulesMap: Record<string, string[]> = {
  "User's Manage": ["Users", "Users Registration Request"],
  "Booking Management": ["Booking List", "Premium Booking List"],
  "Premium Management": ["Premium List", "Premium History"],
  "Reviews": ["Address", "Landmarks"],
  "Event Management": ["Event List"],
  "Transactions": ["Bonus", "Deposit", "Withdraw"],
  "About & Help Management": ["Help", "About", "Policy"],
  "Site Setting": ["Site setting"],
  "Admin controller": ["Sub Admin", "Sub Admin Logs", "Modules", "Sub Modules"],
};

const AddSubModules = () => {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]); // State for storing modules
  const [filteredSubModules, setFilteredSubModules] = useState<string[]>([]); // State for filtered submodules based on selected module
  const [selectedModuleId, setSelectedModuleId] = useState(''); // State for selected module ID

  // Fetch modules on component mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem('authToken');

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/getModules`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        if (response.status === 200) {
          setModules(response.data.result);
        } else {
          console.error('Failed to fetch modules');
        }
      } catch (error) {
        console.error('Error fetching modules');
      }
    };
    fetchModules();
  }, [router]);

  // Filter submodules based on selected module
  useEffect(() => {
    if (selectedModuleId) {
      const module = modules.find(mod => mod._id === selectedModuleId);
      if (module) {
        setFilteredSubModules(subModulesMap[module.pagename] || []);
      } else {
        setFilteredSubModules([]);
      }
    } else {
      setFilteredSubModules([]);
    }
  }, [selectedModuleId, modules]);

  // Define form validation schema with Yup
  const validationSchema = Yup.object({
    mainmodule: Yup.string().required('Module is required'),
    subModule: Yup.string().required('Submodule is required'),
    status: Yup.string().required('Status is required'),
  });

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      mainmodule: '',
      subModule: '',
      status: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/submodules`,
          {
            mainmodule: values.mainmodule,
            subModule: values.subModule,
            status: values.status,
          },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200) {
          router.push('/sub-modules');
          toast.success(response.data.message);
        } else {
          toast.error('Add submodule failed! Please try again.');
        }
      } catch (error: any) {
        const mainModuleError = error.response.data.error.mainmodule;
        const subModuleError = error.response.data.error.subModule;
        if (mainModuleError) {
          toast.error(mainModuleError);
        } else if (subModuleError) {
          toast.error(subModuleError);
        } else {
          toast.error('Add admin failed. Please check your credentials.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });
console.log("filteredSubModules", filteredSubModules)
  return (
    <form className="my-10 dark:text-white" onSubmit={formik.handleSubmit}>
      <div className='grid grid-cols-2 gap-4 my-5'>
        <div>
          <label htmlFor="mainmodule">Module</label>
          <div className="relative text-white-dark">
            <select
              id="mainmodule"
              name="mainmodule"
              className="form-input ps-10 placeholder:text-white-dark"
              value={formik.values.mainmodule}
              onChange={(e) => {
                formik.handleChange(e);
                setSelectedModuleId(e.target.value); // Set the selected module ID
              }}
              onBlur={formik.handleBlur}
            >
              <option value="">Select Module</option>
              {modules.map((module) => (
                <option key={module._id} value={module._id}>
                  {module.pagename}
                </option>
              ))}
            </select>
          </div>
          {formik.touched.mainmodule && formik.errors.mainmodule && (
            <p className="text-xs mt-1 text-red-500">{formik.errors.mainmodule}</p>
          )}
        </div>

        <div>
          <label htmlFor="subModule">SubModule</label>
          <div className="relative text-white-dark">
            <select
              id="subModule"
              name="subModule"
              className="form-input ps-10 placeholder:text-white-dark"
              value={formik.values.subModule}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={!selectedModuleId} // Disable submodule if no module is selected
            >
              <option value="">Select SubModule</option>
              {filteredSubModules.length > 0 ? (
                filteredSubModules.map((submodule, index) => (
                  <option key={index} value={submodule}>
                    {submodule}
                  </option>
                ))
              ) : (
                <option value="">No SubModules Available</option> // Default option when no submodules are available
              )}
            </select>
          </div>
          {formik.touched.subModule && formik.errors.subModule && (
            <p className="text-xs mt-1 text-red-500">{formik.errors.subModule}</p>
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

export default AddSubModules;
