import SubAdminDetails from '@/components/defaults/SubAdminDetails/SubadminDetails';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Sub Admin Detail',
};

const SubAdmin = () => {
    return (
        <div>
        <SubAdminDetails/>
        </div>);
};

export default SubAdmin;
