import clsx from "clsx";
import ProgressIndicator from "./ProgressIndicator";

function NarrativeMedia({ mediaPath }) {
    if (!mediaPath) return null;

    const isVideo = mediaPath.endsWith('.mp4');

    const isSkinnyBarbershopImage = mediaPath == 'CNWM - Animated Images/5. Barbershop/5.2 Peter Baltimores Barbershop_animation_narrative_2.mp4'
    console.log('a', isSkinnyBarbershopImage)

    return (
      <div className={clsx('flex justify-center mx-auto', {
        'w-[19.437rem] h-[12.96rem] md:w-[16.75rem] md:h-[11.167rem] lg:w-[28.5rem] lg:h-[19rem]': !isSkinnyBarbershopImage,
        'w-[19.4375rem] h-[29.156rem] md:w-[13.75rem] md:h-[20.625rem] lg:w-[28.5rem] lg:h-[42.75rem]': isSkinnyBarbershopImage,
      })}>
            {isVideo ? (
                <video
                    src={`/${mediaPath}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className='w-auto h-auto rounded-3xl border-1 border-primary-6 max-w-full object-cover'
                />
            ) : (
                <img
                    src={`/${mediaPath}`}
                    alt="Narrative illustration"
                    className='w-auto h-auto rounded-3xl border-1 border-primary-6 max-w-full object-cover'
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
                    <span className='text-[32px] inline-block -mt-2 -mb-2 font-medium'>{item.split(' ')[0]}</span>
                    {item.substring(item.indexOf(' '))}
                </>
            ) : item}
        </p>
    );
}

function isBackgroundImageItem(item) {
    return item.startsWith('backgroundImage.');
}

export default function NarrativeSection({ data, contentItems = null, showTitle = true, showDropCap = true }) {
    const content = contentItems || data.narrative.content;

    // Find index of the first text paragraph (not a backgroundImage item)
    const firstTextIndex = content.findIndex(
        item => !isBackgroundImageItem(item)
    );

    return (
        <div>
            <div className='text-text-primary flex flex-col gap-y-8 lg:gap-y-12'>
                {showTitle && <ProgressIndicator className="text-primary-12 px-4 py-4 mb-0">{data.narrative.title}</ProgressIndicator>}
                <div className='flex flex-col gap-y-4 md:gap-y-8 lg:gap-y-12'>
                    {content.map((item, index) => {
                        if (isBackgroundImageItem(item)) {
                            const mediaPath = data.backgroundImage?.[item.split('.')[1]];
                            return <NarrativeMedia key={index} mediaPath={mediaPath} />;
                        }

                        // Only the very first text paragraph (by content order) gets special styling
                        const isFirstTextParagraph = showDropCap && index === firstTextIndex;
                        return <NarrativeParagraph key={index} item={item} isFirst={isFirstTextParagraph} />;
                    })}
                </div>
            </div>
        </div>
    );
}
