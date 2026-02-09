'use client';

import { ActionIcon, Button, Center, Group, Text, TextInput } from '@mantine/core';
import { closeAllModals, openModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconEdit } from '@tabler/icons-react';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DataTable, DataTableColumn, DataTableProps, DataTableSortStatus } from 'mantine-datatable';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Link from 'next/link';
import { toast } from 'react-toastify';
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

const PremiumHistoryDatatables = () => {
  const router = useRouter();
  const [premiumHistoryData, setPremiumHistoryData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const { data: adminProfileData, loading, error } = useSelector((state: IRootState) => state.adminProfile);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: 'name',
    direction: 'asc',
  });
  const [filters, setFilters] = useState({
    _id:'',
    createdAtFrom: '',
    createdAtTo: '',
    createdAt:'',
    userId:{
      phoneNo: ''
    },
    amount:'',
    name:'',
    taskNo:'',
    commissionFee: '',
    status:''
  });
  // Date range filtering
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/premium-history?page=${page}&limit=10000&fillter=%7B%7D&sortObj=%7B%7D`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        console.log("data", response.data)
        console.log("status", response.status)
        console.log("success", response.data.success)
        if (response.status === 200 && response.data.success) {
          setTotalRecords(response.data.result.count)
          setPremiumHistoryData(response.data.result.data);
        } else {
          console.error('Failed to load premium list data.');
        }
      } catch (error) {
        console.error('An error occurred while fetching premium list data.');
      }
    };

    fetchUserData();
  }, [router]);

const filteredData = premiumHistoryData.filter((booking) => {
const createdAt = dayjs(booking.createdAt).tz('Asia/Kolkata');
    const from = fromDate ? dayjs(fromDate) : null;
    const to = toDate ? dayjs(toDate) : null;

    const isInDateRange = (!from || createdAt.isSame(from, 'day') || createdAt.isAfter(from, 'day')) && (!to || createdAt.isSame(to, 'day') || createdAt.isBefore(to, 'day'));

    return (
      isInDateRange &&
    (filters.createdAt === '' || dayjs(booking.createdAt).format('YYYY-MM-DD').includes(filters.createdAt)) &&
    (filters.userId.phoneNo === '' ||  String(booking.userId.phoneNo).includes(filters.userId.phoneNo))  &&
    (filters.amount === '' ||  String(booking.amount).includes(filters.amount))  &&
    (filters.name === '' || booking.name.toLowerCase().includes(filters.name.toLowerCase())) &&
    (filters.commissionFee === '' ||  String(booking.commissionFee).includes(filters.commissionFee))  &&
    (filters.taskNo === '' ||  String(booking.taskNo).includes(filters.taskNo))  &&
    (filters.status === '' || booking.status.toLowerCase().includes(filters.status.toLowerCase())) &&
    (filters._id === '' || booking._id.toLowerCase().includes(filters._id.toLowerCase()))
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

    setPremiumHistoryData(sortedData);
  };
  const paginatedData = () => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const paginationData = filteredData ? filteredData.slice(start, end) : premiumHistoryData.slice(start, end)
    return paginationData
  };
  const renderActions: DataTableColumn<any>['render'] = (record) => (
    <>{adminProfileData?.role === "superadmin" &&  <Group gap={4} justify="center" wrap="nowrap">
    <Link href={`/booking-edit/${record._id}`}>
     <ActionIcon
        size="xs"
        title='Edit'
        variant="filled"
        className='w-7 h-7'
        disabled={record.status === 'completed' || record.status === 'canceled'}
      >
        <IconEdit color='white' size={16} />
      </ActionIcon>
      </Link>
    </Group>}</>
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
      accessor: 'userId.phoneNo',
      title: 'Phone Number',
      sortable: true,
      filter: (
        <TextInput
          placeholder="Filter by phoneNo"
          value={filters.userId.phoneNo}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              userId: { ...prev.userId, phoneNo: e.currentTarget?.value || '' },
            }))}
        />
      ),
    },
    {
      accessor: 'amount',
      title: 'Amount',
      filter: (
        <TextInput
          placeholder="Filter by amount"
          value={filters.amount}
          onChange={(e) => setFilters((prev) => ({ ...prev, amount: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'name',
      title: 'Name',
      sortable: true,
      filter: (
        <TextInput
          placeholder="Filter by name"
          value={filters.name}
          onChange={(e) => setFilters((prev) => ({ ...prev, name: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'taskNo',
      title: 'Task No',
      filter: (
        <TextInput
          placeholder="Filter by taskNo"
          value={filters.taskNo}
          onChange={(e) => setFilters((prev) => ({ ...prev, taskNo: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'commissionFee',
      title: 'Commission Fee',
      sortable: true,
      filter: (
        <TextInput
          placeholder="Filter by commissionFee"
          value={filters.commissionFee}
          onChange={(e) => setFilters((prev) => ({ ...prev, commissionFee: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'status',
      title: 'Status',
      noWrap: true,
      sortable: true,
      render: (record) => (
        <div className='flex justify-center items-center'>
         {record.status === "completed" ? (
  <Button variant="filled" color="green" className="text-xs cursor-auto">
    Completed
  </Button>
) : record.status === "canceled" ? (
  <Button variant="filled" color="red" className="text-xs cursor-auto">
    Canceled
  </Button>
) : (
  <Button variant="filled" color="yellow" className="text-xs cursor-auto">
    Processing
  </Button>
)}
        </div>
      ),
      filter: (
        <TextInput
          placeholder="Filter by status"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.currentTarget?.value || '' }))}
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
     {premiumHistoryData.length > 0 && <Group mb="md" className='my-4'>
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
            userId:{
              phoneNo: ''
            },
            amount:'',
            name:'',
            taskNo:'',
            commissionFee: '',
            status:''
          })}}
        >
          Clear Filters
        </Button>
      </Group>}      
      {premiumHistoryData.length > 0 ? (
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

export default PremiumHistoryDatatables;
