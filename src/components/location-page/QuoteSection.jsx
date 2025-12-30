import ArrowDown from "../ArrowDown";
import { isMobile } from "react-device-detect";

export default function QuoteSection({ data }) {
  const backgroundImage = isMobile
    ? data.backgroundImage.vertical
    : data.backgroundImage.horizontal;

  return (
    <div className="h-screen relative">
      <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-screen h-full overflow-hidden">
        <img
          src={backgroundImage}
          alt={`${data.title.one} ${data.title.two} ${data.title.three}`}
          className="opacity-15 w-full h-full object-cover"
        />
      </div>
      <div className="relative h-full p-4 text-left">
        <div className="flex flex-col justify-center items-center h-full relative z-10">
          <div className="max-w-md flex flex-col items-center">
            <div className="h-[144px] bg-primary-12 w-[1px] mb-10" />
          </div>
          <div className="flex flex-col items-center md:w-[700px] p-0 gap-6">
            <div className="border-l-2 border-primary-10 pl-2">
              <h3 className="text-primary-12 font-martel-sans font-semibold text-[32px] leading-[40px] tracking-[0px]">{`"${data.quote.text}"`}</h3>
            </div>
            <div className="w-1/2 ml-2 flex items-center justify-center text-primary-11 leading-6 italic">
              {/* styled dash */}
              <div className="mr-2 w-[14px] h-[2px] bg-primary-11"></div>
              <div className="flex flex-col ">
                <p className="mt-1">
                  {data.quote.author1}
                  {data.quote.author2 && ","}
                </p>
                {data.quote.author2 && (
                  <p className="mt-0">{data.quote.author2}</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-12">
            <ArrowDown className="text-primary-12 w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
