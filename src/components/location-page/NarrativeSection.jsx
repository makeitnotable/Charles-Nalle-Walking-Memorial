import ProgressIndicator from "./ProgressIndicator";

function NarrativeMedia({ mediaPath }) {
    if (!mediaPath) return null;

    const isVideo = mediaPath.endsWith('.mp4');

    return (
        <div className='flex justify-center mx-5'>
            {isVideo ? (
                <video
                    src={`/${mediaPath}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className='w-auto h-auto rounded-3xl border-1 border-primary-6 max-w-full'
                />
            ) : (
                <img
                    src={`/${mediaPath}`}
                    alt="Narrative illustration"
                    className='w-auto h-auto rounded-3xl border-1 border-primary-6 max-w-full'
                />
            )}
        </div>
    );
}

function NarrativeParagraph({ item, isFirst }) {
    return (
        <p
            className={`mx-5 text-primary-12 text-[18px] font-[300] leading-[1.6] mb-0`}
        >
            {isFirst ? (
                <>
                    <span className='text-[32px] inline-block -mb-2 font-medium'>{item.split(' ')[0]}</span>
                    {item.substring(item.indexOf(' '))}
                </>
            ) : item}
        </p>
    );
}

function isBackgroundImageItem(item) {
    return item.startsWith('backgroundImage.');
}

export default function NarrativeSection({ data, contentItems = null, showTitle = true }) {
    const content = contentItems || data.narrative.content;

    // Find index of the first text paragraph (not a backgroundImage item)
    const firstTextIndex = content.findIndex(
        item => !isBackgroundImageItem(item)
    );

    return (
        <div>
            <div className='text-text-primary'>
                {showTitle && <ProgressIndicator className="text-primary-12 mb-0">{data.narrative.title}</ProgressIndicator>}
                <div className='flex flex-col gap-y-4 md:gap-y-8 lg:gap-y-12'>
                    {content.map((item, index) => {
                        if (isBackgroundImageItem(item)) {
                            const mediaPath = data.backgroundImage?.[item.split('.')[1]];
                            return <NarrativeMedia key={index} mediaPath={mediaPath} />;
                        }

                        // Only the very first text paragraph (by content order) gets special styling
                        const isFirstTextParagraph = index === firstTextIndex;
                        return <NarrativeParagraph key={index} item={item} isFirst={isFirstTextParagraph} />;
                    })}
                </div>
            </div>
        </div>
    );
}