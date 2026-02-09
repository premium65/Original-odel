import Breadcrumb from '@/components/Breadcrumb';
import FaSettings from '@/components/defaults/2FaSettings/2FaSettings';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: '2FA settings Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: '2FA settings', href: '/2fa-settings' },
  ];
const Fa2Settings = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <FaSettings />
        </div>);
};

export default Fa2Settings;
