import Breadcrumb from '@/components/Breadcrumb';
import AddAbout from '@/components/defaults/AddAboutForm/addabout-form';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Add CMS',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Add CMS', href: '/addcms' },
  ];
const AddAboutForm = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <AddAbout />
        </div>);
};

export default AddAboutForm;
