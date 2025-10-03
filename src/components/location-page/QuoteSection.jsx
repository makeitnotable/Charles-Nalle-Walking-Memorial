import ArrowDown from '../ArrowDown';

export default function QuoteSection({ data }) {
    return (
        <div className="h-screen">
            <div className="relative h-full p-4 text-left">
                <div className="flex flex-col justify-center items-center h-full relative z-10">
                    <div className="max-w-md flex flex-col items-center">
                        <div className="h-[100px] bg-primary-12 w-[1px] mb-10" /></div>
                    <div className="flex flex-col items-center w-[319px] p-0 gap-6">
                        <div className="border-l-2 border-primary-10 pl-2">
                            <h3 className="text-primary-12 font-martel-sans font-semibold text-[32px] leading-[40px] tracking-[0px]">{`"${data.quote.text}"`}</h3>
                        </div>
                        <div className="w-full ml-2">
                            <div className="flex items-start text-primary-11 leading-[1] italic">
                                <div className="mr-2 my-3 w-[10px] h-[2px] bg-primary-11"></div>
                                <div className="flex flex-col">
                                    <p className="mb-2">{data.quote.author1}</p>
                                    <p className="mt-0">{data.quote.author2}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12">
                        <ArrowDown
                            className="text-primary-12 w-full h-'auto'"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 