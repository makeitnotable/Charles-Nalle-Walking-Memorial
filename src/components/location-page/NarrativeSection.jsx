import { Button } from '../Button';

export default function NarrativeSection({ data, goToNextChapter }) {
    return (
        <div className='space-y-4 p-4'>
            <div className='text-text-primary space-y-4'>
                <p className='text-primary-12 text-xs font-[500] font-poppins mt-8 mb-8'>{data.narrative.title}</p>
                {data.narrative.content.map((paragraph, index) => (
                    <p className='m-5 text-primary-12 text-[18px] font-[300] leading-[1.6]' key={index}>
                        {index === 0 ? <span className='text-[32px] leading-[1.6] font-medium'>{paragraph.substring(0, 2)}</span> : null}
                        {index === 0 ? paragraph.substring(2) : paragraph}
                    </p>
                ))}
            </div>

            <div className='flex flex-row justify-center items-center gap-5 pt-8 p-8 m-8'>
                {/* Use goToNextChapter if it exists */}
                {data.nextChapterPath && (
                    <Button variant='filled' onClick={goToNextChapter}>
                        <span className="text-lg font-medium font-['Poppins'] leading-normal">
                            {data.nextChapter}
                        </span>
                    </Button>
                )}
            </div>
        </div>
    );
}