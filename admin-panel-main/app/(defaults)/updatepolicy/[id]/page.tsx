"use client"

import Breadcrumb from '@/components/Breadcrumb';
import EditPolicy from '@/components/defaults/EditPolicyForm/editpolicy-form';
import { useParams } from 'next/navigation';
import React from 'react';

const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Update Policy', href: '/updatepolicy' },
  ];
const UpdatePolicy = () => {
    const { id } = useParams();
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <EditPolicy id={id} />
        </div>);
};

export default UpdatePolicy;
