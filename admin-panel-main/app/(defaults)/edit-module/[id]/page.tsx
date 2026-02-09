"use client"

import Breadcrumb from '@/components/Breadcrumb';
import EditModules from '@/components/defaults/EditModule/editmodule-form';
import { useParams } from 'next/navigation';
import React from 'react';

const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Edit Module', href: '/edit-module' },
  ];
const EditModule = () => {
    const { id } = useParams();
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <EditModules id={id} />
        </div>);
};

export default EditModule;
