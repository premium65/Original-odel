import Breadcrumb from '@/components/Breadcrumb';
import ProfileSettings from '@/components/defaults/ProfileSettings/profileSettings';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Profile Admin',
};
const breadcrumbItems = [
    { title: "Home", href: '/dashboard' },
    { title: 'Profile Details', href: '/profile' },
  ];
const Profile = () => {
    return (
        <div>
        <Breadcrumb items={breadcrumbItems} />
      <ProfileSettings />
        </div>);
};

export default Profile;
