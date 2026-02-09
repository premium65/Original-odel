'use client';

import { ActionIcon, Button, Center, Group, Text, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DataTable, DataTableProps, DataTableSortStatus } from 'mantine-datatable';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { IconUserPlus, IconClipboard, IconTrash } from '@tabler/icons-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';


const PAGE_SIZE = 10;

const SubAdminDatatables = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const { data: adminProfileData, loading, error } = useSelector((state: IRootState) => state.adminProfile);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: 'name',
    direction: 'asc',
  });
  const [filters, setFilters] = useState({
    _id:'',
    name:'',
    adminInviteId:'',
    email: '',
  });
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/sub-admin?page=${page}&limit=10000&fillter=%7B%7D&sortObj=%7B%7D`,
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
    return (
      (filters.name === '' || user.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.adminInviteId === '' || user.adminInviteId.includes(filters.adminInviteId)) &&
      (filters.email === '' || user.email.toLowerCase().includes(filters.email.toLowerCase())) &&
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
  const handleCopy = (adminInviteId: string) => {
    setCopySuccess(adminInviteId); // Track the specific adminInviteId that was copied
    setTimeout(() => setCopySuccess(null), 2000);
  };
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/sub-admin`,
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
        await fetchUserData()
      } else {
        toast.error('Failed to delete subadmin.');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the subadmin.');
    }
  };

  const columns: DataTableProps<any>['columns'] = [
    {
      accessor: 'name',
      title: 'Name',
      sortable: true,
      render: (record) => ( <Link
        href={{
          pathname: `/sub-admin/${record.name}`,
          query: { id: record._id },
        }}
        className='text-blue-500'
      >{record.name}</Link>),
      filter: (
        <TextInput
          placeholder="Filter by userId"
          value={filters.name}
          onChange={(e) => setFilters((prev) => ({ ...prev, name: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'adminInviteId',
      title: 'Admin Invite Id',
      render: (record) => (
        <div className="flex items-center">
          <div className='w-5/6'>
        <Text>{record.adminInviteId}</Text>
        </div>
        <div className='w-1/6 relative'>
        <CopyToClipboard text={record.adminInviteId} onCopy={() => handleCopy(record.adminInviteId)}>
          <ActionIcon>
            <IconClipboard size={16} />
          </ActionIcon>
        </CopyToClipboard>
        {copySuccess === record.adminInviteId && (
          <div className="absolute top-[-20px] left-[65px] transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded z-10">
            Copied!
          </div>
        )}
        </div>
      </div>
      ),
      filter: (
        <TextInput
          placeholder="Filter by adminInviteId"
          value={filters.adminInviteId}
          onChange={(e) => setFilters((prev) => ({ ...prev, adminInviteId: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'email',
      title: 'Email',
      filter: (
        <TextInput
          placeholder="Filter by email"
          value={filters.email}
          onChange={(e) => setFilters((prev) => ({ ...prev, email: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'action',
      title: (
        <Center>
          Action
        </Center>
      ),
      width: '0%',
      render: (record) => (
        <>{adminProfileData?.role === "superadmin" && <Group justify="center" wrap="nowrap">
          <ActionIcon color="red" onClick={() => handleDelete(record._id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>}</>
      ),
    },
  ];

  return (
    <>
  {adminProfileData?.role === "superadmin" &&   <div className='flex justify-end'>
      <Link href={'/add-admin'}>
        <Button
        variant="filled"
        color="rgba(12, 1, 110, 1)"><IconUserPlus color='white' size={16} className='mr-2'/> Add Subadmin</Button></Link>
    </div>}
    <div className='pt-5'>
    {userData.length > 0 && <Group mb="md" className='my-y'>
        <Button
          variant="outline"
          onClick={() => {setFilters({
            _id:'',
            name:'',
            adminInviteId: '',
            email:''
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
      </div>
    </>
  );
};

export default SubAdminDatatables;
