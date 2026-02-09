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

const EditSubModules: React.FC<{ id: any }> = ({ id }) => {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredSubModules, setFilteredSubModules] = useState<string[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedModuleName, setSelectedModuleName] = useState('');

  // Fetch modules
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

  // Fetch single submodule details
  useEffect(() => {
    const fetchSingleSubModule = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/singlesubmodule/${id}`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        if (response.status === 200) {
          const submoduleData = response.data.result; // Ensure this returns the correct structure
          // Set initial values for Formik based on fetched data
          formik.setValues({
            mainmodule: submoduleData.mainmoduleId || '',
            subModule: submoduleData.subModule || '',
            status: submoduleData.status || '',
          });
          setSelectedModuleId(submoduleData.mainmoduleId); // Set the selected module ID
          setSelectedModuleName(submoduleData.mainmoduleId); // Set the selected module name
        } else {
          console.error('Failed to fetch submodule');
        }
      } catch (error) {
        console.error('Error fetching submodule');
      }
    };
    fetchSingleSubModule();
  }, [id]); // Fetch submodule when the id prop changes

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

  // Form validation schema
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
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/submodules`,
          {
            id: id,
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
        const mainModuleError = error.response?.data?.error?.mainmodule;
        const subModuleError = error.response?.data?.error?.subModule;
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
                const moduleId = e.target.value;
                setSelectedModuleId(moduleId); // Set the selected module ID
                const selectedModule = modules.find(mod => mod._id === moduleId);
                setSelectedModuleName(selectedModule ? selectedModule.pagename : ''); // Set the selected module name
              }}
              onBlur={formik.handleBlur}
            >
              <option value="">Select Module</option>
              {selectedModuleId && modules.length > 0 ? (
                <option key={selectedModuleId} value={selectedModuleId}>
                  {modules.find(module => module._id === selectedModuleId)?.pagename}
                </option>
              ) : (
                <option value="">No Modules Available</option>
              )}
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
                <option value="">No SubModules Available</option>
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
        className="bg-primary text-white p-2 rounded hover:bg-primary-dark"
      >
        Update SubModule
      </button>
    </form>
  );
};

export default EditSubModules;
