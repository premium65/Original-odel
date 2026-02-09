import Breadcrumb from '@/components/Breadcrumb';
import SiteSetting from '@/components/defaults/SiteSettingForm/sitesetting-form';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Site setting Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Site setting', href: '/site-setting' },
  ];
const SiteSettingForm = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <SiteSetting />
        </div>);
};

export default SiteSettingForm;
