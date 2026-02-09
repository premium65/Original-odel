'use client';

import { Button, Group, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import classes from './ComplexUsageExample.module.css';
import { closeAllModals, openModal } from '@mantine/modals';

const UserAssetDetails: React.FC<{ id: any }> = ({ id }) => {
  const router = useRouter();
  const [userAssetData, setUserAssetData] = useState<any>();
  const fetchUserAssetData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/get-user-asset?userId=${id}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setUserAssetData(response.data.result.data);
      } else {
        console.error('Failed to load userAsset data.');
      }
    } catch (error) {
      console.error('An error occurred while fetching userAsset data.');
    }
  };

  useEffect(() => {
    fetchUserAssetData();
  }, [router]);

  const updateUserAsset = async ( amount: string, type: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/update-user-asset`,
        {
          amount:amount,
          type: type,
          userId: id
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        toast.success(response.data.message);
        await fetchUserAssetData();
      } else {
        toast.error('user Asset update failed! Please try again.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred!');
    }
  };

  const depositPopup = () => {
    let tempDeposit = '';
    openModal({
      title: `Deposit for user ${userAssetData?.userCode}`,
      classNames: { header: classes.modalHeader, title: classes.modalTitle },
      children: (
        <>
          <TextInput
            mt="md"
            placeholder="Your Deposit amount..."
            onChange={(e) => {
              tempDeposit = e.target.value; // Update the temporary value
            }}
          />
          <Group mt="md" gap="sm" justify="flex-end">
            <Button color="red" onClick={() => closeAllModals()}>
              Cancel
            </Button>
            <Button
              color="green"
              onClick={() => {
                updateUserAsset(tempDeposit, "deposit");
                closeAllModals();
              }}
            >
              Update
            </Button>
          </Group>
        </>
      ),
    });
  };
  const reducePopup = () => {
    let tempReduce = '';
    openModal({
      title: `Reduce for user ${userAssetData?.userCode}`,
      classNames: { header: classes.modalHeader, title: classes.modalTitle },
      children: (
        <>
          <TextInput
            mt="md"
            placeholder="Your Reduce amount..."
            onChange={(e) => {
              tempReduce = e.target.value; // Update the temporary value
            }}
          />
          <Group mt="md" gap="sm" justify="flex-end">
            <Button color="red" onClick={() => closeAllModals()}>
              Cancel
            </Button>
            <Button
              color="green"
              onClick={() => {
                updateUserAsset(tempReduce, "reduce");
                closeAllModals();
              }}
            >
              Update
            </Button>
          </Group>
        </>
      ),
    });
  };
  return (
    <>
    <div className='py-10'>
    <div className='py-3'>
      <p className='text-xl'>Total Balance: {`${userAssetData?.totalBalance}`}</p>
    </div>
    <div className='flex gap-4 justify-center'>
        <Button
        variant="filled"
        onClick={() => depositPopup()}
        color="rgba(12, 1, 110, 1)">Deposit</Button>
         <Button
        variant="filled"
        onClick={() => reducePopup()}
        color="rgba(12, 1, 110, 1)">Reduce</Button>
    </div>
    </div>
    </>
  );
};

export default UserAssetDetails;
