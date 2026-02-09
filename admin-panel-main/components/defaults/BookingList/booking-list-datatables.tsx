'use client';

import { ActionIcon, Button, Center, Group, Text, TextInput } from '@mantine/core';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
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

const BookingListDatatables = () => {
  const router = useRouter();
  const [bookingListData, setBookingListData] = useState<any[]>([]);
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
    name:'',
    commissionFee: '',
    price:''
  });
  // Date range filtering
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/get-all-bookings?page=${page}&limit=10000&fillter=%7B%7D&sortObj=%7B%7D`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200 && response.data.success) {
          setTotalRecords(response.data.result.count)
          setBookingListData(response.data.result.data);
        } else {
          console.error('Failed to load booking data.');
        }
      } catch (error) {
        console.error('An error occurred while fetching booking data.');
      }
    };

    fetchBookingData();
  }, [router]);

const filteredData = bookingListData.filter((booking) => {
const createdAt = dayjs(booking.createdAt).tz('Asia/Kolkata');
    const from = fromDate ? dayjs(fromDate) : null;
    const to = toDate ? dayjs(toDate) : null;

    const isInDateRange = (!from || createdAt.isSame(from, 'day') || createdAt.isAfter(from, 'day')) && (!to || createdAt.isSame(to, 'day') || createdAt.isBefore(to, 'day'));

    return (
      isInDateRange &&
    (filters.createdAt === '' || dayjs(booking.createdAt).format('YYYY-MM-DD').includes(filters.createdAt)) &&
    (filters.name === '' || booking.name.toLowerCase().includes(filters.name.toLowerCase())) &&
    (filters.commissionFee === '' || String(booking.commissionFee).toLowerCase().includes(filters.commissionFee.toLowerCase())) &&
    (filters.price === '' || String(booking.price).includes(filters.price)) &&
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

    setBookingListData(sortedData);
  };
  const paginatedData = () => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const paginationData = filteredData ? filteredData.slice(start, end) : bookingListData.slice(start, end)
    return paginationData
  };
  const renderActions: DataTableColumn<any>['render'] = (record) => (
   <>{adminProfileData?.role === "superadmin" &&   <Group gap={4} justify="center" wrap="nowrap">
    <Link href={`/booking-edit/${record._id}`}>
     <ActionIcon
        size="xs"
        title='Edit'
        variant="filled"
        className='w-7 h-7'
        onClick={(e) => {
          e.stopPropagation();
          console.log("ID", record._id)
        }}
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
      accessor: 'name',
      title: 'Hotel Name',
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
      accessor: 'price',
      title: 'Price',
      filter: (
        <TextInput
          placeholder="Filter by price"
          value={filters.price}
          onChange={(e) => setFilters((prev) => ({ ...prev, price: e.currentTarget?.value || '' }))}
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
         {adminProfileData?.role === "superadmin" &&  <div className='flex justify-end'>
      <Link href={'/booking-add'}>
        <Button
        variant="filled"
        color="rgba(12, 1, 110, 1)"><IconPlus color='white' size={16} className='mr-2'/> Add Booking</Button></Link>
    </div>}
    {bookingListData.length > 0 && <Group mb="md" className='my-4'>
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
            name:'',
            commissionFee: '',
            price:''
          })}}
        >
          Clear Filters
        </Button>
      </Group>}      
      {bookingListData.length > 0 ? (
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

export default BookingListDatatables;
