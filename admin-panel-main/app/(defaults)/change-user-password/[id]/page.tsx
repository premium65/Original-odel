"use client"
import Breadcrumb from '@/components/Breadcrumb';
import ChangeUserPasswordForm from '@/components/defaults/ChangeUserPassword/changeUserPassword';
import { useParams } from 'next/navigation';
import React from 'react';

const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Change User Password', href: '/change-user-password' },
  ];
const ChangeUserPassword = () => {
    const { id } = useParams();
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <ChangeUserPasswordForm id={id} />
        </div>);
};

export default ChangeUserPassword;
