'use client'
import { IconDownload, IconLoader } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import { toast } from 'react-toastify';
import { useState } from 'react';
import axios from 'axios';

const DatabaseComponent = () => {
  const [backupSuccess, setBackupSuccess] = useState<boolean>(false);
  const backupDb = async () => {
    setBackupSuccess(true)
    try {
      // Retrieve token from localStorage
      const token = localStorage.getItem('authToken');
      // Fetch backup data with Bearer token
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/backup`,
        {
          headers: {
            Authorization: `${token}`, // Add Bearer prefix here
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        toast.success(`${response.data.message}`);
        setBackupSuccess(false)
      } else {
        toast.error('Failed to backupdb data.');
        setBackupSuccess(false)
      }
    } catch (error: any) {
      // Handle errors
      toast.error('An error occurred while backupdb data.');
      setBackupSuccess(false)
    }
  };
  return (
    <div>
      <div className='mx-4 md:mx-10 my-5'>
        <h1 className='text-2xl'>Database Management</h1>
      </div>
<div className="shadow-lg rounded-lg overflow-hidden mx-4 md:mx-10">
    <table className="w-full table-fixed">
        <thead>
            <tr className="bg-gray-100">
                <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">Operations</th>
                <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">Actions</th>
            </tr>
        </thead>
        <tbody className="bg-white">
            <tr>
                <td className="py-4 px-6 border-b border-gray-200">Backup</td>
                <td className="py-4 px-6 border-b border-gray-200">
                <Button onClick={backupDb} rightSection={backupSuccess? <IconLoader size={14} />:<IconDownload size={14} />}>{backupSuccess ? "Loading":"Create Backup"}</Button>
                </td>
            </tr>
        </tbody>
    </table>
</div>
    </div>
  );
};

export default DatabaseComponent;
