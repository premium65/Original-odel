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

const HelpListDatatable = () => {
    const router = useRouter();
    const [helpData, setHelpData] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);
    const { data: adminProfileData, loading, error } = useSelector((state: IRootState) => state.adminProfile);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
      columnAccessor: 'question',
      direction: 'asc',
    });
    const [filters, setFilters] = useState({
      _id: '',
      createdAt:'',
      question:'',
      answer:'',
      status: ''
    });
    const fetchFaqData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/faq?page=${page}&limit=10000&fillter=%7B%7D&sortObj=%7B%7D`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.status === 200 && response.data.success) {
          setHelpData(response.data.result.data);
          setTotalRecords(response.data.result.count);
        } else {
          console.error('Failed to load faq data.');
        }
      } catch (error) {
        console.error('An error occurred while fetching faq data.');
      }
    };

    useEffect(() => {
      fetchFaqData();
    }, [router]);
  
    const filteredData = helpData.filter((help) => {
      return (
        (filters.createdAt === '' || dayjs(help.createdAt).format('YYYY-MM-DD').includes(filters.createdAt)) &&
        (filters.question === '' || help.question.toLowerCase().includes(filters.question.toLowerCase())) &&
        (filters.answer === '' || help.answer.toLowerCase().includes(filters.answer.toLowerCase())) &&
        (filters.status === '' || help.status === filters.status) &&
        (filters._id === '' || help._id.toLowerCase().includes(filters._id.toLowerCase()))
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
  
      setHelpData(sortedData);
    };
    const paginatedData = () => {
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const paginationData = filteredData ? filteredData.slice(start, end) : helpData.slice(start, end)
      return paginationData
    };
    const handleDelete = async (id: string) => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/faq`,
          {
            headers: {
              Authorization: `${token}`,
              'Content-Type': 'application/json'
            },
            data: { id },
          }
        );
  
        if (response.status === 200 && response.data.success) {
          toast.success(response.data.message);
          // Refresh the data after deletion
          await fetchFaqData()
        } else {
          toast.error('Failed to delete help.');
        }
      } catch (error) {
        toast.error('An error occurred while deleting the help.');
      }
    };

    const renderActions: DataTableColumn<any>['render'] = (record) => (
      <>{adminProfileData?.role === "superadmin" && <Group gap={4} justify="right" wrap="nowrap">
      <Link href={`/update-help/${record._id}`}>
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
        <ActionIcon
          size="xs"
          title='Delete'
          variant="filled"
          color='red'
          className='w-7 h-7'
          onClick={() => handleDelete(record._id)}
        >
          <IconTrash color='white' size={16} />
        </ActionIcon>
      </Group>}</>
    );
    const columns: DataTableProps<any>['columns'] = [
          {
            accessor: 'question',
            title: 'Question',
            sortable: true,
            filter: (
              <TextInput
                placeholder="Filter by question"
                value={filters.question}
                onChange={(e) => setFilters((prev) => ({ ...prev, question: e.currentTarget?.value || '' }))}
              />
            ),
          },
          {
            accessor: 'answer',
            title: 'Answer',
            sortable: true,
            filter: (
              <TextInput
                placeholder="Filter by answer"
                value={filters.answer}
                onChange={(e) => setFilters((prev) => ({ ...prev, answer: e.currentTarget?.value || '' }))}
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
             {adminProfileData?.role === "superadmin" && <div className='flex justify-end'>
      <Link href={'/add-help'}>
        <Button
        variant="filled"
        color="rgba(12, 1, 110, 1)"><IconPlus color='white' size={16} className='mr-2'/> Add Help</Button></Link>
    </div>}
      <div className='pt-5'>  {helpData.length > 0 && 
          <Group mb="md" className='my-y'>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  _id: '',
                  createdAt:'',
                  question: '',
                  status: '',
                  answer:''
                });
              }}
            >
              Clear Filters
            </Button>
          </Group>}
          {helpData.length > 0 ? (
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

export default HelpListDatatable;
