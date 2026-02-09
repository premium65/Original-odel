import Breadcrumb from '@/components/Breadcrumb';
import WithdrawListHistory from '@/components/defaults/WithdrawHistoryList/withdrawHistoryList';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Withdraw List Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Withdraw details', href: '/withdraw-list' },
  ];
const WithdrawList = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <WithdrawListHistory />
        </div>);
};

export default WithdrawList;
