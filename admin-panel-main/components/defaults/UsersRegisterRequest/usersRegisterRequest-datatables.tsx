'use client';

import { Button, Center, Group, Text, TextInput } from '@mantine/core';
import { closeAllModals, openModal } from '@mantine/modals';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DataTable, DataTableColumn, DataTableProps, DataTableSortStatus } from 'mantine-datatable';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { toast } from 'react-toastify';
import classes from './ComplexUsageExample.module.css';
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

const UsersRegisterRequestDatatables = () => {
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
    phoneNo: '',
    referrer:{
      _id:'',
      userName:'',
      id:''
    },
  });
  // Date range filtering
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/get-unregistered-users?page=${page}&limit=10000&fillter=%7B%7D&sortObj=%7B%7D`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setUserData(response.data.result.data);
        setTotalRecords(response.data.result.count)
      } else {
        console.error('Failed to load users data.');
      }
    } catch (error) {
      console.error('An error occurred while fetching users data.');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [router]);

  const filteredData = userData.filter((user) => {
    const createdAt = dayjs(user.createdAt).tz('Asia/Kolkata');
    const from = fromDate ? dayjs(fromDate) : null;
    const to = toDate ? dayjs(toDate) : null;

    const isInDateRange = (!from || createdAt.isSame(from, 'day') || createdAt.isAfter(from, 'day')) && (!to || createdAt.isSame(to, 'day') || createdAt.isBefore(to, 'day'));

    return (
      isInDateRange &&
      (filters.createdAt === '' || dayjs(user.createdAt).format('YYYY-MM-DD').includes(filters.createdAt)) &&
      (filters.userId === '' || String(user.userId).toLowerCase().includes(filters.userId.toLowerCase())) &&
      (filters.phoneNo === '' || String(user.phoneNo).toLowerCase().includes(filters.phoneNo.toLowerCase())) &&
      (filters.referrer.userName === '' || user.referrer.userName.toLowerCase().includes(filters.referrer.userName.toLowerCase())) &&
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
  const approveUserRequest = async (userId: string, reason: string) => {
    try {
      const response = await axios.post(
         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/register-approval`,
        {
          userId,
          reason,
        },
        {
          headers: {
            Authorization: `${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        toast.success(response.data.message);
        await fetchUserData()
      } else {
        toast.error('Failed to approve user.');
      }
    } catch (error) {
      toast.error('Error approving user.');
    }
  };

  const editModifyRecord = useCallback(({ _id }: any) => {
    let reason = '';

    openModal({
      title: `Approve User ${_id}`,
      classNames: { header: classes.modalHeader, title: classes.modalTitle },
      children: (
        <>
          <TextInput
            mt="md"
            placeholder="Enter reason for approval"
            onChange={(e) => {
              reason = e.currentTarget.value;
            }}
          />
          <Group mt="md" gap="sm" justify="flex-end">
            <Button color="red" onClick={() => closeAllModals()}>
              Cancel
            </Button>
            <Button
              color="green"
              onClick={() => {
                approveUserRequest(_id, reason);
                closeAllModals();
              }}
            >
              Approve
            </Button>
          </Group>
        </>
      ),
    });
  }, []);

  const renderActions: DataTableColumn<any>['render'] = (record) => (
    <>{adminProfileData?.role === "superadmin" &&   <Group gap={4} justify="right" wrap="nowrap">
      <Button
        size="xs"
        title="Approve"
        variant="success"
        onClick={(e) => {
          e.stopPropagation();
          editModifyRecord(record);
        }}
      >
      Approve
      </Button>
    </Group>
}</>
  );

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
      accessor: 'referrer.userName',
      title: 'Referrer By',
      render: (record) => record.referrer?.userName || 'N/A', // To display the referrer userId in the table
      filter: (
        <TextInput
          placeholder="Filter by referrerId"
          value={filters.referrer.userName}
          onChange={(e) => setFilters((prev) => ({
            ...prev,
            referrer: {
              ...prev.referrer,
              userId: e.currentTarget.value || '',
            },
          }))}
        />
      ),
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
          <label>From:</label>
          <input
            className="border p-2"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <label>To:</label>
          <input
            className="border p-2"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
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
            phoneNo: '',
            referrer:{
              _id:'',
              userName:'',
              id:''
            },
          })}}
        >
          Clear Filters
        </Button>
      </Group>}
      {userData.length > 0 ? (
      <DataTable
        columns={columns}
        records={paginatedData()}
        sortStatus={sortStatus}
        onSortStatusChange={handleSortStatusChange}
        page={page}
        onPageChange={setPage}
        totalRecords={totalRecords}
        recordsPerPage={PAGE_SIZE}
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

export default UsersRegisterRequestDatatables;
