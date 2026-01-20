import { aboutData } from "../../data/aboutData";
import MapBox from "../map/MapBox";
import { Button } from "../Button";
import { LOCATIONS } from "../map/constants";

const TourWorksSection = () => {
  return (
    <div className="flex flex-col gap-8 md:gap-12 space-y-8 md:space-y-12 pt-8 pb-0 md:py-4 lg:py-8 px-4">
      <div className="m-0">
        <p className="text-[#F6F3EE] uppercase text-[2.63rem] leading-[2.13rem] tracking-[-0.09rem] md:text-[3.28rem] md:leading-[2.66rem] md:tracking-[-0.12rem] lg:text-[3.94rem] lg:leading-[3.19rem] lg:tracking-[-0.14rem] font-semibold font-['Martel_Sans']">
          How the
          <br />
          tour works
        </p>
      </div>
      <div className="flex flex-col items-center">
        <MapBox
          initialLocationName={LOCATIONS[0].name}
          width="100%"
          className="rounded-3xl overflow-hidden border-1 border-primary-6 mx-auto max-w-lg sm:max-h-xs"
          interactive={false}
          showButtons={false}
          useResponsiveHeight={true}
        />
      </div>
      <div className="space-y-5 -ml-3 md:flex md:flex-wrap md:gap-6 md:space-y-0 md:ml-0 lg:flex-nowrap mb-0">
        {aboutData.tourworks.numberedSection.points.map((point, index) => (
          <div
            key={index}
            className="flex flex-col m-4 mb-4 md:w-[48%] md:m-0 lg:flex-1 lg:w-auto"
          >
            <div className="flex flex-row items-start space-x-3 mb-4">
              <div className="h-5 w-5 rounded-full bg-primary-10 weight-500 flex-shrink-0 flex items-center justify-center">
                <p className="h-full text-primary-12 text-[10px] font-medium leading-none mt-3">
                  {index + 1}
                </p>
              </div>
              <p className="text-primary-12 text-[18px] font-[300] leading-relaxed">
                {point.title}
              </p>
            </div>
            {point.bullets && (
              <ul className="list-disc pl-6 space-y-1">
                {point.bullets.map((bullet, bulletIndex) => (
                  <li
                    key={bulletIndex}
                    className="text-primary-12 text-[16px] ml-6 font-[300] leading-relaxed"
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <div className="flex w-full flex-row justify-center items-center mb-8 md:mb-0 md:mt-8 md:my-0">
        <Button variant="outline">Get Directions</Button>
      </div>
    </div>
  );
};

export default TourWorksSection;
