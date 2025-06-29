import React from 'react';
import PropTypes from 'prop-types';

const Arrow = ({ length = 100, direction = 0, className = 'text-white', strokeWidth = 1, triangleSize = 10 }) => {
    // Calculate the end point based on length
    const endX = length;

    return (
        <svg
            width={length + triangleSize}
            height={triangleSize * 2}
            viewBox={`0 0 ${length + triangleSize} ${triangleSize * 2}`}
            style={{ transform: `rotate(${direction}deg)` }}
            className={className}
        >
            {/* Line part */}
            <line
                x1="0"
                y1={triangleSize}
                x2={endX}
                y2={triangleSize}
                stroke="currentColor"
                strokeWidth={strokeWidth}
            />

            {/* Triangle part */}
            <polygon
                points={`${endX},${triangleSize} ${endX - triangleSize},${triangleSize - triangleSize / 2} ${endX - triangleSize},${triangleSize + triangleSize / 2}`}
                fill="currentColor"
            />
        </svg>
    );
};

Arrow.propTypes = {
    length: PropTypes.number,
    direction: PropTypes.number,
    className: PropTypes.string,
    strokeWidth: PropTypes.number,
    triangleSize: PropTypes.number,
};

export default Arrow; 