import React from 'react';

const ImageSquare = ({ src, alt, size = 'w-32 h-32' }) => {
    return (
        <div>
            <div className={`flex items-center justify-center bg-gray-200 h-72 w-72 rounded-md`}>
                <h1>Placeholder</h1>
            </div>
            {/* <p>Image Credits</p> */}
        </div>
    );
};

export default ImageSquare;
