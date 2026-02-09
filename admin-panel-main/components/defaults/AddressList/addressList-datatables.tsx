'use client';

import { ActionIcon, Button, Center, Group, Text, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DataTable, DataTableProps, DataTableSortStatus } from 'mantine-datatable';
import { toast } from 'react-toastify';
import { IconUserPlus, IconTrash } from '@tabler/icons-react';
import classes from './ComplexUsageExample.module.css';
import { closeAllModals, openModal } from '@mantine/modals';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

const PAGE_SIZE = 10;

const AddressListDatatables = () => {
  const router = useRouter();
  const [addressData, setAddressData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const { data: adminProfileData, loading, error } = useSelector((state: IRootState) => state.adminProfile);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<any>>({
    columnAccessor: 'value',
    direction: 'asc',
  });
  const [filters, setFilters] = useState({
    _id:'',
    value:'',
  });
  
  const fetchAddressData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/review-address`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setAddressData(response.data.result.data);
        setTotalRecords(response.data.result.count)
      } else {
        console.error('Failed to load address data.');
      }
    } catch (error) {
      console.error('An error occurred while fetching address data.');
    }
  };

  useEffect(() => {
    fetchAddressData();
  }, [router]);

  const filteredData = addressData.filter((addressList) => {

    return (
      (filters.value === '' || addressList.value.toLowerCase().includes(filters.value.toLowerCase())) &&
      (filters._id === '' || addressList._id.toLowerCase().includes(filters._id.toLowerCase()))
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

    setAddressData(sortedData);
  };
  const paginatedData = () => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const paginationData = filteredData ? filteredData.slice(start, end) : addressData.slice(start, end)
    return paginationData
  };
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/review-address/${id}`,
        {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201 && response.data.success) {
        toast.success(response.data.message);
        // Refresh the data after deletion
        await fetchAddressData()
      } else {
        toast.error('Failed to delete address.');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the address.');
    }
  };

  const columns: DataTableProps<any>['columns'] = [
    {
      accessor: 'value',
      title: 'Address',
      sortable: true,
      filter: (
        <TextInput
          placeholder="Filter by value"
          value={filters.value}
          onChange={(e) => setFilters((prev) => ({ ...prev, value: e.currentTarget?.value || '' }))}
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
      render: (record) => (
        <>{adminProfileData?.role === "superadmin" &&   <Group justify="center" wrap="nowrap">
          <ActionIcon color="red" onClick={() => handleDelete(record._id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>}</>
      ),
    },
  ];

  const addNewAddress = async ( newAddress: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/review-address`,
        {
          address: newAddress, // Pass the updated address directly
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
  
      if (response.status === 201) {
        toast.success(response.data.message);
        await fetchAddressData(); // Assuming this reloads the relevant data
      } else {
        toast.error('Address added failed! Please try again.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'An error occurred!');
    }
  };

  const addAddress = () => {
    let tempNewAddress = '';
    openModal({
      title: `Add address`,
      classNames: { header: classes.modalHeader, title: classes.modalTitle },
      children: (
        <>
          <TextInput
            mt="md"
            placeholder="Your address..."
            onChange={(e) => {
              tempNewAddress = e.target.value; // Update the temporary value
            }}
          />
          <Group mt="md" gap="sm" justify="flex-end">
            <Button color="red" onClick={() => closeAllModals()}>
              Cancel
            </Button>
            <Button
              color="green"
              onClick={() => {
                addNewAddress(tempNewAddress); // Pass the new address here
                closeAllModals();
              }}
            >
              Create
            </Button>
          </Group>
        </>
      ),
    });
  };
  return (
    <>
   {adminProfileData?.role === "superadmin" &&    <div className='flex justify-end'>
        <Button
        variant="filled"
        onClick={() => addAddress()}
        color="rgba(12, 1, 110, 1)"><IconUserPlus color='white' size={16} className='mr-2'/> Add Address</Button>
    </div>}
    <div className='pt-5'>
    {addressData.length > 0 && <Group mb="md" className='my-y'>
        <Button
          variant="outline"
          onClick={() => {setFilters({
            _id:'',
            value:'',
          })}}
        >
          Clear Filters
        </Button>
      </Group>}
      {addressData.length > 0 ? (
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

export default AddressListDatatables;
