import Breadcrumb from '@/components/Breadcrumb';
import UsersRegisterRequestDatatables from '@/components/defaults/UsersRegisterRequest/usersRegisterRequest-datatables';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'UserRegReq Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'User Request List', href: '/userRegReq' },
  ];
const UserRegReq = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <UsersRegisterRequestDatatables />
        </div>);
};

export default UserRegReq;
