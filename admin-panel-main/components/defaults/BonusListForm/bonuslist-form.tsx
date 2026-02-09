'use client';
import {ActionIcon, Button, Center, Group, Text, TextInput, Select } from '@mantine/core';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DataTable, DataTableProps, DataTableSortStatus } from 'mantine-datatable';
import Link from 'next/link';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

interface BonusListProps {
    id: any
}

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

const BonusListForm: React.FC<BonusListProps> = ({ id }) => {
    const router = useRouter();
    const [bonusData, setBonusData] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);
    const { data: adminProfileData, loading, error } = useSelector((state: IRootState) => state.adminProfile);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
      columnAccessor: 'amount',
      direction: 'asc',
    });
    const [filters, setFilters] = useState({
      _id: '',
      createdAt:'',
      amount: '',
      status: '',
      userStatus: ''
    });
  
    useEffect(() => {
      const fetchBonusData = async () => {
        try {
          const token = localStorage.getItem('authToken');
          const filter = {
            page: page,
            limit: PAGE_SIZE,
            filter: {},
            sortObj: {}
          };
          const encodedFilter = encodeURIComponent(JSON.stringify(filter));
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/get-bonus-list?userId=${id}&filter=${encodedFilter}`,
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );
  
          if (response.status === 200 && response.data.success) {
            setBonusData(response.data.result.data.bonus);
            setTotalRecords(response.data.result.data.count);
          } else {
            console.error('Failed to load bonus data.');
          }
        } catch (error) {
          console.error('An error occurred while fetching bonus data.');
        }
      };
  
      fetchBonusData();
    }, [router]);
  
    const filteredData = bonusData.filter((bonus) => {
      return (
        (filters.createdAt === '' || dayjs(bonus.createdAt).format('YYYY-MM-DD').includes(filters.createdAt)) &&
        (filters.amount === '' || String(bonus.amount).includes(filters.amount)) &&
        (filters.status === '' || bonus.status === filters.status) &&
        (filters.userStatus === '' || bonus.userStatus === filters.userStatus) &&
        (filters._id === '' || bonus._id.toLowerCase().includes(filters._id.toLowerCase()))
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
  
      setBonusData(sortedData);
    };
    const paginatedData = () => {
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const paginationData = filteredData ? filteredData.slice(start, end) : bonusData.slice(start, end)
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
        accessor: 'amount',
        title: 'Amount',
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
        accessor: 'actions',
        title: 'Actions',
        render: (record) => (
          <>{adminProfileData?.role === "superadmin" &&<Group justify='center'>
               <Link href={`/bonus-edit/${record._id}`}>
            <ActionIcon>
              <IconEdit size={16} />
            </ActionIcon>
            </Link>
          </Group>}</>
        ),
      },
    ];
  
    return (
      <>
        {adminProfileData?.role === "superadmin" &&<div className='flex justify-end'>
          <Link href={`/bonus-add/${id}`}>
            <Button variant="filled" color="rgba(12, 1, 110, 1)">
            <IconPlus color='white' size={16} className='mr-2'/> Add Bonus
            </Button>
          </Link>
        </div>}
      <div className='pt-5'>  {bonusData.length > 0 && 
          <Group mb="md" className='my-y'>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  _id: '',
                  createdAt:'',
                  amount: '',
                  status: '',
                  userStatus:''
                });
              }}
            >
              Clear Filters
            </Button>
          </Group>}
          {bonusData.length > 0 ? (
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

export default BonusListForm;
