export default function NarrativeSection({ data }) {
    let firstTextParagraph = true;

    return (
        <div className='space-y-4'>
            <div className='text-text-primary space-y-4'>
                <p className='text-primary-12 text-xs md:text-[14px] font-[500] font-poppins mb-8'>{data.narrative.title}</p>
                {data.narrative.content.map((item, index) => {
                    // Handle image references
                    if (item.startsWith('backgroundImage.')) {
                        const imagePath = data.backgroundImage?.[item.split('.')[1]];
                        return imagePath ? (
                            <div key={index} className='flex justify-center my-8'>
                                <img
                                    src={`/${imagePath}`}
                                    alt="Narrative illustration"
                                    className='w-auto h-auto rounded-3xl border-1 border-primary-6 max-w-full'
                                />
                            </div>
                        ) : null;
                    }

                    // Handle text paragraphs
                    const isFirst = firstTextParagraph;
                    firstTextParagraph = false;

                    return (
                        <p key={index} className='m-5 text-primary-12 text-[18px] font-[300] leading-[1.6]'>
                            {isFirst ? (
                                <>
                                    <span className='text-[32px] leading-[1.6] font-medium'>{item.split(' ')[0]}</span>
                                    {item.substring(item.indexOf(' '))}
                                </>
                            ) : item}
                        </p>
                    );
                })}
            </div>

        </div>
    );
}