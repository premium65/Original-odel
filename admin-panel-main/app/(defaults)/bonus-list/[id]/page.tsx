"use client"
import Breadcrumb from '@/components/Breadcrumb';
import BonusListForm from '@/components/defaults/BonusListForm/bonuslist-form';
import { useParams } from 'next/navigation';
import React from 'react';

const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Bonus List', href: '/bonus-list' },
  ];
const BonusList = () => {
    const { id } = useParams();
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <BonusListForm id={id} />
        </div>);
};

export default BonusList;
