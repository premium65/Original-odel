import Breadcrumb from '@/components/Breadcrumb';
import AddModules from '@/components/defaults/AddModules/addmodules-form';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Add Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Add Modules', href: '/add-modules' },
  ];
const SubAdmin = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <AddModules />
        </div>);
};

export default SubAdmin;
