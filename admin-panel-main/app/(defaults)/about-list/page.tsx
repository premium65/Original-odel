import Breadcrumb from '@/components/Breadcrumb';
import AboutListDatatable from '@/components/defaults/AboutList/aboutList';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'About List Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'About List', href: '/about-list' },
  ];
const AboutList = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <AboutListDatatable />
        </div>);
};

export default AboutList;
