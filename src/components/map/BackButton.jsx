import React from 'react';

const BackButton = () => {
    return (
        <div className='fixed top-3 left-3 z-10'>
            <div className='bg-primary-3 border-2 border-primary-6 rounded-2xl h-[56px] w-[56px] flex items-center justify-center'>
                <div className='flex flex-col gap-2 w-full items-center'>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6 text-primary-10"
                    >
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default BackButton;
