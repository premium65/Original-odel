'use client';

import { ActionIcon, Button, Center, Group, Text, TextInput } from '@mantine/core';
import { closeAllModals, openModal } from '@mantine/modals';
import CryptoJS from "crypto-js";
import { IconEdit, IconGiftFilled, IconLock, IconLockOpen, IconPasswordUser, IconPremiumRights, IconRestore } from '@tabler/icons-react';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DataTable, DataTableColumn, DataTableProps, DataTableSortStatus } from 'mantine-datatable';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Link from 'next/link';
import { toast } from 'react-toastify';
import classes from './ComplexUsageExample.module.css';
import { encryptData } from '@/hooks/Crypto';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

dayjs.extend(utc);
dayjs.extend(timezone);

const PAGE_SIZE = 10;

const renderDate = (date: string) => {
  const parsedDate = dayjs(date);
  if (!parsedDate.isValid()) {
    return 'Invalid Date';
  }
  return parsedDate.tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm');
};

const UsersDatatables = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const { data: adminProfileData, loading, error } = useSelector((state: IRootState) => state.adminProfile);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: 'userName',
    direction: 'asc',
  });
  const [filters, setFilters] = useState({
    _id:'',
    createdAtFrom: '',
    createdAtTo: '',
    createdAt:'',
    userId:'',
    userName: '',
    phoneNo: '',
    adminApproval:'',
    totalBalance:'',
    pendingAmount:'',
    totalDeposit:'',
    totalWithdraw:'',
    referrerName:'',
    referrerId:'',
    refCount:'',
    taskCount:''
  });
  // Date range filtering
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/user?page=${page}&limit=10000&fillter=%7B%7D&sortObj=%7B%7D`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setTotalRecords(response.data.result.count)
        setUserData(response.data.result.data);
      } else {
        console.error('Failed to load users data.');
      }
    } catch (error) {
      console.error('An error occurred while fetching users data.');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [ router]);

const filteredData = userData.filter((user) => {
const createdAt = dayjs(user.createdAt).tz('Asia/Kolkata');
    const from = fromDate ? dayjs(fromDate) : null;
    const to = toDate ? dayjs(toDate) : null;

    const isInDateRange = (!from || createdAt.isSame(from, 'day') || createdAt.isAfter(from, 'day')) && (!to || createdAt.isSame(to, 'day') || createdAt.isBefore(to, 'day'));

    return (
      isInDateRange &&
    (filters.createdAt === '' || dayjs(user.createdAt).format('YYYY-MM-DD').includes(filters.createdAt)) &&
    (filters.userId === '' || user.userId.toLowerCase().includes(filters.userId.toLowerCase())) &&
    (filters.userName === '' || user.userName.toLowerCase().includes(filters.userName.toLowerCase())) &&
    (filters.phoneNo === '' || user.phoneNo.includes(filters.phoneNo)) &&
    (filters.adminApproval === '' || (user.adminApproval ? 'Approved' : 'Unapproved').toLowerCase().includes(filters.adminApproval.toLowerCase())) &&
    (filters.totalBalance === '' || String(user.totalBalance).toLowerCase().includes(filters.totalBalance.toLowerCase())) &&
    (filters.pendingAmount === '' || String(user.pendingAmount).toLowerCase().includes(filters.pendingAmount.toLowerCase())) &&
    (filters.totalDeposit === '' || String(user.totalDeposit).toLowerCase().includes(filters.totalDeposit.toLowerCase())) &&
    (filters.totalWithdraw === '' || String(user.totalWithdraw).toLowerCase().includes(filters.totalWithdraw.toLowerCase())) &&
    (filters.referrerName === '' || user.referrerName.toLowerCase().includes(filters.referrerName.toLowerCase())) &&
    (filters.referrerId === '' || user.referrerId.toLowerCase().includes(filters.referrerId.toLowerCase())) &&
    (filters.refCount === '' || String(user.refCount).toLowerCase().includes(filters.refCount.toLowerCase())) &&
    (filters.taskCount === '' || String(user.taskCount).toLowerCase().includes(filters.taskCount.toLowerCase())) &&
    (filters._id === '' || user._id.toLowerCase().includes(filters._id.toLowerCase()))
  );
});

  const handleSortStatusChange = (status: DataTableSortStatus<any>) => {
    setPage(1);
    setSortStatus(status);
    const sortedData = [...filteredData].sort((a, b) => {
      const { columnAccessor, direction } = status;
      if (a[columnAccessor] < b[columnAccessor]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[columnAccessor] > b[columnAccessor]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setUserData(sortedData);
  };
  const paginatedData = () => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const paginationData = filteredData ? filteredData.slice(start, end) : userData.slice(start, end)
    return paginationData
  };
  const updateTaskCount = async (userId: any, newTaskCount: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/user-task-update`,
        {
          taskCount: newTaskCount, // Pass the updated task count directly
          userId: userId,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        toast.success(response.data.message);
        await fetchUserData(); // Assuming this reloads the relevant data
      } else {
        toast.error('Task update failed! Please try again.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'An error occurred!');
    }
  };
  const resetTaskCount = async (_id: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/user-task-update`,
        {
          userId: _id,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        toast.success(response.data.message);
        await fetchUserData(); // Assuming this reloads the relevant data
      } else {
        toast.error('Task update failed! Please try again.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'An error occurred!');
    }
  };
  const editModifyRecord = ({ _id, taskCount }: any) => {
    let tempTaskCount = taskCount; // Use a local variable for task count
  
    openModal({
      title: `The Task count is  ${taskCount}`,
      classNames: { header: classes.modalHeader, title: classes.modalTitle },
      children: (
        <>
          <TextInput
            mt="md"
            placeholder="Your task count..."
            defaultValue={taskCount} // Set the initial value
            onChange={(e) => {
              tempTaskCount = e.target.value; // Update the temporary value
            }}
          />
          <Group mt="md" gap="sm" justify="flex-end">
            <Button color="red" onClick={() => closeAllModals()}>
              Cancel
            </Button>
            <Button
              color="green"
              onClick={() => {
                updateTaskCount(_id, tempTaskCount); // Pass the updated count here
                closeAllModals();
              }}
            >
              Update
            </Button>
          </Group>
        </>
      ),
    });
  };
  const editPremiumTaskRecord = useCallback((record: any) => {
    router.push(`/pre-booking-add/${record._id}`)
  }, []);

  const editBonusRecord = useCallback((record: any) => {
    router.push(`/bonus-list/${record._id}`)
  }, []);

  const editChangePasswordRecord = useCallback((record: any) => {
    router.push(`/change-user-password/${record._id}`)
  }, []);

  const editLockUserRecord = async (record: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/user-locked`,
        {
          id: record._id,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        toast.success(response.data.message);
        await fetchUserData(); // Assuming this reloads the relevant data
      } else {
        toast.error('User Locked failed! Please try again.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'An error occurred!');
    }
  };

  const renderActions: DataTableColumn<any>['render'] = (record) => (
    <>{adminProfileData?.role === "superadmin" &&  <Group gap={4} justify="right" wrap="nowrap">
    <ActionIcon
        size="xs"
        title='Modify'
        variant="filled"
        className='w-7 h-7'
        onClick={(e) => {
          e.stopPropagation();
          editModifyRecord(record);
        }}
      >
        <IconEdit color='white' size={16} />
      </ActionIcon>
      <ActionIcon
        size="xs"
        title='Reset'
        color='orange'
        variant="filled"
        className='w-7 h-7'
        onClick={(e) => {
          e.stopPropagation();
          resetTaskCount(record);
        }}
      >
        <IconRestore color='white' size={16}/>
      </ActionIcon>
      <ActionIcon
        size="xs"
        title='Premium Task'
        variant="filled"
        color='gray'
        className='w-7 h-7'
        onClick={(e) => {
          e.stopPropagation();
          editPremiumTaskRecord(record);
        }}
      >
        <IconPremiumRights color='white' size={16} />
      </ActionIcon>
      <ActionIcon
        size="xs"
        title='Bonus'
        variant="filled"
        color='yellow'
        className='w-7 h-7'
        onClick={(e) => {
          e.stopPropagation();
          editBonusRecord(record);
        }}
      >
        <IconGiftFilled  color='white' size={16} />
      </ActionIcon>
      <ActionIcon
        size="xs"
        title='Change Password'
        variant="filled"
        color='pink'
        className='w-7 h-7'
        onClick={(e) => {
          e.stopPropagation();
          editChangePasswordRecord(record);
        }}
      >
        <IconPasswordUser color='white' size={16} />
      </ActionIcon>
      {record.userLocked === "true" ? 
      <ActionIcon
        size="xs"
        title='UnLock User'
        variant="filled"
        color='red'
        className='w-7 h-7'
        onClick={(e) => {
          e.stopPropagation();
          console.log("Red", record.userLocked)
          editLockUserRecord(record);
        }}
      >
       <IconLock color='white' size={16} />
      </ActionIcon> :       <ActionIcon
        size="xs"
        title='Lock User'
        variant="filled"
        color='green'
        className='w-7 h-7'
        onClick={(e) => {
          e.stopPropagation();
          console.log("Green", record.userLocked)
          editLockUserRecord(record);
        }}
      >
        <IconLockOpen color='white' size={16} />
      </ActionIcon>}
    </Group>}</>
  );
  const secretKey:any = process.env.NEXT_PUBLIC_CRYPTOSECRETKEY;
  const columns: DataTableProps<any>['columns'] = [
    {
      accessor: 'createdAt',
      title: 'Create Date',
      noWrap: true,
      sortable: true,
      render: (record) => renderDate(record.createdAt),
      filter: (
        <TextInput
          placeholder="Filter by createdAt"
          value={filters.createdAt}
          onChange={(e) => setFilters((prev) => ({ ...prev, createdAt: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'userId',
      title: 'User ID',
      sortable: true,
      filter: (
        <TextInput
          placeholder="Filter by userId"
          value={filters.userId}
          onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'userName',
      title: 'User Name',
      sortable: true,
      filter: (
        <TextInput
          placeholder="Filter by userName"
          value={filters.userName}
          onChange={(e) => setFilters((prev) => ({ ...prev, userName: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'phoneNo',
      title: 'Phone No',
      filter: (
        <TextInput
          placeholder="Filter by phoneNo"
          value={filters.phoneNo}
          onChange={(e) => setFilters((prev) => ({ ...prev, phoneNo: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'adminApproval',
      title: 'Admin Approval',
      noWrap: true,
      sortable: true,
      render: (record) => (
        <div className='flex justify-center items-center'>
          {record.adminApproval ? <Button variant="filled" color="green" className='text-xs cursor-auto'>Approved</Button> : <Button variant="filled" color="red" className='text-xs cursor-auto'>Unapproved</Button>}
        </div>
      ),
      filter: (
        <TextInput
          placeholder="Filter by adminApproval"
          value={filters.adminApproval}
          onChange={(e) => setFilters((prev) => ({ ...prev, adminApproval: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'totalBalance',
      title: 'Total Balance',
      filter: (
        <TextInput
          placeholder="Filter by totalBalance"
          value={filters.totalBalance}
          onChange={(e) => setFilters((prev) => ({ ...prev, totalBalance: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'pendingAmount',
      title: 'Pending Amount',
      filter: (
        <TextInput
          placeholder="Filter by pendingAmount"
          value={filters.pendingAmount}
          onChange={(e) => setFilters((prev) => ({ ...prev, pendingAmount: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'totalDeposit',
      title: 'Total Deposit',
      filter: (
        <TextInput
          placeholder="Filter by totalDeposit"
          value={filters.totalDeposit}
          onChange={(e) => setFilters((prev) => ({ ...prev, totalDeposit: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'totalWithdraw',
      title: 'Total Withdraw',
      filter: (
        <TextInput
          placeholder="Filter by totalWithdraw"
          value={filters.totalWithdraw}
          onChange={(e) => setFilters((prev) => ({ ...prev, totalWithdraw: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'referrerName',
      title: 'Referrer Name',
      filter: (
        <TextInput
          placeholder="Filter by referrerName"
          value={filters.referrerName}
          onChange={(e) => setFilters((prev) => ({ ...prev, referrerName: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'referrerId',
      title: 'Referrer ID',
      filter: (
        <TextInput
          placeholder="Filter by referrerId"
          value={filters.referrerId}
          onChange={(e) => setFilters((prev) => ({ ...prev, referrerId: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'refCount',
      title: 'Referrer Count',
      filter: (
        <TextInput
          placeholder="Filter by refCount"
          value={filters.refCount}
          onChange={(e) => setFilters((prev) => ({ ...prev, refCount: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'taskCount',
      title: 'Task Count',
      filter: (
        <TextInput
          placeholder="Filter by taskCount"
          value={filters.taskCount}
          onChange={(e) => setFilters((prev) => ({ ...prev, taskCount: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: '_id',
      title: 'User Asset',
      render: ({ _id }) => (<>{adminProfileData?.role === "superadmin" &&  <Link href={`/userAsset/${encryptData(_id, secretKey)}`}><Button variant="filled" color="rgba(12, 1, 110, 1)" className='text-xs'>User Asset</Button></Link>}</>),
    },
    {
      accessor: 'actions',
      title: (
        <Center>
          Actions
        </Center>
      ),
      width: '0%',
      render: renderActions,
    },
  ];

  return (
    <>
     {userData.length > 0 && <Group mb="md" className='my-4'>
              {/* Date range inputs and search button */}
        <div className="flex flex-row items-center gap-2">
    <label className="text-gray-700 mt-1 text-sm font-semibold">From Date</label>
    <TextInput
      type="date"
      value={fromDate}
      onChange={(e) => setFromDate(e.currentTarget.value)}
    />
  </div>
  <div className="flex flex-row items-center gap-2">
    <label className="text-gray-700 mt-1 text-sm font-semibold">To Date</label>
    <TextInput
      type="date"
      value={toDate}
      onChange={(e) => setToDate(e.currentTarget.value)}
    />
  </div>
        <Button
          variant="outline"
          onClick={() => {setFromDate(''), setToDate(''),setFilters({
            _id:'',
            createdAtFrom: '',
            createdAtTo: '',
            createdAt:'',
            userId:'',
            userName: '',
            phoneNo: '',
            adminApproval:'',
            totalBalance:'',
            pendingAmount:'',
            totalDeposit:'',
            totalWithdraw:'',
            referrerName:'',
            referrerId:'',
            refCount:'',
            taskCount:''
          })}}
        >
          Clear Filters
        </Button>
      </Group>  }    
      {userData.length > 0 ? (
      <DataTable
        columns={columns}
        records={paginatedData()}
        totalRecords={totalRecords}
        fetching={false} // Since we're not using react-query, set fetching to false
        page={page}
        onPageChange={setPage}
        recordsPerPage={PAGE_SIZE}
        sortStatus={sortStatus}
        onSortStatusChange={handleSortStatusChange}
        withTableBorder
        withColumnBorders
        withRowBorders
        borderRadius="sm"
        shadow="sm"
        minHeight={filteredData.length === 0 ? 300 : 0}
      />  ) : (
        <Center className='h-[300px] flex justify-center items-center'>
          <Text>No records found</Text>
        </Center>
      )}
    </>
  );
};

export default UsersDatatables;
