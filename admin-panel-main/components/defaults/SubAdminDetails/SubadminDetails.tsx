"use client";
import Breadcrumb from '@/components/Breadcrumb';
import { Checkbox, UnstyledButton, Text, Button, TextInput, Group } from '@mantine/core';
import { IconCheck, IconPencil, IconX } from '@tabler/icons-react';
import axios from 'axios';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// Define the interface for the Google 2FA object
interface Google2FA {
  secret: string;
  uri: string;
}

// Define the interface for the Admin object
interface AdminData {
  name: string;
  adminInviteId: string;
  seqNo: number;
  email: string;
  password: string;
  phoneNumber?: number; // Optional
  conFirmMailToken: string;
  mailToken: string;
  otptime: Date;
  role?: 'superadmin' | 'admin' | 'subadmin'; // Optional
  restriction?: any[]; // Specify a more precise type if possible
  google2Fa: Google2FA;
  createdAt: Date;
}

const SubAdminDetails = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminData | undefined>(undefined);
  const [restrictData, setRestrictData] = useState<any[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);

  // States for editing
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [newName, setNewName] = useState<string | undefined>('');
  const [newEmail, setNewEmail] = useState<string | undefined>('');
  const [page, setPage] = useState(1);
  const [totalSubmodules, setTotalSubmodules] = useState<number>(0);;
  const name = pathname.split('/sub-admin/')[1];
  const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Sub Admin Detail', href: `/sub-admin/${name}` },
  ];
  const PAGE_SIZE = 10;

  const fetchUserData = async () => {
    const id = searchParams.get('id');
    if (id) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/subAdmin/${id}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200 && response.data.success) {
          setAdminData(response.data.result);
          setSelectedRestrictions(response.data.result.restriction || []);
          setNewName(response.data.result.name);
          setNewEmail(response.data.result.email);
        } else {
          console.error('Failed to load user data.');
        }
      } catch (error) {
        console.error('An error occurred while fetching user data.');
      }
    } else {
      console.log('No ID found in query parameters');
    }
  };
  const fetchSubmodulesData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/submodules?page=${page}&limit=${PAGE_SIZE}&fillter=%7B%7D&sortObj=%7B%7D`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setRestrictData(response.data.result.data)
        setTotalSubmodules(response.data.result.count)
      } else {
        console.error('Failed to load submodules data.');
      }
    } catch (error) {
      console.error('An error occurred while fetching submodules data.');
    }
  };
  useEffect(() => {
    fetchUserData();
    fetchSubmodulesData();
  }, [router, searchParams, page]);

  // Modify the handleCheckboxChange function
  const handleCheckboxChange = (id: string) => {
    setSelectedRestrictions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };


  const handleSubmit = async () => {
    const id = searchParams.get('id');
    if (id) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/rolemanage`,
          {
            id, // Admin ID
            restriction: selectedRestrictions, // Array of selected restrictions
          },
          {
            headers: {
              Authorization: `${token}`, // Ensure correct token format
            },
          }
        );
  
        if (response.status === 200 && response.data.success) {
          toast.success('Restrictions updated successfully.');
          await fetchUserData();
          await fetchSubmodulesData();
        } else {
          toast.error('Failed to update restrictions.');
        }
      } catch (error:any) {
        const errors = error.response?.data?.error || {};
        const restrictError = errors.restriction;
        if (restrictError) {
          toast.error(`Error: ${restrictError}`);
        } else {
          toast.error('An error occurred while updating restrictions.');
          }
      }
    }
  };
  
  const handleEditSubmit = async () => {
    const id = searchParams.get('id');
    if (id) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/edit-admin`,
          {
            id,
            name: newName,
            email: newEmail,
          },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200 && response.data.success) {
          toast.success(response.data.message);
          setIsEditingName(false);
          setIsEditingEmail(false);
          setNewName(newName);
          setNewEmail(newEmail)
        } else {
          toast.error('Failed to update profile.');
        }
      } catch (error:any) {
        const errors = error.response?.data?.error || {};
        const nameError = errors.name;
        const emailError = errors.email;
        if (nameError) {
          toast.error(`Error: ${nameError}`);
        } else if (emailError) {
          toast.error(`Error: ${emailError}`);
        } else {
        toast.error('An error occurred while updating profile.');
        }
      }
    }
  };

  return (
    <>
    <div className='flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center'>
      <div>
      <Breadcrumb items={breadcrumbItems} />
      </div>
    <div>
        <Link href={'/sub-admin'}>
        <Button color="gray" className="mt-4">
          Back To Admin Page
        </Button>
        </Link>
        </div>
    </div>
      <div className='my-10'>
        <div className='flex flex-col md:flex-row justify-start md:justify-between itmes-start md:items-center w-full md:w-3/4'>
        <div>
          Name: {isEditingName ? (
            <div className="flex items-center my-3">
              <TextInput
                value={newName}
                onChange={(e) => setNewName(e.currentTarget.value)}
                className="mr-2"
              />
              <Button onClick={handleEditSubmit} color="green" size="xs">
                <IconCheck size={16} />
              </Button>
              <Button onClick={() => {setIsEditingName(false), setNewName(newName)}} color="red" size="xs" className="ml-2">
                <IconX size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center my-3">
              <span className='uppercase font-semibold'>{newName ? newName : adminData?.name}</span>
              <Button onClick={() => {setIsEditingName(true); setIsEditingEmail(false); {newEmail ? newEmail : setNewEmail(adminData?.email)}}} variant="light" size="xs" className="ml-2">
                <IconPencil size={16} />
              </Button>
            </div>
          )}
        </div>
        <div>
          EmailId: {isEditingEmail ? (
            <div className="flex items-center my-3">
              <TextInput
                value={newEmail}
                onChange={(e) => setNewEmail(e.currentTarget.value)}
                className="mr-2"
              />
              <Button onClick={handleEditSubmit} color="green" size="xs">
                <IconCheck size={16} />
              </Button>
              <Button onClick={() => {setIsEditingEmail(false), setNewEmail(newEmail)}} color="red" size="xs" className="ml-2">
                <IconX size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center my-3">
              <span className='uppercase font-semibold'>{newEmail ? newEmail : adminData?.email}</span>
              <Button onClick={() => {setIsEditingEmail(true); setIsEditingName(false); {newName ? newName : setNewName(adminData?.name)}
              }} variant="light" size="xs" className="ml-2">
                <IconPencil size={16} />
              </Button>
            </div>
          )}
        </div>
        </div>
        <div className='my-5'>
          <div>Restriction:</div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5 my-5'>
          {restrictData.map((data, index) => (
            <Group
            key={data._id}
              className="my-2 border border-gray-300 rounded-lg p-4 bg-white hover:bg-gray-200"
            >
              <Checkbox
                checked={selectedRestrictions.includes(data._id)}
                onChange={() => handleCheckboxChange(data._id)}
                tabIndex={-1}
                size="md"
                mr="xl"
                styles={{ input: { cursor: 'pointer' } }}
                aria-hidden
              />
              <div>
                <Text className='text-sm md:text-lg' fw={500}>{data.subModule}</Text>
              </div>
            </Group>
          ))}
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
            <Button 
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))} 
              disabled={page === 1} 
              variant="outline">
              Previous
            </Button>
            <Text>Page {page} of {Math.ceil(totalSubmodules / PAGE_SIZE)}</Text>
            <Button 
              onClick={() => setPage((prev) => Math.min(prev + 1, Math.ceil(totalSubmodules / PAGE_SIZE)))} 
              disabled={page * PAGE_SIZE >= totalSubmodules} 
              variant="outline">
              Next
            </Button>
          </div>
                      </div>
        </div>
        <div>
        <Button onClick={handleSubmit} color="blue" className="mt-4">
          Save Restrictions
        </Button>
        </div>
      </div>
    </>
  );
};

export default SubAdminDetails;
