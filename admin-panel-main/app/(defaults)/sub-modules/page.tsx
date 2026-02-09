import Breadcrumb from '@/components/Breadcrumb';
import SubModulesDatatables from '@/components/defaults/SubModules/subModules-datatables';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Sub Modules',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Sub Modules', href: '/sub-modules' },
  ];
const SubModules = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <SubModulesDatatables />
        </div>);
};

export default SubModules;
