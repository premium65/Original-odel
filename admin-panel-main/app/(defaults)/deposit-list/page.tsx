import Breadcrumb from '@/components/Breadcrumb';
import DepositListHistory from '@/components/defaults/DepositHistoryList/depositHistoryList';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Deposit List Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Deposit details', href: '/deposit-list' },
  ];
const DepositList = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <DepositListHistory />
        </div>);
};

export default DepositList;
