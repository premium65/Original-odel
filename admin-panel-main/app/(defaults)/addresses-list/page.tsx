import Breadcrumb from '@/components/Breadcrumb';
import AddressListDatatables from '@/components/defaults/AddressList/addressList-datatables';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Address Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Address List', href: '/addresses-list' },
  ];
const Address = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <AddressListDatatables />
        </div>);
};

export default Address;
