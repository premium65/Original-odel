import Breadcrumb from '@/components/Breadcrumb';
import PremiumBookingListDatatables from '@/components/defaults/PremiumBookingList/premium-booking-list-datatables';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Premium Booking List Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Premium Booking List', href: '/premium-list' },
  ];
const PremiumBookingList = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <PremiumBookingListDatatables />
        </div>);
};

export default PremiumBookingList;
