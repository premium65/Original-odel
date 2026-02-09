'use client';
import { Button, Center, Group, Text, TextInput, Select, ActionIcon } from '@mantine/core';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import classes from './ComplexUsageExample.module.css';
import { DataTable, DataTableColumn, DataTableProps, DataTableSortStatus } from 'mantine-datatable';
import { openModal } from '@mantine/modals';
import { IconEdit, IconTrash } from '@tabler/icons-react'; // Import these icons if they are not already imported
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

dayjs.extend(utc);
dayjs.extend(timezone);

const PAGE_SIZE = 10;

const renderDate = (date: string) => {
  const parsedDate = dayjs(date);
  return parsedDate.isValid() ? parsedDate.tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm') : 'Invalid Date';
};

interface BankDetails {
  IFSC: string;
  UPI: string;
  accountNo: string;
  bankName: string;
  countryCode: string;
  holderName: string;
  phoneNo: string;
}

interface WithdrawRecord {
  _id: string;
  createdAt: string;
  amount: number;
  userCode: string;
  status: string;
  bankDetails: BankDetails;
  userId:{
    _id:'',
    userId:'',
    phoneNo: '',
    id:''
  };
}

const WithdrawListHistory = () => {
  const router = useRouter();
  const [withdrawHistoryData, setWithdrawHistoryData] = useState<WithdrawRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const { data: adminProfileData, loading, error } = useSelector((state: IRootState) => state.adminProfile);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<WithdrawRecord>>({
    columnAccessor: 'amount',
    direction: 'asc',
  });
  const [filters, setFilters] = useState({
    createdAt: '',
    createdAtFrom: '',
    createdAtTo: '',
    userCode: '',
    amount: '',
    status: '',
    _id: '',
    userId:{
      phoneNo: ''
    }
  });

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const fetchWithdrawHistoryData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/get-withdraw-req?page=${page}&limit=100000&fillter=%7B%7D&sortObj=%7B%7D`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setWithdrawHistoryData(response.data.result.data);
        setTotalRecords(response.data.result.count);
      } else {
        console.error('Failed to load withdraw data.');
      }
    } catch (error) {
      console.error('An error occurred while fetching withdraw data.');
    }
  };

  useEffect(() => {
    fetchWithdrawHistoryData();
  }, [router]);

  const filteredData = withdrawHistoryData.filter((withdraw) => {
    const createdAt = dayjs(withdraw.createdAt).tz('Asia/Kolkata');
    const from = fromDate ? dayjs(fromDate) : null;
    const to = toDate ? dayjs(toDate) : null;

    const isInDateRange = 
      (!from || createdAt.isSame(from, 'day') || createdAt.isAfter(from, 'day')) && 
      (!to || createdAt.isSame(to, 'day') || createdAt.isBefore(to, 'day'));

    return (
      isInDateRange &&
      (!filters.createdAt || dayjs(withdraw.createdAt).format('YYYY-MM-DD').includes(filters.createdAt)) &&
      (!filters.amount || String(withdraw.amount).includes(filters.amount)) &&
      (!filters.userCode || String(withdraw.userCode).includes(filters.userCode)) &&
      (!filters.status || withdraw.status === filters.status) &&
      (!filters._id || withdraw._id.toLowerCase().includes(filters._id.toLowerCase())) &&
      (filters.userId.phoneNo === '' || String(withdraw.userId.phoneNo).includes(filters.userId.phoneNo))
      );
  });

  const handleSortStatusChange = (status: DataTableSortStatus<WithdrawRecord>) => {
    setPage(1);
    setSortStatus(status);
    const sortedData = [...filteredData].sort((a:any, b:any) => {
      const { columnAccessor, direction } = status;
      if (a[columnAccessor] < b[columnAccessor]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[columnAccessor] > b[columnAccessor]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setWithdrawHistoryData(sortedData);
  };
  const paginatedData = () => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const paginationData = filteredData ? filteredData.slice(start, end) : withdrawHistoryData.slice(start, end)
    return paginationData
  };
  const approveWithdrawRequest = async (_id: string, userId: string, amount:number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/approve-withdraw-req`,
        {
          tableId: _id,
          userId:{id:userId},
          amount: amount
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        toast.success(response.data.message);
        await fetchWithdrawHistoryData();
      } else {
        toast.error('Failed to approve withdraw.');
      }
    } catch (error) {
      toast.error('Error approving withdraw.');
    }
  };
  const rejectWithdrawRequest = async (_id: string, userId: string, amount:number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/reject-withdraw-req`,
        {
          tableId: _id,
          userId:userId,
          amount: amount
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        toast.success(response.data.message);
        await fetchWithdrawHistoryData();
      } else {
        toast.error('Failed to reject withdraw.');
      }
    } catch (error) {
      toast.error('Error rejecting withdraw.');
    }
  };
  const viewBankRecord = useCallback(({ bankDetails }: WithdrawRecord) => {
    openModal({
      title: 'Bank Details',
      classNames: { header: classes.modalHeader, title: classes.modalTitle },
      children: (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border-b border-gray-300 text-left">Field</th>
                <th className="px-4 py-2 border-b border-gray-300 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(bankDetails).map(([key, value]) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b border-gray-300">{key}</td>
                  <td className="px-4 py-2 border-b border-gray-300">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    });
  }, []);

  const renderBankDetails: DataTableColumn<WithdrawRecord>['render'] = (record) => (
    <Group justify="left">
      <Button
        size="xs"
        title="View Bank Details"
        variant="success"
        onClick={(e) => {
          e.stopPropagation();
          viewBankRecord(record);
        }}
      >
        View
      </Button>
    </Group>
  );

  const renderActions: DataTableColumn<WithdrawRecord>['render'] = (record) => (
    <>{adminProfileData?.role === "superadmin" &&    <Group gap={4} justify="left" wrap="nowrap">
      <Button size="xs" title="Approve" variant="filled" className="p-2" onClick={() => {
                approveWithdrawRequest(record._id, record.userId.id, record.amount);
              }}
              disabled={record.status === 'completed' || record.status === 'rejected'}>
        Approve
      </Button>
      <Button size="xs" title="Reject" variant="filled" color="red" className="p-2" onClick={() => {
                rejectWithdrawRequest(record._id, record.userId._id, record.amount);
              }}  disabled={record.status === 'completed' || record.status === 'rejected'}>
        Reject
      </Button>
    </Group> }</>
  );

  const columns: DataTableProps<WithdrawRecord>['columns'] = [
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
render: (record) => {
  let color = 'blue'; // Default color for 'new'

  if (record.status === 'completed') {
    color = 'green';
  } else if (record.status === 'rejected') {
    color = 'red';
  }

  return (
    <Button
      variant="filled"
      size="xs"
      color={color}
      className="capitalize cursor-auto"
    >
      {record.status}
    </Button>
  );
},
filter: (
  <Select
    placeholder="Filter by status"
    value={filters.status}
    onChange={(value) => setFilters((prev) => ({ ...prev, status: value || '' }))}
    data={[
      { value: 'completed', label: 'Completed' },
      { value: 'new', label: 'New' },
      { value: 'rejected', label: 'Rejected' },
    ]}
  />
),
},
    {
      accessor: 'bankDetails',
      title: 'Bank Details',
      render: renderBankDetails,
    },
    {
      accessor: 'actions',
      title: 'Actions',
      render: renderActions,
    },
  ];

  return (
    <div>
           {withdrawHistoryData.length > 0 && <Group mb="md" className='my-4'>
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
            createdAt: '',
            createdAtFrom: '',
            createdAtTo: '',
            userCode: '',
            amount: '',
            status: '',
            _id: '',
            userId:{
              phoneNo: ''
            }
          })}}
        >
          Clear Filters
        </Button>
      </Group>}
      {withdrawHistoryData.length > 0 ? (
      <DataTable
        columns={columns}
        records={paginatedData()}
        totalRecords={totalRecords}
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
    </div>
  );
};

export default WithdrawListHistory;
