import React from 'react';
import { Button } from '../Button';

export default function MoralMessageSection({ data, handleNavigate }) {
    return (
        <div className="h-full">
            <div className="relative h-full">
                <div className="absolute inset-0 z-0" style={{
                    backgroundImage: `linear-gradient(rgba(16, 10, 6, 0.9), rgba(16, 10, 6, 0.9)), url('${data.moralMessage.backgroundImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }} />
                <div className='p-4 text-text-primary space-y-6 relative z-10'>
                    <p className='text-primary-12 text-5xl'>{data.moralMessage.title}</p>
                    <div className='flex justify-end w-full'>
                        <div className="w-3/4 h-72 rounded-3xl border-2 border-primary-6" style={{
                            backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${data.moralMessage.backgroundImage}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }} />
                    </div>
                    <p className=' text-primary-12'>{data.moralMessage.number}</p>
                    <p className=' text-primary-12 text-lg leading-relaxed'>{data.moralMessage.message}</p>

                    <div className='space-y-4'>
                        <p className='text-primary-11 text-2xl'>{data.moralMessage.callToAction.title}</p>
                        <p className=' text-primary-12 text-lg leading-relaxed'>{data.moralMessage.callToAction.content}</p>
                    </div>
                    <div className='flex flex-row justify-center items-center mt-20 mb-20 gap-5'>
                        <Button onClick={() => handleNavigate('/')} variant='outline'>
                            <div className='flex items-center gap-2'>
                                <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.25 13.667L1.25 7.66699L7.25 1.66699" stroke="#FF9770" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>

                                <p>
                                    Back
                                </p>
                            </div>
                        </Button>
                        <Button variant='filled'>
                            <div className='flex items-center gap-2'>
                                <p>
                                    Next
                                </p>
                                <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.5 13.667L7.5 7.66699L1.5 1.66699" stroke="#FF9770" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 