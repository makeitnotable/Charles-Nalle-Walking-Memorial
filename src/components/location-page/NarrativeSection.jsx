import React from 'react';
import { Button } from '../Button';

export default function NarrativeSection({ data }) {
    return (
        <div className='space-y-4 p-4'>
            <div className='text-text-primary space-y-4'>
                <p className='text-primary-12 text-sm'>{data.narrative.title}</p>
                {data.narrative.content.map((paragraph, index) => (
                    <p className='text-primary-12 text-2xl font-[300] leading-relaxed' key={index}>
                        {index === 0 ? <span className='text-3xl font-medium'>{paragraph.substring(0, 2)}</span> : null}
                        {index === 0 ? paragraph.substring(2) : paragraph}
                    </p>
                ))}
            </div>

            <div className='flex flex-row justify-center items-center'>
                <Button variant='filled'>
                    {data.nextChapter}
                </Button>
            </div>
        </div>
    );
} 