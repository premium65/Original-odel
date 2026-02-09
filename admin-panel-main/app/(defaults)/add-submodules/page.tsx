import Breadcrumb from '@/components/Breadcrumb';
import AddSubModules from '@/components/defaults/AddSubModules/addsubmodules-form';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Add Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Add Submodules', href: '/add-submodules' },
  ];
const SubAdmin = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <AddSubModules />
        </div>);
};

export default SubAdmin;
