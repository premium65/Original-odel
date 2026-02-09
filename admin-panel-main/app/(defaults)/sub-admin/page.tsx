import Breadcrumb from '@/components/Breadcrumb';
import SubAdminDatatables from '@/components/defaults/SubAdmin/subAdmin-datatables';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Sub Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Sub Admin', href: '/sub-admin' },
  ];
const SubAdmin = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <SubAdminDatatables />
        </div>);
};

export default SubAdmin;
