import Breadcrumb from '@/components/Breadcrumb';
import DatabaseComponent from '@/components/defaults/DatabaseManagement/DBmanagement';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Database Management',
};
const breadcrumbItems = [{ title: 'Home', href: '/' },
    { title: 'Database Management', href: '/db-manage' }
];
const Dashboard = () => {
    return (
    <div>
        <Breadcrumb items={breadcrumbItems} />
        <DatabaseComponent />
    </div>);
};

export default Dashboard;
