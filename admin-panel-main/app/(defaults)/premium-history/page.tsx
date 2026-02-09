import Breadcrumb from '@/components/Breadcrumb';
import PremiumHistoryDatatables from '@/components/defaults/PremiumHistory/premium-history-datatables';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Premium History Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Premium History', href: '/premium-history' },
  ];
const PremiumHistory = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <PremiumHistoryDatatables />
        </div>);
};

export default PremiumHistory;
