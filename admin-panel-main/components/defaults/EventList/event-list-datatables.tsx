'use client';

import { ActionIcon, Button, Center, Group, Text, TextInput } from '@mantine/core';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable, DataTableColumn, DataTableProps, DataTableSortStatus } from 'mantine-datatable';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useRouter } from 'next/navigation';

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

const EventListDatatables = () => {
  const router = useRouter();
  const [eventListData, setEventListData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const { data: adminProfileData, loading, error } = useSelector((state: IRootState) => state.adminProfile);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: 'title',
    direction: 'asc',
  });
  const [filters, setFilters] = useState({
    _id:'',
    createdAt:'',
    title:'',
    description: '',
    deskView: '',
    mobileView:''
  });

  const fetchEventData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/events?page=${page}&limit=10000&fillter=%7B%7D&sortObj=%7B%7D`,
        {
          headers: {
            Authorization: `${token}`,
          }
        }
      );

      if (response.status === 200 && response.data.success) {
        setTotalRecords(response.data.result.count)
        setEventListData(response.data.result.data);
      } else {
        console.error('Failed to load event data.');
      }
    } catch (error) {
      console.error('An error occurred while fetching event data.');
    }
  };
  useEffect(() => {
    fetchEventData();
  }, [router]);

const filteredData = eventListData.filter((event) => {
    return (
    (filters.createdAt === '' || dayjs(event.createdAt).format('YYYY-MM-DD').includes(filters.createdAt)) &&
    (filters.title === '' || event.title.toLowerCase().includes(filters.title.toLowerCase())) &&
    (filters.description === '' || event.description.toLowerCase().includes(filters.description.toLowerCase())) &&
    (filters.deskView === '' || event.deskView.toLowerCase().includes(filters.deskView.toLowerCase())) &&
    (filters.mobileView === '' || event.mobileView.toLowerCase().includes(filters.mobileView.toLowerCase())) &&
    (filters._id === '' || event._id.toLowerCase().includes(filters._id.toLowerCase()))
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

    setEventListData(sortedData);
  };
  const paginatedData = () => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const paginationData = filteredData ? filteredData.slice(start, end) : eventListData.slice(start, end)
    return paginationData
  };
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/events?id=${id}`,
        {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 && response.data.success) {
        toast.success(response.data.message);
        // Refresh the data after deletion
        await fetchEventData()
      } else {
        toast.error('Failed to delete event.');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the event.');
    }
  };
  const renderActions: DataTableColumn<any>['render'] = (record) => (
    <>{adminProfileData?.role === "superadmin" && <Group gap={4} justify="right" wrap="nowrap">
    <Link href={`/edit-event/${record._id}`}>
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
      accessor: 'description',
      title: 'Description',
      sortable: true,
      width: 700,
      cellsClassName:'text-justify', 
      filter: (
        <TextInput
          placeholder="Filter by description"
          value={filters.description}
          onChange={(e) => setFilters((prev) => ({ ...prev, description: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'deskView',
      title: 'Desktop View',
      filter: (
        <TextInput
          placeholder="Filter by deskView"
          value={filters.deskView}
          onChange={(e) => setFilters((prev) => ({ ...prev, deskView: e.currentTarget?.value || '' }))}
        />
      ),
    },
    {
      accessor: 'mobileView',
      title: 'Mobile View',
      filter: (
        <TextInput
          placeholder="Filter by mobileView"
          value={filters.mobileView}
          onChange={(e) => setFilters((prev) => ({ ...prev, mobileView: e.currentTarget?.value || '' }))}
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
      {adminProfileData?.role === "superadmin" && <div className='flex justify-end'>
      <Link href={'/add-event'}>
        <Button
        variant="filled"
        color="rgba(12, 1, 110, 1)"><IconPlus color='white' size={16} className='mr-2'/> Add Event</Button></Link>
    </div>}
    {eventListData.length > 0 && <Group mb="md" className='my-4'>
        <Button
          variant="outline"
          onClick={() => {setFilters({
            _id:'',
            createdAt:'',
            title:'',
            description: '',
            deskView: '',
            mobileView:''
          })}}
        >
          Clear Filters
        </Button>
      </Group>}      
      {eventListData.length > 0 ? (
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

export default EventListDatatables;
