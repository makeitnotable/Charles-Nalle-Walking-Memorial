import React from 'react';
import PropTypes from 'prop-types';

const ArrowDown = ({ className = 'text-primary-12' }) => {
    return (
        <svg
            width="auto"
            height="100%"
            viewBox="0 0 20 20"
            className={className}
            fill="none"
        >
            <path
                d="M10 4L10 14M10 14L6 10M10 14L14 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

ArrowDown.propTypes = {
    className: PropTypes.string,
};

export default ArrowDown; 