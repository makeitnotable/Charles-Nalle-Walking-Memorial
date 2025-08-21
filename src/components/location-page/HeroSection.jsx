import ArrowDown from '../ArrowDown';

export default function HeroSection({ data }) {
    return (
        <div className="h-screen flex flex-col">
            <div className="flex-none space-y-4">
                <div className="pt-2 px-6 ">
                    <div className="flex flex-row justify-between items-center">
                        <p className="font-poppins text-[12px] font-normal leading-[15px] text-[#ff9770]">CHAPTER</p>
                        <div className="h-5 w-5 rounded-full bg-primary-10 flex items-center justify-center">
                            <p className='text-[10px] font-medium font-poppins text-primary-12 leading-none mt-0.5'>{data.chapterNumber}</p>
                        </div>
                    </div>
                    <div className='flex items-start mt-6'>
                        <h1 className="font-['Martel_Sans'] text-[42px] font-semibold leading-[34px] tracking-[-1.5px] text-[#F6F3EE]">{data.title}</h1>
                        <div className="flex-col mr-2 justify-self-center h-full">
                            <ArrowDown 
                                className="text-primary-12 h-full w-6 ml-1"
                            />
                    </div>
                    </div>
                </div>
            </div>
            <img
                src={data.backgroundImage.vertical}
                alt={data.title}
                className="mt-5 w-full flex-1 bg-neutral-1 rounded-t-3xl border-[rgba(105,49,29,1)] border-t  object-cover object-center"
            />
        </div>
    );
} 