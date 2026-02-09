import Breadcrumb from '@/components/Breadcrumb';
import ChangePasswordForm from '@/components/defaults/ChangePassword/changePassword';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Change Password Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Change Password', href: '/changePassword' },
  ];
const ChangePassword = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <ChangePasswordForm />
        </div>);
};

export default ChangePassword;
