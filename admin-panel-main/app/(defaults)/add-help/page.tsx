import Breadcrumb from '@/components/Breadcrumb';
import AddHelp from '@/components/defaults/AddHelpForm/addhelp-form';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Add Help',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Add Help', href: '/add-help' },
  ];
const AddHelpForm = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <AddHelp />
        </div>);
};

export default AddHelpForm;
