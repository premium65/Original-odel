import Breadcrumb from '@/components/Breadcrumb';
import ModulesDatatables from '@/components/defaults/Modules/modules-datatables';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Modules',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Modules List', href: '/modules' },
  ];
const Modules = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <ModulesDatatables />
        </div>);
};

export default Modules;
