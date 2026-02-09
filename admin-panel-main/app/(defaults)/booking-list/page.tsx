import Breadcrumb from '@/components/Breadcrumb';
import BookingListDatatables from '@/components/defaults/BookingList/booking-list-datatables';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Booking List Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Booking List', href: '/booking-list' },
  ];
const BookingList = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
       <BookingListDatatables />
        </div>);
};

export default BookingList;
