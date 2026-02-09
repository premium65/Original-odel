import Breadcrumb from '@/components/Breadcrumb';
import BonusListHistory from '@/components/defaults/BonusHistoryList/bonusHistoryList';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Bonus History List Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Bonus History', href: '/bonus-history-list' },
  ];
const BonusHistoryList = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <BonusListHistory />
        </div>);
};

export default BonusHistoryList;
