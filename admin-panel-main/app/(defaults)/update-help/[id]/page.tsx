"use client"

import Breadcrumb from '@/components/Breadcrumb';
import UpdateHelpForm from '@/components/defaults/UpdateHelpForm/updatehelp-form';
import { useParams } from 'next/navigation';
import React from 'react';

const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Update Help', href: '/update-help' },
  ];
const UpdateHelp = () => {
    const { id } = useParams();
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <UpdateHelpForm id={id} />
        </div>);
};

export default UpdateHelp;
