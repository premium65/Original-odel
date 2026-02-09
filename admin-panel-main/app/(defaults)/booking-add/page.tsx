import Breadcrumb from '@/components/Breadcrumb';
import AddBookingForm from '@/components/defaults/AddBookingForm/addbooking-form';
import AddSubadminForm from '@/components/defaults/AddSubAdminForm/addsubadmin-form';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Add Booking',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Add Booking', href: '/booking-add' },
  ];
const BookingAdd = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <AddBookingForm />
        </div>);
};

export default BookingAdd;
