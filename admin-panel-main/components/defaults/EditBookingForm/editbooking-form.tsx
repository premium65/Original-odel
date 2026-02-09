'use client';
import { Button, TextInput, Textarea } from '@mantine/core';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { IconX } from '@tabler/icons-react';

// Define the validation schema using Yup
const validationSchema = Yup.object({
    name: Yup.string().required('Hotel Name is required'),
    price: Yup.number().typeError('Price must be a number').min(1, 'Price must be at least 1').required('Price is required'),
    commissionFee: Yup.number().typeError('Commission Fee must be a number').min(1, 'Commission Fee must be at least 1').required('Commission Fee is required'),
    description: Yup.string().required('Description is required'),
    landScapeImage: Yup.mixed().required('Landscape Image is required'),
    locationImage: Yup.mixed().required('Location Image is required'),
    hotelImages: Yup.array().min(6, 'Exactly 6 images are required').max(6, 'Exactly 6 images are required').required('Exactly 6 images are required'),
});
// Define form values type
interface FormValues {
    name: string;
    price: number;
    description: string;
    commissionFee: number;
    landScapeImage: File | string | null;
    locationImage: File | string | null;
    hotelImages: (File | string)[];
  }
const EditBookingForm: React.FC<{ id: any }> = ({ id }) => {
    const router = useRouter();
    const [singleBooking, setSingleBooking] = useState<FormValues | null>(null);

    useEffect(() => {
        const fetchBookingData = async () => {
          try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/get-single-booking?_id=${id}`,
              {
                headers: {
                  Authorization: `${token}`,
                },
              }
            );
            const booking = response.data.result.data;
            setSingleBooking({
                name: booking.name || '',
                price: booking.price || '',
                description: booking.description || '',
                commissionFee: booking.commissionFee || '',
                landScapeImage: booking.landScapeImage
                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/landScapeImage/${booking.landScapeImage}`
                    : null,
                locationImage: booking.locationImage
                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/locationImage/${booking.locationImage}`
                    : null,
                hotelImages: booking.hotelImages ? booking.hotelImages.map((image: string) => `${process.env.NEXT_PUBLIC_API_BASE_URL}/hotelImages/${image}`) : [],
            });
          } catch (error) {
            console.error('Failed to load booking data.');
          }
        };
        if(id){
        fetchBookingData();
        }
      }, [id]);
    // Handle form submission
    const handleEditSubmit = async (values: any) => {
        console.log(values);

        try {
            const formData = new FormData();
            formData.append('_id', id);
            formData.append('name', values.name);
            formData.append('price', values.price);
            formData.append('commissionFee', values.commissionFee);
            formData.append('description', values.description);
              // Append image files if they are File objects
      if (values.landScapeImage && typeof values.landScapeImage !== 'string') {
        formData.append('landScapeImage', values.landScapeImage);
      }

      if (values.locationImage && typeof values.locationImage !== 'string') {
        formData.append('locationImage', values.locationImage);
      }

            formData.append('section', 'edit');
    // Append new hotel images (only File types)
    values.hotelImages.forEach((file: File | string) => {
        if (typeof file !== 'string') {
            formData.append('hotelImages', file);
        }
    });
            const token = localStorage.getItem('authToken');
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/update-booking`, formData, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200 && response.data.success) {
                toast.success(response.data.messages);
                router.push('/booking-list');
            } else {
                toast.error('Failed to update hotel details.');
            }
        } catch (error: any) {
            toast.error('An error occurred while updating hotel details.');
        }
    };
    if (!singleBooking) {
        return <div className='flex justify-center items-center h-[300px]'>Loading...</div>;
      }
    
    return (
        <div className="my-10">
            <div className="mx-auto w-3/4">
                <Formik initialValues={singleBooking} validationSchema={validationSchema} onSubmit={handleEditSubmit}>
                    {({ isSubmitting, isValid, setFieldValue, values }) => (
                        <Form className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Hotel Name Field */}
                            <div className="my-3">
                                <label htmlFor="name" className="mb-2 block font-semibold">
                                    Hotel Name:
                                </label>
                                <Field name="name" as={TextInput} value={values.name} className="w-full rounded border px-3 py-2" />
                                <ErrorMessage name="name" component="div" className="mt-2 text-sm text-red-500" />
                            </div>

                            {/* Price Field */}
                            <div className="my-3">
                                <label htmlFor="price" className="mb-2 block font-semibold">
                                    Price:
                                </label>
                                <Field name="price" type="number" as={TextInput} value={values.price} className="w-full rounded border px-3 py-2" min={0} />
                                <ErrorMessage name="price" component="div" className="mt-2 text-sm text-red-500" />
                            </div>

                            {/* Commission Fee Field */}
                            <div className="my-3">
                                <label htmlFor="commissionFee" className="mb-2 block font-semibold">
                                    Commission Fee:
                                </label>
                                <Field name="commissionFee" type="number" value={values.commissionFee} as={TextInput} className="w-full rounded border px-3 py-2" />
                                <ErrorMessage name="commissionFee" component="div" className="mt-2 text-sm text-red-500" />
                            </div>

                            {/* Description Field */}
                            <div className="col-span-1 my-3 md:col-span-2">
                                <label htmlFor="description" className="mb-2 block font-semibold">
                                    Description:
                                </label>
                                <Field name="description" as={Textarea} value={values.description} className="w-full rounded border px-3 py-2" />
                                <ErrorMessage name="description" component="div" className="mt-2 text-sm text-red-500" />
                            </div>

                            {/* Dropzone for Landscape Image */}
                            <div className="my-3">
                                <label htmlFor="landScapeImage" className="mb-2 block font-semibold">
                                    Landscape Image:
                                </label>
                                <DropzoneSingleField
                                    accept="image/*"
                                    onFileSelected={(file: File) => setFieldValue('landScapeImage', file)}
                                    previewSrc={
                                        values.landScapeImage && typeof values.landScapeImage !== 'string'
                                          ? URL.createObjectURL(values.landScapeImage)
                                          : values.landScapeImage || ''
                                      }
                                />
                                <ErrorMessage name="landScapeImage" component="div" className="mt-2 text-sm text-red-500" />
                            </div>

                            {/* Dropzone for Location Image */}
                            <div className="my-3">
                                <label htmlFor="locationImage" className="mb-2 block font-semibold">
                                    Location Image:
                                </label>
                                <DropzoneSingleField
                                    accept="image/*"
                                    onFileSelected={(file: File) => setFieldValue('locationImage', file)}
                                    previewSrc={
                                        values.locationImage && typeof values.locationImage !== 'string'
                                          ? URL.createObjectURL(values.locationImage)
                                          : values.locationImage || ''
                                      }
                                />
                                <ErrorMessage name="locationImage" component="div" className="mt-2 text-sm text-red-500" />
                            </div>

                            {/* Dropzone for Multiple Images */}
                            <div className="col-span-1 my-3 md:col-span-2">
    <label htmlFor="hotelImages" className="mb-2 block font-semibold">
        IMAGES:
    </label>
    <DropzoneMultipleField
        accept="image/*"
        previewFiles={values.hotelImages}
        onFilesSelected={(files: (File | string)[]) => {
            const combinedFiles = [...values.hotelImages, ...files].slice(0, 6);
            setFieldValue('hotelImages', combinedFiles);
        }}
        onRemoveFile={(index: number) => {
            const updatedFiles = values.hotelImages.filter((_, idx) => idx !== index);
            setFieldValue('hotelImages', updatedFiles);
        }}
        setFieldValue={setFieldValue}
    />
    <ErrorMessage name="hotelImages" component="div" className="mt-2 text-sm text-red-500" />
</div>

                            {/* Submit Button */}
                            <div className="col-span-1 my-5 flex justify-center md:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !isValid}
                                    className={`rounded px-4 py-2 ${isSubmitting || !isValid ? 'cursor-not-allowed bg-gray-400 hover:bg-gray-400' : ''} text-white`}
                                >
                                    Update Booking
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

// Single file dropzone component
const DropzoneSingleField = ({ onFileSelected, previewSrc, accept }: any) => {
    const { getRootProps, getInputProps } = useDropzone({
        accept,
        onDrop: (acceptedFiles) => onFileSelected(acceptedFiles[0]),
        multiple: false,
    });

    return (
        <div {...getRootProps({ className: 'w-[350px] h-full relative border-2 border-gray-300 border-dashed rounded-lg p-6 cursor-pointer' })}>
            <input {...getInputProps()} />
            <div className="text-center">
                {previewSrc ? (
                    <Image width={350} height={350} className="mx-auto w-40 max-h-40" src={previewSrc} alt="Preview" />
                ) : (
                    <>
                        <img className="mx-auto h-12 w-12" src="https://www.svgrepo.com/show/357902/image-upload.svg" alt="" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            <span>Drag and drop</span>
                            <span className="text-indigo-600"> or browse</span>
                            <span> to upload</span>
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                )}
            </div>
        </div>
    );
};

// Multiple files dropzone component

const DropzoneMultipleField = ({ onFilesSelected, previewFiles, setFieldValue, accept }: any) => {
    const { getRootProps, getInputProps } = useDropzone({
        accept,
        onDrop: (acceptedFiles) => {
            // Filter out duplicate files and remove string URLs
            const uniqueFiles = acceptedFiles.filter(
                (file) =>
                    !previewFiles.some(
                        (existingFile: File | string) =>
                            typeof existingFile === 'string' ? false : existingFile.name === file.name && existingFile.size === file.size
                    )
            );

            // Ensure no more than 6 images
            const newFiles = uniqueFiles.concat(previewFiles.filter((file: any) => typeof file === 'object')); // Keep only File objects

            if (newFiles.length > 6) {
                toast.error('You can only upload a maximum of 6 images.');
            } else {
                onFilesSelected(newFiles); // Pass the selected files
                setFieldValue('hotelImages', newFiles); // Update form state
            }
        },
    });

    // Handle removing an image
    const handleRemoveImage = (index: number) => {
        const updatedFiles = previewFiles.filter((_: any, i: any) => i !== index); // Remove image by index
        setFieldValue('hotelImages', updatedFiles); // Update the form state
    };

    // Handle clearing all images
    const handleClearAll = () => {
        setFieldValue('hotelImages', []); // Clear all images
        onFilesSelected([]); // Clear selected files
    };

    return (
        <div {...getRootProps({ className: 'relative border-2 border-gray-300 border-dashed rounded-lg p-6 cursor-pointer' })}>
            <input {...getInputProps()} />
            <div className="text-center">
                {previewFiles.length > 0 ? (
                    <>
                        <div className="flex gap-4 flex-wrap justify-center">
                            {previewFiles.map((file: any, index: any) => (
                                <div key={index} className="relative">
                                    {/* Render preview based on file type */}
                                    {typeof file === 'string' ? (
                                        // Display string URLs without remove button
                                        <img className="max-h-32 w-32 object-cover" src={file} alt={`Preview ${index}`} />
                                    ) : (
                                        // Display File objects with remove button
                                        <div className="relative">
                                            <Image
                                                width={350}
                                                height={350}
                                                className="max-h-32 w-32 object-cover"
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index}`}
                                            />

                                            {/* Remove Button for File objects */}
                                            <button
                                                type="button"
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                <IconX size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Show Clear All Button only if there are File objects */}
                        {previewFiles.some((file: File) => typeof file !== 'string') && (
                            <button
                                type="button"
                                className="mt-4 bg-red-500 text-white rounded p-2 hover:bg-red-600"
                                onClick={handleClearAll}
                            >
                                Clear All
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <img className="mx-auto h-12 w-12" src="https://www.svgrepo.com/show/357902/image-upload.svg" alt="" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            <span>Drag and drop</span>
                            <span className="text-indigo-600"> or browse</span>
                            <span> to upload images</span>
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                )}
            </div>
        </div>
    );
};


export default EditBookingForm;
