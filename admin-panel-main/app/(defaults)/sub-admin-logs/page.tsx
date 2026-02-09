import Breadcrumb from '@/components/Breadcrumb';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Sub Admin Logs',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Sub Admin Logs', href: '/sub-admin-logs' },
  ];
const SubAdminLogs = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <div>Sub Admin Logs</div>
        </div>);
};

export default SubAdminLogs;
