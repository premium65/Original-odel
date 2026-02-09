'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { IRootState } from '@/store';
import { toggleTheme, toggleSidebar } from '@/store/themeConfigSlice';
import Dropdown from '@/components/dropdown';
import IconMenu from '@/components/icon/icon-menu';
import IconSun from '@/components/icon/icon-sun';
import IconMoon from '@/components/icon/icon-moon';
import IconLaptop from '@/components/icon/icon-laptop';
import IconUser from '@/components/icon/icon-user';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconLogout from '@/components/icon/icon-logout';
import { usePathname, useRouter } from 'next/navigation';
import IconUsers from '../icon/icon-users';
import { toast } from 'react-toastify';
import Image from 'next/image';
import axios from 'axios';
import { fetchProfileStart, fetchProfileSuccess, fetchProfileFailure, clearProfile } from '@/store/adminProfileSlice';
import { clearSubModules, fetchSubModulesFailure, fetchSubModulesStart, fetchSubModulesSuccess } from '@/store/allowedModulesSlice';

const Header = () => {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();
    const pathSegments = pathname.split('/');
    const trimmedPathname = pathSegments[1];
    const { data: allowedModulesData, allowedLoading, allowedError } = useSelector((state: IRootState) => state.allowedModules);
    const { data: adminProfileData, loading, error } = useSelector((state: IRootState) => state.adminProfile);
    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }

            let allLinks = document.querySelectorAll('ul.horizontal-menu a.active');
            for (let i = 0; i < allLinks.length; i++) {
                const element = allLinks[i];
                element?.classList.remove('active');
            }
            selector?.classList.add('active');

            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
        const fetchAdminProfileData = async () => {
            dispatch(fetchProfileStart());
            try {
              const token = localStorage.getItem('authToken');
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/adminProfile`,
                {
                  headers: {
                    Authorization: `${token}`,
                  },
                }
              );
      
              if (response.status === 200 && response.data.success) {
                dispatch(fetchProfileSuccess(response.data.result));
              } else {
                dispatch(fetchProfileFailure('Failed to load admin profile data.'));
                console.error('Failed to load admin profile data.');
              }
            } catch (error) {
                dispatch(fetchProfileFailure('An error occurred while fetching admin profile data.'));
                console.error('An error occurred while fetching admin profile data.');
            }
          };
      
          fetchAdminProfileData();
    }, [dispatch, pathname]);

      useEffect(() => {
        const fetchSubmodulesData = async () => {
            dispatch(fetchSubModulesStart());
            try {
              const token = localStorage.getItem('authToken');
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/submodules`,
                {
                  headers: {
                    Authorization: `${token}`,
                  },
                }
              );
        
              if (response.status === 200 && response.data.success) {
                const subModulesData = response.data.result.data
                const restrictData =  adminProfileData?.restriction
                if (subModulesData && restrictData) {
                    const filteredModules = subModulesData.filter((submodule:any) =>
                        restrictData.includes(submodule._id)
                    );

                    dispatch(fetchSubModulesSuccess(filteredModules));
                }
              } else {
                dispatch(fetchSubModulesFailure('Failed to load submodules data.'));
                console.error('Failed to load submodules data.');
              }
            } catch (error) {
                dispatch(fetchSubModulesFailure('An error occurred while fetching submodules data.'));
                console.error('An error occurred while fetching submodules data.');
            }
          };
        if(adminProfileData){
      fetchSubmodulesData();
        }
    }, [dispatch, pathname, adminProfileData, router]);

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const handleLogout = () => {
                // Clear profile data from Redux
                dispatch(clearProfile());
                dispatch(clearSubModules());
        // Clear the auth token from localStorage
        localStorage.removeItem('authToken');
   // Calculate the expiration date for the cookie (set it to a past date)
   const expires = new Date();
   expires.setTime(expires.getTime() - 1); // Set the expiration time to a past date

   // Update the document.cookie to clear the token
   document.cookie = `token=; path=/; expires=${expires.toUTCString()};`;
        toast.warning("Loggedout successfully");
        router.push('/login'); // Redirect to login page
      };
    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm">
                <div className="relative flex w-full items-center bg-white px-5 py-2.5 dark:bg-black">
                    <div className="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 lg:hidden">
                        <Link href="/dashboard" className="main-logo flex shrink-0 items-center">
                            <Image width={100} height={100} className="inline w-14 ltr:-ml-1 rtl:-mr-1" src="/assets/images/adminlogo.jpeg" alt="logo" />
{/*                             <span className="hidden align-middle text-2xl  font-semibold  transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light md:inline">Travel Partner</span> */}
                        </Link>
                        <button
                            type="button"
                            className="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary ltr:ml-2 rtl:mr-2 dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-primary lg:hidden"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconMenu className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex justify-between items-center space-x-1.5 ltr:ml-auto rtl:mr-auto rtl:space-x-reverse dark:text-[#d0d2d6] sm:flex-1 ltr:sm:ml-0 sm:rtl:mr-0 lg:space-x-2">
                        <div>
                          {<p className='text-sm md:text-2xl font-bold uppercase'>{trimmedPathname}</p>}
                        </div>
                        <div className="flex items-center space-x-1.5">
                        <div>
                            {themeConfig.theme === 'light' ? (
                                <button
                                    className={`${
                                        themeConfig.theme === 'light' &&
                                        'flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => dispatch(toggleTheme('dark'))}
                                >
                                    <IconSun />
                                </button>
                            ) : (
                                ''
                            )}
                            {themeConfig.theme === 'dark' && (
                                <button
                                    className={`${
                                        themeConfig.theme === 'dark' &&
                                        'flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => dispatch(toggleTheme('system'))}
                                >
                                    <IconMoon />
                                </button>
                            )}
                            {themeConfig.theme === 'system' && (
                                <button
                                    className={`${
                                        themeConfig.theme === 'system' &&
                                        'flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => dispatch(toggleTheme('light'))}
                                >
                                    <IconLaptop />
                                </button>
                            )}
                        </div>
                        <div className="dropdown flex shrink-0">
                            <Dropdown
                                offset={[0, 8]}
                                placement={'bottom-end'}
                                btnClassName="relative group block"
                                button={<img className="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src="/assets/images/user-profile.jpeg" alt="userProfile" />}
                            >
                                <ul className="w-[230px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                                    <li>
                                        <div className="flex items-center px-4 py-4">
                                            <img className="h-10 w-10 rounded-md object-cover" src="/assets/images/user-profile.jpeg" alt="userProfile" />
                                            <div className="truncate ltr:pl-4 rtl:pr-4">
                                                <h4 className="text-base">
                                                      {adminProfileData?.name}
                                                </h4>
                                                <p className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
                                                {adminProfileData?.email}
                                                </p>
                                                <div className='w-fit px-1 py-1 my-1 bg-success-light rounded'>
                                                <p className="flex justify-center items-center text-xs text-success">{adminProfileData?.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <Link href="/profile" className="dark:hover:text-white">
                                            <IconUser className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                            Profile Settings
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/2fa-settings" className="dark:hover:text-white">
                                            <IconLockDots className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                            2FA Settings
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/loginHistory" className="dark:hover:text-white">
                                            <IconUsers className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                            Login History
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/changePassword" className="dark:hover:text-white">
                                            <IconLockDots className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                            Change Password
                                        </Link>
                                    </li>
                                    <li className="border-t border-white-light dark:border-white-light/10">
                                        <button className="!py-3 text-danger" onClick={handleLogout}>
                                            <IconLogout className="h-4.5 w-4.5 shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" />
                                            Log Out
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
