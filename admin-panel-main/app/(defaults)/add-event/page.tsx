import Breadcrumb from '@/components/Breadcrumb';
import AddEventForm from '@/components/defaults/AddEventForm/addevent-form';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Add Event',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Add Event', href: '/add-event' },
  ];
const AddEvent = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <AddEventForm />
        </div>);
};

export default AddEvent;
