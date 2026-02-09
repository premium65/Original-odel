import Breadcrumb from '@/components/Breadcrumb';
import HelpListDatatable from '@/components/defaults/HelpList/helpList';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Help List Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Help List', href: '/help-list' },
  ];
const HelpList = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <HelpListDatatable />
        </div>);
};

export default HelpList;
