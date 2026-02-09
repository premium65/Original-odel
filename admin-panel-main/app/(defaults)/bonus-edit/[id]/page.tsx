"use client"

import Breadcrumb from '@/components/Breadcrumb';
import EditBonus from '@/components/defaults/BonusEditForm/editbonus-form';
import { useParams } from 'next/navigation';
import React from 'react';

const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Edit Bonus', href: '/bonus-edit' },
  ];
const EditBonusForm = () => {
    const { id } = useParams();
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <EditBonus id={id} />
        </div>);
};

export default EditBonusForm;
