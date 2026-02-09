'use client';
import { Button, Center, Group, Text, TextInput, Select, ActionIcon } from '@mantine/core';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DataTable, DataTableColumn, DataTableProps, DataTableSortStatus } from 'mantine-datatable';
import Link from 'next/link';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
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

const PolicyListDatatable = () => {
    const router = useRouter();
    const [policyData, setPolicyData] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);
    const { data: adminProfileData, loading, error } = useSelector((state: IRootState) => state.adminProfile);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
      columnAccessor: 'title',
      direction: 'asc',
    });
    const [filters, setFilters] = useState({
      _id: '',
      createdAt:'',
      identifier:'',
      title:'',
      content:'',
      status: ''
    });
    const fetchPolicyData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/policy?page=${page}&limit=10000&fillter=%7B%7D&sortObj=%7B%7D`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200 && response.data.success) {
          setPolicyData(response.data.result.data);
          setTotalRecords(response.data.result.count);
        } else {
          console.error('Failed to load policy data.');
        }
      } catch (error) {
        console.error('An error occurred while fetching policy data.');
      }
    };

    useEffect(() => {
      fetchPolicyData();
    }, [router]);
  
    const filteredData = policyData.filter((policy) => {
      return (
        (filters.createdAt === '' || dayjs(policy.createdAt).format('YYYY-MM-DD').includes(filters.createdAt)) &&
        (filters.identifier === '' || policy.identifier.toLowerCase().includes(filters.identifier.toLowerCase())) &&
        (filters.title === '' || policy.title.toLowerCase().includes(filters.title.toLowerCase())) &&
        (filters.content === '' || policy.content.toLowerCase().includes(filters.content.toLowerCase())) &&
        (filters.status === '' || policy.status === filters.status) &&
        (filters._id === '' || policy._id.toLowerCase().includes(filters._id.toLowerCase()))
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
  
      setPolicyData(sortedData);
    };
    const paginatedData = () => {
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const paginationData = filteredData ? filteredData.slice(start, end) : policyData.slice(start, end)
      return paginationData
    };
    const renderActions: DataTableColumn<any>['render'] = (record) => (
      <>{adminProfileData?.role === "superadmin" && <Group gap={4} justify="center" wrap="nowrap">
      <Link href={`/updatepolicy/${record._id}`}>
       <ActionIcon
          size="xs"
          title='Edit'
          variant="filled"
          className='w-7 h-7'
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <IconEdit color='white' size={16} />
        </ActionIcon>
        </Link>
      </Group>}</>
    );
    const columns: DataTableProps<any>['columns'] = [
          {
            accessor: 'identifier',
            title: 'Identifier',
            sortable: true,
            filter: (
              <TextInput
                placeholder="Filter by identifier"
                value={filters.identifier}
                onChange={(e) => setFilters((prev) => ({ ...prev, identifier: e.currentTarget?.value || '' }))}
              />
            ),
          },
          {
            accessor: 'title',
            title: 'Title',
            sortable: true,
            filter: (
              <TextInput
                placeholder="Filter by title"
                value={filters.title}
                onChange={(e) => setFilters((prev) => ({ ...prev, title: e.currentTarget?.value || '' }))}
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
        accessor: 'actions',
        title: (
          <Center>
            Actions
          </Center>
        ),
        width: '0%',
        render: renderActions,
      }
    ];
  
    return (
      <>
      <div className='pt-5'>  {policyData.length > 0 && 
          <Group mb="md" className='my-y'>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  _id: '',
                  createdAt:'',
                  identifier: '',
                  content: '',
                  status: '',
                  title:''
                });
              }}
            >
              Clear Filters
            </Button>
          </Group>}
          {policyData.length > 0 ? (
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

export default PolicyListDatatable;
