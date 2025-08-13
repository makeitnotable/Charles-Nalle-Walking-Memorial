export default function HistoricalContextSection({ data }) {
  return (
    <div className='space-y-8 p-4'>
      <div className='space-y-4'>
        <p className=" text-[#F6F3EE] uppercase text-5xl font-semibold font-['Martel_Sans']">{data.historicalContext.title}</p>
        <p className="text-[#F6F3EE] text-start ml-1 text-xs font-medium font-['Poppins']">{data.historicalContext.number}</p>
      </div>
      <div
        className='w-auto h-65 rounded-2xl mb-12 border-2 border-primary-6'
        style={{
          backgroundImage: `linear-gradient(rgba(16, 10, 6, 0), rgba(16, 10, 6, 0)), url('${data.backgroundImage.historical}')`,
          backgroundSize: "cover",
          backgroundPosition: "top",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className='space-y-5'>
        {data.historicalContext.points.map((point, index) => (
          <div key={index} className='flex flex-row items-start m-4 space-x-2 mb-4'>
            <div className='h-4 w-4 rounded-full bg-primary-10 flex-shrink-0 flex items-center justify-center'>
              <p className=' text-primary-12 text-[8px]'>{index + 1}</p>
            </div>
            <p className='text-primary-12 text-[18px] font-[300] leading-relaxed'>{point}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
