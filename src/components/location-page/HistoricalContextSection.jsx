import React from "react";

export default function HistoricalContextSection({ data }) {
  return (
    <div className='space-y-15 p-4'>
      <div className='space-y-4'>
        <p className=" text-[#F6F3EE] uppercase text-5xl font-semibold font-['Martel_Sans']">{data.historicalContext.title}</p>
        <p className="text-[#F6F3EE] text-xs font-medium font-['Poppins']">{data.historicalContext.number}</p>
      </div>
      <div
        className='w-full h-72 rounded-3xl border-2 border-primary-6'
        style={{
          backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${data.historicalContext.backgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className='space-y-5'>
        {data.historicalContext.points.map((point, index) => (
          <div key={index} className='flex flex-row items-start space-x-2 mb-4'>
            <div className='h-4 w-4 rounded-full bg-primary-10 flex-shrink-0 flex items-center justify-center'>
              <p className='mt-0.5 text-primary-12 text-[10px]'>{index + 1}</p>
            </div>
            <p className='text-primary-12 text-[18px] font-[300] leading-relaxed'>{point}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
