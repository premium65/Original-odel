import Breadcrumb from '@/components/Breadcrumb';
import LandmarkListDatatables from '@/components/defaults/LandmarkList/landmarkList-datatables';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Landmarks Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Landmarks List', href: '/landmarks-list' },
  ];
const Landmarks = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <LandmarkListDatatables />
        </div>);
};

export default Landmarks;
