"use client"

import Breadcrumb from '@/components/Breadcrumb';
import EditAbout from '@/components/defaults/EditAboutForm/editabout-form';
import UpdateHelpForm from '@/components/defaults/UpdateHelpForm/updatehelp-form';
import { useParams } from 'next/navigation';
import React from 'react';

const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Update Cms', href: '/updatecms' },
  ];
const UpdateCms = () => {
    const { id } = useParams();
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <EditAbout id={id} />
        </div>);
};

export default UpdateCms;
