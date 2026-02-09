"use client"
import Breadcrumb from '@/components/Breadcrumb';
import PreBookingAddForm from '@/components/defaults/PreBookingAddForm/prebookingadd-form';
import { useParams } from 'next/navigation';
import React from 'react';

const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Pre Booking', href: '/pre-booking-add' },
  ];
const PreBookingAdd = () => {
    const { id } = useParams();
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <PreBookingAddForm id={id} />
        </div>);
};

export default PreBookingAdd;
