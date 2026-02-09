import Breadcrumb from '@/components/Breadcrumb';
import DashboardComponent from '@/components/defaults/dashboard/Dashboard';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Dashboard Admin',
};
const breadcrumbItems = [{ title: 'Home', href: '/' },
    { title: 'Dashboard', href: '/dashboard' }
];
const Dashboard = () => {
    return (
    <div>
        <Breadcrumb items={breadcrumbItems} />
        <DashboardComponent />
    </div>);
};

export default Dashboard;
