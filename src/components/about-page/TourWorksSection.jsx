import { aboutData } from "../../data/aboutData";
import MapBox from "../map/MapBox";
import { Button } from "../Button";
import { LOCATIONS } from "../map/constants";

const TourWorksSection = () => {
  const points = aboutData.tourworks.numberedSection.points;
  const columns = [points.slice(0, 2), points.slice(2)];

  return (
    <section className="flex flex-col gap-8 md:gap-8 lg:gap-12 pt-8 pb-0 md:py-4 lg:py-8 px-4 md:px-10 lg:px-20">
      <div className="m-0">
        <p className="text-[#F6F3EE] uppercase text-[42px] leading-[34px] tracking-[-1.5px] md:text-[52.5px] md:leading-[42.5px] md:tracking-[-1.875px] lg:text-[63px] lg:leading-[51px] lg:tracking-[-2.25px] font-semibold font-['Martel_Sans']">
          How the
          <br />
          tour works
        </p>
        <p className="block md:hidden my-4 text-[#F6F3EE] text-start ml-1 text-[0.75rem] md:text-[0.94rem] lg:text-[1.125rem] font-medium font-['Poppins']">
          Instructions
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 md:gap-0 items-center">
        <div className="order-2 md:order-1 w-full flex justify-center lg:justify-start">
          <MapBox
            initialLocationName={LOCATIONS[0].name}
            className="rounded-[12px] overflow-hidden border border-primary-6 shadow-[0px_4px_5px_rgba(0,0,0,0.2),0px_7px_10px_rgba(0,0,0,0.14),0px_2px_16px_rgba(0,0,0,0.12)] !w-[21.4375rem] !h-[14.291rem] md:!w-[24.1175rem] md:!h-[16.078rem] lg:!w-[34rem] lg:!h-[34.69rem]"
            interactive={false}
            showButtons={false}
          />
        </div>
        <div className="order-1 md:order-2 w-full lg:max-w-[528px]">
          <p className="hidden md:block md:mt-12 md:mb-12 lg:mt-0 lg:mb-12 text-[#F6F3EE] text-start text-[0.75rem] md:text-[0.94rem] lg:text-[1.125rem] font-medium font-['Poppins']">
            Instructions
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:gap-6 lg:flex-col">
            {columns.map((columnPoints, columnIndex) => (
              <div
                key={`column-${columnIndex}`}
                className="flex flex-col gap-4 md:gap-6 flex-1"
              >
                {columnPoints.map((point, index) => (
                  <div key={point.title} className="flex flex-col gap-2">
                    <div className="flex flex-row items-start gap-2">
                      <div className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 rounded-full bg-primary-10 flex-shrink-0 flex items-center justify-center text-center">
                        <span className="text-primary-12 text-[10px] md:text-[12.5px] lg:text-[15px] font-medium leading-none h-full w-full mt-1.5 md:mt-2.5">
                          {columnIndex === 0 ? index + 1 : index + 3}
                        </span>
                      </div>
                      <p className="text-primary-12 text-[18px] font-[400] leading-[27px]">
                        {point.title}
                      </p>
                    </div>
                    {point.bullets && (
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        {point.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="text-primary-12 text-[14px] leading-[21px]"
                          >
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-row justify-center items-center my-8 md:mb-0 md:mt-8">
        <Button variant="outline">
          Get Directions
        </Button>
      </div>
    </section>
  );
};

export default TourWorksSection;
