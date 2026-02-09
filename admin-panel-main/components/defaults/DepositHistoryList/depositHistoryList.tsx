'use client';
import { Button, Center, Group, Text, TextInput, Select } from '@mantine/core';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DataTable, DataTableProps, DataTableSortStatus } from 'mantine-datatable';


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

const DepositListHistory = () => {
    const router = useRouter();
    const [depositHistoryData, setDepositHistoryData] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
      columnAccessor: 'amount',
      direction: 'asc',
    });
    const [filters, setFilters] = useState({
      _id: '',
      createdAtFrom: '',
      createdAtTo: '',
      createdAt:'',
      amount: '',
      userId:'',
      status: '',
    });

      // Date range filtering
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
    const fetchDepositHistoryData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/get-deposit-list?page=${page}&limit=100000&fillter=%7B%7D&sortObj=%7B%7D`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200 && response.data.success) {
          setDepositHistoryData(response.data.result.data);
          setTotalRecords(response.data.result.count);
        } else {
          console.error('Failed to load deposit data.');
        }
      } catch (error) {
        console.error('An error occurred while fetching deposit data.');
      }
    };

    useEffect(() => {
      fetchDepositHistoryData();
    }, [router]);
  
    const filteredData = depositHistoryData.filter((deposit) => {
      const createdAt = dayjs(deposit.createdAt).tz('Asia/Kolkata');
    const from = fromDate ? dayjs(fromDate) : null;
    const to = toDate ? dayjs(toDate) : null;

    const isInDateRange = (!from || createdAt.isSame(from, 'day') || createdAt.isAfter(from, 'day')) && (!to || createdAt.isSame(to, 'day') || createdAt.isBefore(to, 'day'));

      return (
        isInDateRange &&
        (filters.createdAt === '' || dayjs(deposit.createdAt).format('YYYY-MM-DD').includes(filters.createdAt)) &&
        (filters.amount === '' || String(deposit.amount).toLowerCase().includes(filters.amount.toLowerCase())) &&
        (filters.status === '' || deposit.status === filters.status) &&
        (filters._id === '' || deposit._id.toLowerCase().includes(filters._id.toLowerCase())) &&
        (filters.userId === '' || String(deposit.userId).toLowerCase().includes(filters.userId.toLowerCase()))
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
  
      setDepositHistoryData(sortedData);
    };
    const paginatedData = () => {
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const paginationData = filteredData ? filteredData.slice(start, end) : depositHistoryData.slice(start, end)
      return paginationData
    };
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
            title: 'User Id',
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
        accessor: 'amount',
        title: 'Transfer Amount',
        sortable: true,
        filter: (
          <TextInput
            placeholder="Filter by amount"
            value={filters.amount}
            onChange={(e) => setFilters((prev) => ({ ...prev, amount: e.currentTarget?.value || '' }))}
          />
        ),
      },
      {
        accessor: 'status',
        title: 'Status',
        render: (record) => (
          <Button
            variant="filled"
            size='xs'
            color={record.status === 'active' ? 'green' : 'red'}
            className='capitalize cursor-auto'
          >
            {record.status}
          </Button>
        ),
        filter: (
          <Select
            placeholder="Filter by status"
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value || '' }))}
            data={[
              { value: '', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'deactive', label: 'Deactive' },
            ]}
          />
        ),
      }
    ];
  
    return (
      <>
      <div className='pt-5'>  {depositHistoryData.length > 0 && 
          <Group mb="md" className='my-y'>
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
              onClick={() => {
                setFilters({
                  _id: '',
                  createdAtFrom: '',
                  createdAtTo: '',
                  createdAt:'',
                  amount: '',
                  status: '',
                  userId:''
                });
              }}
            >
              Clear Filters
            </Button>
          </Group>}
          {depositHistoryData.length > 0 ? (
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
            />
          ) : (
            <Center className='h-[300px] flex justify-center items-center'>
              <Text>No records found</Text>
            </Center>
          )}
        </div>
      </>
    );
  };

export default DepositListHistory;
