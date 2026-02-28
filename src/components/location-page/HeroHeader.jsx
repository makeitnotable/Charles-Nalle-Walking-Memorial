import { ArrowWithDynamicShaft } from "../ArrowWithDynamicShaft";

export const HeroHeader = ({ chapterNumber, title }) => {
  return (
    <div className="px-8 space-y-6 py-6" id="header">
      <div className="flex flex-row justify-between items-center">
        <p className="font-poppins text-[.75rem] md:text-[0.9375rem] lg:text-[1.125rem] font-normal leading-[15px] md:leading-[18.75px] lg:leading-[22.5px] text-[#ff9770]">
          CHAPTER
        </p>
        <div className="w-[1rem] h-[1rem] md:w-[1.25rem] md:h-[1.25rem] lg:w-[1.5rem] lg:h-[1.5rem] rounded-full bg-primary-10 flex items-center justify-center">
          <p className="text-[.625rem] md:text-[0.78125rem] lg:text-[.9375rem] font-medium font-poppins text-primary-12 leading-none mt-0.5">
            {chapterNumber}
          </p>
        </div>
      </div>
      <div className="flex items-start justify-between -ml-1">
        <h1 className="font-['Martel_Sans'] text-[2.625rem] leading-[2.125rem] md:text-[3.28125rem] md:leading-[2.65625rem] lg:text-[3.9375rem] lg:leading-[3.1875rem] font-semibold tracking-[-1.5px] text-[#F6F3EE]">
          {title}
        </h1>
        <div className="flex-col justify-evenly items-end mr-1 h-full">
          <ArrowWithDynamicShaft className="text-primary-12 h-fit ml-1" />
        </div>
      </div>
    </div>
  );
}
