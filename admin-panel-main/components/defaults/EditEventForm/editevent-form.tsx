import React, { useEffect, useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Define form values type
interface FormValues {
  title: string;
  description: string;
  deskView: File | string | null;
  mobileView: File | string | null;
}

// Validation schema
const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  deskView: Yup.mixed().required('Desktop Image is required'),
  mobileView: Yup.mixed().required('Mobile Image is required'),
});

const EditEventForm: React.FC<{ id: any }> = ({ id }) => {
  const router = useRouter();
  const [singleEvent, setSingleEvent] = useState<FormValues | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/single-event/${id}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        const event = response.data.result;
        setSingleEvent({
          title: event.title || '',
          description: event.description || '',
          deskView: event.deskView
            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${event.deskView}`
            : null,
          mobileView: event.mobileView
            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${event.mobileView}`
            : null,
        });
      } catch (error) {
        console.error('Failed to load event data.');
      }
    };

    fetchEventData();
  }, [id]);

  const handleEditSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('title', values.title);
      formData.append('description', values.description);

      // Append image files if they are File objects
      if (values.deskView && typeof values.deskView !== 'string') {
        formData.append('deskView', values.deskView);
      }

      if (values.mobileView && typeof values.mobileView !== 'string') {
        formData.append('mobileView', values.mobileView);
      }

      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/events`,
        formData,
        {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        toast.success(response.data.message);
        router.push('/event-list');
      } else {
        toast.error('Failed to update event details.');
      }
    } catch (error) {
      toast.error('An error occurred while updating event details.');
    }
  };

  if (!singleEvent) {
    return <div className='flex justify-center items-center h-[300px]'>Loading...</div>;
  }

  return (
    <Formik
      initialValues={singleEvent}
      enableReinitialize={true}
      validationSchema={validationSchema}
      onSubmit={handleEditSubmit}
    >
      {({ setFieldValue, values }) => (
        <Form className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Title Field */}
          <div className="my-3">
            <label htmlFor="title" className="mb-2 block font-semibold">
              Title:
            </label>
            <input
              type="text"
              name="title"
              className="w-full p-2 border border-gray-300 rounded"
              value={values.title}
              onChange={(e) => setFieldValue('title', e.target.value)}
            />
            <ErrorMessage
              name="title"
              component="div"
              className="mt-2 text-sm text-red-500"
            />
          </div>

          {/* Description Field */}
          <div className="col-span-1 my-3 md:col-span-2">
            <label htmlFor="description" className="mb-2 block font-semibold">
              Description:
            </label>
            <textarea
              name="description"
              className="w-full p-2 border border-gray-300 rounded"
              value={values.description}
              onChange={(e) => setFieldValue('description', e.target.value)}
            />
            <ErrorMessage
              name="description"
              component="div"
              className="mt-2 text-sm text-red-500"
            />
          </div>

          {/* Dropzone for Desktop Image */}
          <div className="my-3">
            <label htmlFor="deskView" className="mb-2 block font-semibold">
              Desktop Image:
            </label>
            <DropzoneSingleField
              accept="image/*"
              onFileSelected={(file: File) => setFieldValue('deskView', file)}
              previewSrc={
                values.deskView && typeof values.deskView !== 'string'
                  ? URL.createObjectURL(values.deskView)
                  : values.deskView || ''
              }
            />
            <ErrorMessage
              name="deskView"
              component="div"
              className="mt-2 text-sm text-red-500"
            />
          </div>

          {/* Dropzone for Mobile Image */}
          <div className="my-3">
            <label htmlFor="mobileView" className="mb-2 block font-semibold">
              Mobile Image:
            </label>
            <DropzoneSingleField
              accept="image/*"
              onFileSelected={(file: File) => setFieldValue('mobileView', file)}
              previewSrc={
                values.mobileView && typeof values.mobileView !== 'string'
                  ? URL.createObjectURL(values.mobileView)
                  : values.mobileView || ''
              }
            />
            <ErrorMessage
              name="mobileView"
              component="div"
              className="mt-2 text-sm text-red-500"
            />
          </div>

          {/* Submit Button */}
          <div className="col-span-1 my-5 flex justify-center md:col-span-2">
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update Event
            </button>
          </div>
        </Form>
      )}
    </Formik>
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

export default EditEventForm;
