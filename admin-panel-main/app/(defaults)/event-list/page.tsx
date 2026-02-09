import Breadcrumb from '@/components/Breadcrumb';
import EventListDatatables from '@/components/defaults/EventList/event-list-datatables';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Event List Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Events', href: '/event-list' },
  ];
const EventList = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
        <EventListDatatables />
        </div>);
};

export default EventList;
