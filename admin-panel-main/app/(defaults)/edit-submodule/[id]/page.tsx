"use client"

import Breadcrumb from '@/components/Breadcrumb';
import EditSubModules from '@/components/defaults/EditSubModule/editsubmodule-form';
import { useParams } from 'next/navigation';
import React from 'react';

const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Edit Sub Module', href: '/edit-submodule' },
  ];
const EditSubModule = () => {
    const { id } = useParams();
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <EditSubModules id={id} />
        </div>);
};

export default EditSubModule;
