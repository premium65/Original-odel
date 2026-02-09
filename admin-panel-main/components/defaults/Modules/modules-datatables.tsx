'use client';

import { ActionIcon, Button, Center, Group, Text, TextInput, Select } from '@mantine/core';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DataTable, DataTableProps, DataTableSortStatus } from 'mantine-datatable';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

const PAGE_SIZE = 10;

const ModulesDatatables = () => {
  const router = useRouter();
  const [pageNameData, setPageNameData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const { data: adminProfileData, loading, error } = useSelector((state: IRootState) => state.adminProfile);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: 'pagename',
    direction: 'asc',
  });
  const [filters, setFilters] = useState({
    _id: '',
    pagename: '',
    status: ''
  });
  const fetchModulesData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules?page=${page}&limit=10000&fillter=%7B%7D&sortObj=%7B%7D`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setPageNameData(response.data.result.data);
        setTotalRecords(response.data.result.count);
      } else {
        console.error('Failed to load modules data.');
      }
    } catch (error) {
      console.error('An error occurred while fetching modules data.');
    }
  };
  useEffect(() => {
    fetchModulesData();
  }, [router]);

  const filteredData = pageNameData.filter((module) => {
    return (
      (filters.pagename === '' || module.pagename.toLowerCase().includes(filters.pagename.toLowerCase())) &&
      (filters.status === '' || module.status === filters.status) &&
      (filters._id === '' || module._id.toLowerCase().includes(filters._id.toLowerCase()))
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

    setPageNameData(sortedData);
  };
  const paginatedData = () => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const paginationData = filteredData ? filteredData.slice(start, end) : pageNameData.slice(start, end)
    return paginationData
  };
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules`,
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
        await fetchModulesData();
      } else {
        toast.error('Failed to delete module.');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the module.');
    }
  };

  const columns: DataTableProps<any>['columns'] = [
    {
      accessor: 'pagename',
      title: 'Module',
      sortable: true,
      filter: (
        <TextInput
          placeholder="Filter by Module"
          value={filters.pagename}
          onChange={(e) => setFilters((prev) => ({ ...prev, pagename: e.currentTarget?.value || '' }))}
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
      title: 'Actions',
      render: (record) => (
        <>{adminProfileData?.role === "superadmin" && <Group>
          <Link href={`/edit-module/${record._id}`}>
          <ActionIcon>
            <IconEdit size={16} />
          </ActionIcon>
          </Link>
          <ActionIcon color="red" onClick={() => handleDelete(record._id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>}</>
      ),
    },
  ];

  return (
    <>
    {adminProfileData?.role === "superadmin" &&  <div className='flex justify-end'>
        <Link href={'/add-modules'}>
          <Button variant="filled" color="rgba(12, 1, 110, 1)">
          <IconPlus color='white' size={16} className='mr-2'/> Add Modules
          </Button>
        </Link>
      </div>}
      <div className='pt-5'>
      {pageNameData.length > 0 && <Group mb="md" className='my-y'>
          <Button
            variant="outline"
            onClick={() => {
              setFilters({
                _id: '',
                pagename: '',
                status: '',
              });
            }}
          >
            Clear Filters
          </Button>
        </Group>}
        {pageNameData.length > 0 ? (
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

export default ModulesDatatables;
