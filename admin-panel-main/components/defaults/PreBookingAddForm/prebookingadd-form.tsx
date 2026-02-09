'use client';
import { Button, TextInput } from '@mantine/core';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Define the validation schema using Yup
const validationSchema = Yup.object({
    hotelPrice: Yup.number()
        .typeError('Hotel Price must be a number')
        .min(1, 'Hotel Price must be at least 1')
        .required('Hotel Price is required'),
    taskNo: Yup.number()
        .typeError('Task Number must be a number')
        .min(1, 'Task Number must be at least 1')
        .max(30, 'Task Number must be less than or equal to 30')
        .required('Task Number is required'),
    commission: Yup.number()
        .typeError('Commission Fee must be a number')
        .min(1, 'Commission Fee must be at least 1')
        .required('Commission Fee is required'),
});

interface PreBookingProps {
    id: any
}

const PreBookingAddForm: React.FC<PreBookingProps> = ({ id }) => {
    const router = useRouter();
    const [userAsset, setUserAsset] = useState();
    const [hotelListData, setHotelListData] = useState<any[]>([]);
    const [selectedHotel, setSelectedHotel] = useState<any>(null);

    const fetchUserAsset = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/get-user-asset?userId=${id}`,
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );

            if (response.status === 200 && response.data.success) {
                setUserAsset(response.data.result.data);
            } else {
                console.error('Failed to load user data.');
            }
        } catch (error) {
            console.error('An error occurred while fetching user data.');
        }
    };

    const fetchHotelData = async (hotelPrice: number) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/get-bookings-by-filter?price=${hotelPrice}`,
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );

            if (response.status === 200 && response.data.success) {
                setHotelListData(response.data.result|| []);
            } else {
                console.error('Failed to load hotel data.');
            }
        } catch (error) {
            console.error('An error occurred while fetching hotel data.');
        }
    };

    useEffect(() => {
        if (id) {
            fetchUserAsset();
        }
    }, [id]);

    const handleEditSubmit = async (values: any) => {
        try {
            const token = localStorage.getItem('authToken');
            const payload = {
                price:  selectedHotel?.price,
                hotelPrice: values.hotelPrice,
                commission: values.commission,
                taskNo: values.taskNo,
                hotelId: selectedHotel?._id,
                name: selectedHotel?.name,
                userId: id,
                hotelLength: hotelListData.length,
            };

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/pre-booking-update`,
                payload,
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );

            if (response.status === 200 && response.data.success) {
                toast.success(response.data.message);
                router.push('/userList');
            } else {
                toast.error('Failed to add premium task.');
            }
        } catch (error: any) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <div className="my-10">
            <div className="mx-auto">
                <Formik
                    initialValues={{
                        hotelPrice: '',
                        taskNo: '',
                        commission: '',
                        selectedHotelId: '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleEditSubmit}
                >
                    {({ values, setFieldValue, isSubmitting, isValid }) => (
                        <Form className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Hotel Price Field */}
                            <div className="my-3">
                                <label
                                    htmlFor="hotelPrice"
                                    className="mb-2 block font-semibold"
                                >
                                    Hotel Price:
                                </label>
                                <Field
                                    name="hotelPrice"
                                    as={TextInput}
                                    className="w-full rounded border px-3 py-2"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const value = e.target.value;
                                        setFieldValue('hotelPrice', value);
                                        const numericValue = Number(value);

                                        if (value && !isNaN(numericValue) && numericValue > 0) {
                                            fetchHotelData(numericValue);
                                        } else {
                                            setHotelListData([]); // Clear hotel list if input is invalid
                                        }
                                    }}
                                />
                                <ErrorMessage
                                    name="hotelPrice"
                                    component="div"
                                    className="mt-2 text-sm text-red-500"
                                />
                            </div>

                            {/* Commission Fee Field */}
                            <div className="my-3">
                                <label
                                    htmlFor="commission"
                                    className="mb-2 block font-semibold"
                                >
                                    Commission:
                                </label>
                                <Field
                                    name="commission"
                                    type="number"
                                    as={TextInput}
                                    className="w-full rounded border px-3 py-2"
                                />
                                <ErrorMessage
                                    name="commission"
                                    component="div"
                                    className="mt-2 text-sm text-red-500"
                                />
                            </div>

                            {/* Task Number Field */}
                            <div className="my-3">
                                <label
                                    htmlFor="taskNo"
                                    className="mb-2 block font-semibold"
                                >
                                    Task Number:
                                </label>
                                <Field
                                    name="taskNo"
                                    type="number"
                                    as={TextInput}
                                    className="w-full rounded border px-3 py-2"
                                    min={0}
                                />
                                <ErrorMessage
                                    name="taskNo"
                                    component="div"
                                    className="mt-2 text-sm text-red-500"
                                />
                            </div>

                            {/* Hotel Selection Table */}
                            <div className="col-span-1 my-3 md:col-span-2">
                                <table className="min-w-full divide-y divide-gray-200 border">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Hotel Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Commission
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {hotelListData.length > 0 ? (
                                            hotelListData.map((hotel) => (
                                                <tr key={hotel._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Field
                                                            type="radio"
                                                            name="selectedHotelId"
                                                            value={hotel._id}
                                                            onClick={() => setSelectedHotel(hotel)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {hotel.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {hotel.commissionFee}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {hotel.price}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="text-center">No hotel to show, enter a valid price</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Submit Button */}
                            <div className="col-span-1 my-5 flex justify-center md:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !isValid}
                                    className={`rounded px-4 py-2 ${isSubmitting || !isValid ? 'cursor-not-allowed bg-gray-400 hover:bg-gray-400' : ''} text-white`}
                                >
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default PreBookingAddForm;
