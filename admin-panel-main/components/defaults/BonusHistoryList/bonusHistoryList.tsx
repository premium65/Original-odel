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

const BonusListHistory = () => {
    const router = useRouter();
    const [bonusHistoryData, setBonusHistoryData] = useState<any[]>([]);
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
      userCode:'',
      taskCount:'',
      amount: '',
      userId:'',
      status: '',
      userStatus: ''
    });

      // Date range filtering
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
    const fetchBonusHistoryData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/get-bonus-history-list?page=${page}&limit=10000&fillter=%7B%7D&sortObj=%7B%7D`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200 && response.data.success) {
          setBonusHistoryData(response.data.result.data);
          setTotalRecords(response.data.result.count);
        } else {
          console.error('Failed to load bonus data.');
        }
      } catch (error) {
        console.error('An error occurred while fetching bonus data.');
      }
    };

    useEffect(() => {
      fetchBonusHistoryData();
    }, [router]);
  
    const filteredData = bonusHistoryData.filter((bonus) => {
      const createdAt = dayjs(bonus.createdAt).tz('Asia/Kolkata');
    const from = fromDate ? dayjs(fromDate) : null;
    const to = toDate ? dayjs(toDate) : null;

    const isInDateRange = (!from || createdAt.isSame(from, 'day') || createdAt.isAfter(from, 'day')) && (!to || createdAt.isSame(to, 'day') || createdAt.isBefore(to, 'day'));

      return (
        isInDateRange &&
        (filters.createdAt === '' || dayjs(bonus.createdAt).format('YYYY-MM-DD').includes(filters.createdAt)) &&
        (filters.taskCount === '' || String(bonus.taskCount).toLowerCase().includes(filters.taskCount.toLowerCase())) &&
        (filters.amount === '' || String(bonus.amount).toLowerCase().includes(filters.amount.toLowerCase())) &&
        (filters.userCode === '' || String(bonus.userCode).toLowerCase().includes(filters.userCode.toLowerCase())) &&
        (filters.status === '' || bonus.status === filters.status) &&
        (filters.userStatus === '' || bonus.userStatus === filters.userStatus) &&
        (filters._id === '' || bonus._id.toLowerCase().includes(filters._id.toLowerCase())) &&
        (filters.userId === '' || bonus.userId.toLowerCase().includes(filters.userId.toLowerCase()))
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
  
      setBonusHistoryData(sortedData);
    };
    const paginatedData = () => {
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const paginationData = filteredData ? filteredData.slice(start, end) : bonusHistoryData.slice(start, end)
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
            accessor: 'userCode',
            title: 'User Id',
            sortable: true,
            filter: (
              <TextInput
                placeholder="Filter by userCode"
                value={filters.userCode}
                onChange={(e) => setFilters((prev) => ({ ...prev, userCode: e.currentTarget?.value || '' }))}
              />
            ),
          },
          {
            accessor: 'taskCount',
            title: 'Task Count',
            sortable: true,
            filter: (
              <TextInput
                placeholder="Filter by taskCount"
                value={filters.taskCount}
                onChange={(e) => setFilters((prev) => ({ ...prev, taskCount: e.currentTarget?.value || '' }))}
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
        accessor: 'userStatus',
        title: 'User Status',
        render: (record) => (
          <Button
            variant="filled"
            size='xs'
            color={record.userStatus === 'completed' ? 'green' : 'blue'}
            className='capitalize cursor-auto'
          >
            {record.userStatus}
          </Button>
        ),
        filter: (
          <Select
            placeholder="Filter by userStatus"
            value={filters.userStatus}
            onChange={(value) => setFilters((prev) => ({ ...prev, userStatus: value || '' }))}
            data={[
              { value: '', label: 'All' },
              { value: 'new', label: 'New' },
              { value: 'completed', label: 'Completed' },
            ]}
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
      <div className='pt-5'>  {bonusHistoryData.length > 0 && 
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
                setToDate(''), setFromDate(''), setFilters({
                  _id: '',
                  createdAtFrom: '',
                  createdAtTo: '',
                  createdAt:'',
                  amount: '',
                  status: '',
                  userId:'',
                  userStatus:'',
                  userCode:'',
                  taskCount:'',
                });
              }}
            >
              Clear Filters
            </Button>
          </Group>}
          {bonusHistoryData.length > 0 ? (
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

export default BonusListHistory;
