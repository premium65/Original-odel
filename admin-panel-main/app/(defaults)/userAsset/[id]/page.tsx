"use client";

import Breadcrumb from '@/components/Breadcrumb';
import UserAssetDetails from '@/components/defaults/UserAsset/userAssetDetails';
import { decryptData } from '@/hooks/Crypto';
import { useParams } from 'next/navigation';
import React from 'react';

const breadcrumbItems = [
  { title: "Home", href: '/dashboard' },
  { title: 'Update User Asset', href: '/userAsset' },
];

const UserAsset = () => {
  const { id }:any = useParams();
  const secretKey = process.env.NEXT_PUBLIC_CRYPTOSECRETKEY;

  // Ensure secretKey and id are available before decryption
  const decryptId = id && secretKey ? decryptData(id, secretKey) : null;

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      {decryptId && <UserAssetDetails id={decryptId} />}
    </div>
  );
};

export default UserAsset;
