import React from 'react';

export const Button = ({
    children,
    className = '',
    onClick,
    variant = 'filled',
    state = 'default'
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'ghost':
                return 'text-primary-11';
            case 'outline':
                return 'border border-2 border-primary-8 text-primary-11';
            case 'filled':
                return 'bg-primary-4 text-primary-11 hover:bg-primary-5 border-2 border-primary-6';
            case 'filled-secondary':
                return 'bg-[#FFC6B3] text-[#BD3900] border-2 border-[#F7A98F]';
            default:
                return 'text-primary-11';
        }
    };

    return (
        <button
            className={`py-4 px-10 rounded-full cursor-pointer ${getVariantClasses()} ${className}`}
            onClick={onClick}
        >
            <p className="text-xl">{children}</p>
        </button>
    );
};
