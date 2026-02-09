"use client"

import Breadcrumb from '@/components/Breadcrumb';
import EditBookingForm from '@/components/defaults/EditBookingForm/editbooking-form';
import { useParams } from 'next/navigation';
import React from 'react';

const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Edit Booking', href: '/booking-edit' },
  ];
const EditBooking = () => {
    const { id } = useParams();
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <EditBookingForm id={id} />
        </div>);
};

export default EditBooking;
