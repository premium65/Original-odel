import Breadcrumb from '@/components/Breadcrumb';
import PolicyListDatatable from '@/components/defaults/PolicyList/policyList';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Policy List Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Policy List', href: '/policy-list' },
  ];
const PolicyList = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <PolicyListDatatable />
        </div>);
};

export default PolicyList;
