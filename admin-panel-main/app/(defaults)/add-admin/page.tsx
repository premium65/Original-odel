import Breadcrumb from '@/components/Breadcrumb';
import AddSubadminForm from '@/components/defaults/AddSubAdminForm/addsubadmin-form';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Add Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Add Admin', href: '/add-admin' },
  ];
const SubAdmin = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <AddSubadminForm />
        </div>);
};

export default SubAdmin;
