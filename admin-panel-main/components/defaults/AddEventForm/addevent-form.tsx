'use client';
import { Button, TextInput, Textarea } from '@mantine/core';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

// Define the validation schema using Yup
const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    deskView: Yup.mixed().required('Desktop Image is required'),
    mobileView: Yup.mixed().required('Mobile Image is required')
});

const AddEventForm = () => {
    const router = useRouter();

    // Initialize form values
    const initialValues = {
        title: '',
        description: '',
        deskView: null,
        mobileView: null
    };

    // Handle form submission
    const handleEditSubmit = async (values: any) => {
        console.log(values);

        try {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('deskView', values.deskView);
            formData.append('mobileView', values.mobileView);

            console.log('Formdata', formData);
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/events`, formData, {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200 && response.data.success) {
                toast.success(response.data.message);
                router.push('/event-list');
            } else {
                toast.error('Failed to add event details.');
            }
        } catch (error: any) {
            toast.error('An error occurred while adding event details.');
        }
    };

    return (
        <div className="my-10">
            <div className="mx-auto w-3/4">
                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleEditSubmit}>
                    {({ isSubmitting, isValid, setFieldValue, values }) => (
                        <Form className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Title Field */}
                            <div className="my-3">
                                <label htmlFor="title" className="mb-2 block font-semibold">
                                    Title:
                                </label>
                                <Field name="title" as={TextInput} className="w-full rounded border px-3 py-2" />
                                <ErrorMessage name="title" component="div" className="mt-2 text-sm text-red-500" />
                            </div>

                            {/* Description Field */}
                            <div className="col-span-1 my-3 md:col-span-2">
                                <label htmlFor="description" className="mb-2 block font-semibold">
                                    Description:
                                </label>
                                <Field name="description" as={Textarea} className="w-full rounded border px-3 py-2" />
                                <ErrorMessage name="description" component="div" className="mt-2 text-sm text-red-500" />
                            </div>

                            {/* Dropzone for Desktop Image */}
                            <div className="my-3">
                                <label htmlFor="deskView" className="mb-2 block font-semibold">
                                    Desktop Image:
                                </label>
                                <DropzoneSingleField
                                    accept="image/*"
                                    onFileSelected={(file: File) => setFieldValue('deskView', file)}
                                    previewSrc={values.deskView && URL.createObjectURL(values.deskView)}
                                />
                                <ErrorMessage name="deskView" component="div" className="mt-2 text-sm text-red-500" />
                            </div>

                            {/* Dropzone for Mobile Image */}
                            <div className="my-3">
                                <label htmlFor="mobileView" className="mb-2 block font-semibold">
                                    Mobile Image:
                                </label>
                                <DropzoneSingleField
                                    accept="image/*"
                                    onFileSelected={(file: File) => setFieldValue('mobileView', file)}
                                    previewSrc={values.mobileView && URL.createObjectURL(values.mobileView)}
                                />
                                <ErrorMessage name="mobileView" component="div" className="mt-2 text-sm text-red-500" />
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

// Single file dropzone component
const DropzoneSingleField = ({ onFileSelected, previewSrc, accept }: any) => {
    const { getRootProps, getInputProps } = useDropzone({
        accept,
        onDrop: (acceptedFiles) => onFileSelected(acceptedFiles[0]),
        multiple: false,
    });

    return (
        <div {...getRootProps({ className: 'w-[350px] relative border-2 border-gray-300 border-dashed rounded-lg p-6 cursor-pointer' })}>
            <input {...getInputProps()} />
            <div className="text-center">
                {previewSrc ? (
                    <Image width={350} height={350} className="mx-auto max-h-40" src={previewSrc} alt="Preview" />
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

export default AddEventForm;
