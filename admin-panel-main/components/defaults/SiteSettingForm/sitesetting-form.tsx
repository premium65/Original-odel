'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from '@mantine/core';

const SiteSetting = () => {
  const router = useRouter();
  const [siteSettingData, setSiteSettingData] = useState<any[]>([]);
  const [adminsData, setAdminsData] = useState<any[]>([]);

  // Fetch Admins Data
  const fetchAdminsData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/admins`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setAdminsData(response.data.result.data);
      } else {
        console.error('Failed to load admins data.');
      }
    } catch (error) {
      console.error('An error occurred while fetching admins data.');
    }
  };

  // Fetch Site Setting Data
  const fetchSiteSettingData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/getSiteSetting`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setSiteSettingData(response.data.result);
      } else {
        console.error('Failed to load site setting data.');
      }
    } catch (error) {
      console.error('An error occurred while fetching site setting data.');
    }
  };

  useEffect(() => {
    fetchAdminsData();
    fetchSiteSettingData();
  }, [router]);

  // Formik initialization
  const formik:any = useFormik({
    initialValues: {
      whatsappLink: '',
      telegramLink: '',
      youtubeLink: '',
      faceBookLink: '',
      linkedinLink: '',
      twitterLink: '',
      instagramLink: '',
      tikTokLink: '',
      seqNo: '', // seqNo from selected admin
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/updateSiteDetails`,
          {
            ...values,
            type: "add",
            siteId: '', // Adjust this as needed
          },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200) {
          toast.success(response.data.message);
          fetchAdminsData();
          fetchSiteSettingData();
        } else {
          toast.error('Add site setting failed! Please try again.');
        }
      } catch (error) {
        toast.error('Add site setting failed. Please check your credentials.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle admin selection and populate fields
  const handleAdminChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAdminId = event.target.value;
    const selectedAdmin = adminsData.find((admin) => admin.seqNo == selectedAdminId);
    if (selectedAdmin) {
      // Find the site setting data corresponding to the selected admin
      const siteData = siteSettingData?.find((setting) => setting.adminSeqNo == selectedAdminId);
      // If siteData exists, populate the form values, else set them to empty strings
      formik.setValues({
        ...formik.values,
        whatsappLink: siteData?.whatsappLink || '',
        telegramLink: siteData?.telegramLink || '',
        youtubeLink: siteData?.youtubeLink || '',
        faceBookLink: siteData?.faceBookLink || '',
        linkedinLink: siteData?.linkedinLink || '',
        twitterLink: siteData?.twitterLink || '',
        instagramLink: siteData?.instagramLink || '',
        tikTokLink: siteData?.tikTokLink || '',
        seqNo: selectedAdmin.seqNo,
      });
    }
  };

  useEffect(() => {
    if (adminsData.length > 0) {
      formik.setFieldValue('seqNo', adminsData[0].seqNo); // Set the first admin as default selected
      const initialAdmin = adminsData[0];
      const initialSiteData = siteSettingData?.find((setting) => setting.adminSeqNo == initialAdmin.seqNo);
      // Populate fields with the initial admin's site data if it exists
      formik.setValues({
        ...formik.values,
        whatsappLink: initialSiteData?.whatsappLink || '',
        telegramLink: initialSiteData?.telegramLink || '',
        youtubeLink: initialSiteData?.youtubeLink || '',
        faceBookLink: initialSiteData?.faceBookLink || '',
        linkedinLink: initialSiteData?.linkedinLink || '',
        twitterLink: initialSiteData?.twitterLink || '',
        instagramLink: initialSiteData?.instagramLink || '',
        tikTokLink: initialSiteData?.tikTokLink || '',
      });
    }
  }, [adminsData, siteSettingData]);

  return (
    <div>
      <div className='flex justify-start my-5'>
        <Button
          className='cursor-auto'
          variant="filled"
          color="rgba(12, 1, 110, 1)">Social Media</Button>
      </div>
      <form className="my-10 dark:text-white" onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-2 gap-4 my-5">
          <div>
            <label htmlFor="subAdmin">Sub Admins</label>
            <select
              id="subAdmin"
              name="subAdmin"
              className="form-input ps-3 placeholder:text-white-dark"
              onChange={handleAdminChange}
              value={formik.values.seqNo}
            >
              {adminsData.map((admin) => (
                <option key={admin._id} value={admin.seqNo}>
                  {admin.name}
                </option>
              ))}
            </select>
          </div>

          {/* Link fields */}
          {['whatsappLink', 'telegramLink', 'youtubeLink', 'faceBookLink', 'linkedinLink', 'twitterLink', 'instagramLink', 'tikTokLink'].map((field) => (
            <div key={field}>
              <label htmlFor={field} className='capitalize'>{field.replace('Link', ' Link')}</label>
              <input
                id={field}
                name={field}
                type="text"
                className="form-input ps-3 placeholder:text-white-dark"
                value={formik.values[field]}
                onChange={formik.handleChange}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={!formik.isValid || formik.isSubmitting}
          className="btn btn-gradient w-fit border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
        >
          {formik.isSubmitting ? 'Loading...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default SiteSetting;
