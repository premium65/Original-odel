'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconMenuUsers from '@/components/icon/menu/icon-menu-users';
import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';
import IconCalendar from '../icon/icon-calendar';
import IconCircleCheck from '../icon/icon-circle-check';
import IconPencil from '../icon/icon-pencil';
import IconGallery from '../icon/icon-gallery';
import IconCashBanknotes from '../icon/icon-cash-banknotes';
import IconHelpCircle from '../icon/icon-help-circle';
import IconSettings from '../icon/icon-settings';
import IconUser from '../icon/icon-user';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-toastify';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const { data: adminProfileData, loading, error } = useSelector((state: IRootState) => state.adminProfile);
    const { data: allowedModulesData, allowedLoading, allowedError  } = useSelector((state: IRootState) => state.allowedModules);
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }

    }, [pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };
     // Check if either "Users" or "Users Registration Request" exists in the modules
  const hasUsers = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Users");
  const hasUsersRegistrationRequest = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Users Registration Request");
       // Check if either "Booking List" or "Premium Booking List" exists in the modules
       const hasBookingList = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Booking List");
       const hasPremiumBookingList = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Premium Booking List");
    // Check if either "Premium List" or "Premium History" exists in the modules
    const hasPremiumList = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Premium List");
    const hasPremiumHistory = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Premium History");
      // Check if either "Address" or "Landmarks" exists in the modules
      const hasAddress = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Address");
      const hasLandmarks = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Landmarks");
      // Check if either "Event List" exists in the modules
      const hasEventList = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Event List");
      // Check if either "Bonus" or "Deposit" or "Withdraw" exists in the modules
      const hasBonus = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Bonus");
      const hasDeposit = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Deposit");
      const hasWithdraw = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Withdraw");
            // Check if either "Help" or "About" or "Policy" exists in the modules
            const hasHelp = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Help");
            const hasAbout = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "About");
            const hasPolicy = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Policy");
               // Check if either "Site setting" exists in the modules
      const hasSitesetting = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Site setting");
                  // Check if either "Sub Admin" or "Sub Admin Logs" or "Modules" or "Sub Modules" exists in the modules
                  const hasSubAdmin = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Sub Admin");
                  const hasSubAdminLogs = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Sub Admin Logs");
                  const hasModules = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Modules");
                  const hasSubModules = Array.isArray(allowedModulesData) && allowedModulesData.some((module:any) => module.subModule === "Sub Modules");

 // Render the "Users Management" section only if either condition is true
 const showUsersManage = hasUsers || hasUsersRegistrationRequest;
  // Render the "Booking Management" section only if either condition is true
  const showBookingManagement = hasBookingList || hasPremiumBookingList;
 // Render the "Premium Management" section only if either condition is true
 const showPremiumManagement = hasPremiumList || hasPremiumHistory;
 // Render the "Reviews" section only if either condition is true
  const showReviews = hasAddress || hasLandmarks;
  // Render the "Event Management" section only if either condition is true
  const showEventManagement = hasEventList;
   // Render the "Transactions" section only if either condition is true
   const showTransactions = hasBonus || hasDeposit || hasWithdraw;
  // Render the " About & Help Management" section only if either condition is true
  const showAboutHelpManagement = hasHelp || hasAbout || hasPolicy;
    // Render the "Site setting" section only if either condition is true
    const showSitesetting = hasSitesetting;
    // Render the "Admin Controller" section only if either condition is true
  const showAdminController = hasSubAdmin || hasSubAdminLogs || hasModules || hasSubModules;

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[280px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/dashboard" className="main-logo flex shrink-0 items-center">
                       <Image width={100} height={100} className="ml-[5px] w-14 flex-none" src="/assets/images/adminlogo.jpeg" alt="logo" />
{/*                             <span className="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">Travel Partner</span> */}
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        {adminProfileData?.role === "subadmin" ? 
                     <>
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">             
                            {/* Users */}
                            {showUsersManage &&
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'users' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('users')}>
                                    <div className="flex items-center">
                                        <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("User's Manage")}</span>
                                    </div>

                                    <div className={currentMenu !== 'users' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'users' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        {hasUsers &&
                                        <li>
                                            <Link href="/userList">{t('Users')}</Link>
                                        </li>
}
{hasUsersRegistrationRequest &&
                                        <li>
                                            <Link href="/userRegReq">{t('Users Registration Request')}</Link>
                                        </li>
}
                                    </ul>
                                </AnimateHeight>
                            </li>}
                            {/* Booking Management */}
                            {showBookingManagement &&
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'booking' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('booking')}>
                                    <div className="flex items-center">
                                        <IconCalendar className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("Booking Management")}</span>
                                    </div>

                                    <div className={currentMenu !== 'booking' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'booking' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                    {hasBookingList &&
                                        <li>
                                            <Link href="/booking-list">{t('Booking List')}</Link>
                                        </li>
}
{hasPremiumBookingList &&
                                        <li>
                                            <Link href="/premium-list">{t('Premium Booking List')}</Link>
                                        </li>
}
                                    </ul>
                                </AnimateHeight>
                            </li>
}
                               {/* Premium Management */}
                               {showPremiumManagement &&
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'premium' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('premium')}>
                                    <div className="flex items-center">
                                        <IconCircleCheck className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("Premium Management")}</span>
                                    </div>

                                    <div className={currentMenu !== 'premium' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'premium' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                    {hasPremiumList &&
                                        <li>
                                            <Link href="/premium-list">{t('Premium List')}</Link>
                                        </li>
}
{hasPremiumHistory &&
                                        <li>
                                            <Link href="/premium-history">{t('Premium History')}</Link>
                                        </li>
}
                                    </ul>
                                </AnimateHeight>
                            </li>}
                               {/* Reviews */}
                             {showReviews &&
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'reviews' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('reviews')}>
                                    <div className="flex items-center">
                                        <IconPencil className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("Reviews")}</span>
                                    </div>

                                    <div className={currentMenu !== 'reviews' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'reviews' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        {hasAddress &&
                                        <li>
                                            <Link href="/addresses-list">{t('Address')}</Link>
                                        </li>
}
{hasLandmarks &&
                                        <li>
                                            <Link href="/landmarks-list">{t('Landmarks')}</Link>
                                        </li>
}
                                    </ul>
                                </AnimateHeight>
                            </li>
}
                               {/* Event Management */}
                               {showEventManagement && 
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'event' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('event')}>
                                    <div className="flex items-center">
                                        <IconGallery className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("Event Management")}</span>
                                    </div>

                                    <div className={currentMenu !== 'event' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'event' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        {showEventManagement &&
                                        <li>
                                            <Link href="/event-list">{t('Event List')}</Link>
                                        </li>
                                        }
                                    </ul>
                                </AnimateHeight>
                            </li>
}
                               {/* Transactions */}
                               {showTransactions &&
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'transactions' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('transactions')}>
                                    <div className="flex items-center">
                                        <IconCashBanknotes className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("Transactions")}</span>
                                    </div>

                                    <div className={currentMenu !== 'transactions' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'transactions' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                    {hasBonus &&
                                        <li>
                                            <Link href="/bonus-history-list">{t('Bonus')}</Link>
                                        </li>
}
{hasDeposit &&
                                        <li>
                                            <Link href="/deposit-list">{t('Deposit')}</Link>
                                        </li>
                                        }
                                        {hasWithdraw &&
                                        <li>
                                            <Link href="/withdraw-list">{t('Withdraw')}</Link>
                                        </li>
                                        }
                                    </ul>
                                </AnimateHeight>
                            </li>}
                               {/* About & Help Management */}
                               {showAboutHelpManagement &&
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'abouthelp' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('abouthelp')}>
                                    <div className="flex items-center">
                                        <IconHelpCircle className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("About & Help Management")}</span>
                                    </div>

                                    <div className={currentMenu !== 'abouthelp' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'abouthelp' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        {hasHelp &&
                                        <li>
                                            <Link href="/help-list">{t('Help')}</Link>
                                        </li>
}
{hasAbout &&
                                        <li>
                                            <Link href="/about-list">{t('About')}</Link>
                                        </li>
}
{hasPolicy &&
                                        <li>
                                            <Link href="/policy-list">{t('Policy')}</Link>
                                        </li>
}
                                    </ul>
                                </AnimateHeight>
                            </li>
}
                               {/* Site setting */}
                               {showSitesetting && 
                            <li className="menu nav-item">
                            <Link href="/site-setting">
                                <div className={`${currentMenu === 'sitesetting' ? 'active' : ''} nav-link group w-full`}>
                                    <div className="flex items-center">
                                        <IconSettings className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Site setting')}</span>
                                    </div>
                                </div>
                                </Link>
                            </li>
}
                               {/* Admin controller */}
                               {showAdminController && 
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'admincontroller' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('admincontroller')}>
                                    <div className="flex items-center">
                                        <IconUser className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("Admin controller")}</span>
                                    </div>

                                    <div className={currentMenu !== 'admincontroller' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'admincontroller' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        {hasSubAdmin &&
                                        <li>
                                            <Link href="/sub-admin">{t('Sub Admin')}</Link>
                                        </li>}
                                        {hasSubAdminLogs &&
                                        <li>
                                            <Link href="/sub-admin-logs">{t('Sub Admin Logs')}</Link>
                                        </li>}
                                        {hasModules &&
                                        <li>
                                            <Link href="/modules">{t('Modules')}</Link>
                                        </li>
}
                                        {hasSubModules &&
                                        <li>
                                            <Link href="/sub-modules">{t('Sub Modules')}</Link>
                                        </li>
}
                                    </ul>
                                </AnimateHeight>
                            </li>
}
                        </ul>
                 </>                 
                        :    
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            {/* Dashboard */}
                            <li className="menu nav-item">
                            <Link href="/dashboard">
                                <div className={`${currentMenu === 'dashboard' ? 'active' : ''} nav-link group w-full`}>
                                    <div className="flex items-center">
                                        <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('dashboard')}</span>
                                    </div>
                                </div>
                                </Link>
                            </li>
                            {/* Users */}
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'users' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('users')}>
                                    <div className="flex items-center">
                                        <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("User's Manage")}</span>
                                    </div>

                                    <div className={currentMenu !== 'users' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'users' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/userList">{t('Users')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/userRegReq">{t('Users Registration Request')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                            {/* Booking Management */}
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'booking' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('booking')}>
                                    <div className="flex items-center">
                                        <IconCalendar className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("Booking Management")}</span>
                                    </div>

                                    <div className={currentMenu !== 'booking' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'booking' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/booking-list">{t('Booking List')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/premium-list">{t('Premium Booking List')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                               {/* Premium Management */}
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'premium' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('premium')}>
                                    <div className="flex items-center">
                                        <IconCircleCheck className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("Premium Management")}</span>
                                    </div>

                                    <div className={currentMenu !== 'premium' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'premium' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/premium-list">{t('Premium List')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/premium-history">{t('Premium History')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                               {/* Reviews */}
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'reviews' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('reviews')}>
                                    <div className="flex items-center">
                                        <IconPencil className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("Reviews")}</span>
                                    </div>

                                    <div className={currentMenu !== 'reviews' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'reviews' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/addresses-list">{t('Address')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/landmarks-list">{t('Landmarks')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                               {/* Event Management */}
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'event' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('event')}>
                                    <div className="flex items-center">
                                        <IconGallery className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("Event Management")}</span>
                                    </div>

                                    <div className={currentMenu !== 'event' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'event' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/event-list">{t('Event List')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                               {/* Transactions */}
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'transactions' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('transactions')}>
                                    <div className="flex items-center">
                                        <IconCashBanknotes className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("Transactions")}</span>
                                    </div>

                                    <div className={currentMenu !== 'transactions' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'transactions' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/bonus-history-list">{t('Bonus')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/deposit-list">{t('Deposit')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/withdraw-list">{t('Withdraw')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                               {/* About & Help Management */}
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'abouthelp' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('abouthelp')}>
                                    <div className="flex items-center">
                                        <IconHelpCircle className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("About & Help Management")}</span>
                                    </div>

                                    <div className={currentMenu !== 'abouthelp' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'abouthelp' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/help-list">{t('Help')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/about-list">{t('About')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/policy-list">{t('Policy')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                               {/* Site setting */}
                            <li className="menu nav-item">
                            <Link href="/site-setting">
                                <div className={`${currentMenu === 'sitesetting' ? 'active' : ''} nav-link group w-full`}>
                                    <div className="flex items-center">
                                        <IconSettings className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Site setting')}</span>
                                    </div>
                                </div>
                                </Link>
                            </li>
                               {/* Admin controller */}
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'admincontroller' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('admincontroller')}>
                                    <div className="flex items-center">
                                        <IconUser className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t("Admin controller")}</span>
                                    </div>

                                    <div className={currentMenu !== 'admincontroller' ? '-rotate-90 rtl:rotate-90' : ''}>
                                        <IconCaretDown />
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'admincontroller' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
{/*                                     <li>
                                    <Link href="/db-manage">{t('Database Management')}</Link>
                                    </li> */}
                                        <li>
                                            <Link href="/sub-admin">{t('Sub Admin')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/sub-admin-logs">{t('Sub Admin Logs')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/modules">{t('Modules')}</Link>
                                        </li>
                                        <li>
                                            <Link href="/sub-modules">{t('Sub Modules')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>
                        </ul>}
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
