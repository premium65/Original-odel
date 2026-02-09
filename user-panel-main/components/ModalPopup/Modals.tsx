import React from 'react'
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Spinner
  } from "@nextui-org/react";
import { useRouter } from 'next/navigation';

export const NoticeModal = () => {
    const router = useRouter();
  return (
    <>
                      {/* Notice */}
                      <ModalContent>
                      <>
                        <ModalHeader className="flex border-2 pb-2 flex-col gap-1 text-black">
                        Notice
                        </ModalHeader>
                        <ModalBody>
                          <div className="border-b-2 pb-2 text-black">
                            <p className="text-base">
                            Your account have completed all reviews, please contact customer service to reset your account
                            </p>
                          </div>
                        </ModalBody>
                        <ModalFooter classname="w-full mx-auto">
                          <Button
                            className="w-full bg-orange-500 text-white mx-auto"
                            onPress={() => {router.push('/customer-service')}}
                          >
                           Customer Service
                          </Button>
                        </ModalFooter>
                      </>
                  </ModalContent>
                  </>
  )
}
export const CongratsModal = () => {
    const router = useRouter();
  return (
    <>
                   {/* Congratulations */}
                   <ModalContent>
                      <>
                        <ModalHeader className="flex border-2 pb-2 flex-col gap-1 text-black">
                        Congratulations!
                        </ModalHeader>
                        <ModalBody>
                          <div className="border-b-2 pb-2 text-black">
                            <p className="text-base">
                            Congratulations! You have received a Gold Suite, Please contact customer service.
                            </p>
                          </div>
                        </ModalBody>
                        <ModalFooter classname="w-full mx-auto">
                          <Button
                            className="w-full bg-orange-500 text-white mx-auto"
                            onPress={() => {router.push('/customer-service')}}
                          >
                           Customer Service
                          </Button>
                        </ModalFooter>
                      </>
                  </ModalContent>
                  </>
  )
}