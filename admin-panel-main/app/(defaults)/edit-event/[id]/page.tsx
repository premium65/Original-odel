"use client"

import Breadcrumb from '@/components/Breadcrumb';
import EditEventForm from '@/components/defaults/EditEventForm/editevent-form';
import { useParams } from 'next/navigation';
import React from 'react';

const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Edit Event', href: '/edit-event' },
  ];
const EditEvent = () => {
    const { id } = useParams();
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <EditEventForm id={id} />
        </div>);
};

export default EditEvent;
