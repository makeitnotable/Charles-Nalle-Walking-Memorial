import React from 'react';
import { PropTypes } from 'prop-types';

const Button = ({
    children,
    className = '',
    onClick
}) => {
    return (
        <button
            className={`bg-[#EFEDE9] hover:bg-amber-600 text-white font-bold py-5 px-4 rounded-lg w-full ${className}`}
            onClick={onClick}
        >
            <p className="text-[#7D776C] text-xl">{children}</p>
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired
};

Button.defaultProps = {
    className: ''
};

export default Button; 