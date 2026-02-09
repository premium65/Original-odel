import Breadcrumb from '@/components/Breadcrumb';
import UsersDatatables from '@/components/defaults/Users/users-datatables';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'User List',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'User List', href: '/userList' },
  ];
const UserList = () => {
    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />
            <UsersDatatables />
        </div>
    );
};

export default UserList;
