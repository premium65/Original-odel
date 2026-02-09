"use client"
import Breadcrumb from '@/components/Breadcrumb';
import AddBonus from '@/components/defaults/BonusAddForm/addbonus-form';
import { useParams } from 'next/navigation';
import React from 'react';

const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Bonus Add', href: '/bonus-add' },
  ];
const BonusAdd = () => {
    const { id } = useParams();
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <AddBonus id={id} />
        </div>);
};

export default BonusAdd;
