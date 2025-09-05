import { memo } from 'react';
import ArrowSvg from '../assets/arrow2.svg';

const Arrow = memo(({ width, height, direction = 0, className = 'text-white' }) => {
    return (
        <img
            src={ArrowSvg}
            alt="Arrow"
            width={width}
            height={height}
            style={{ 
              transform: `rotate(${direction}deg)`,
              willChange: 'auto',
              backfaceVisibility: 'hidden',
            }}
            className={className}
        />
    );
});

Arrow.displayName = 'Arrow';



export default Arrow; 