import clsx from "clsx";
import ProgressIndicator from "./ProgressIndicator";

function NarrativeParagraph({ item, isFirst, className }) {
  return (
    <p
      className={clsx(
        "mx-5 text-primary-12 text-[18px] font-[300] leading-[1.6] mb-0",
        className,
      )}
    >
      {isFirst ? (
        <span>
          <span className="text-[32px] inline-block -mt-2 -mb-2 font-medium">
            {item.split(" ")[0]}
          </span>
          {item.substring(item.indexOf(" "))}
        </span>
      ) : (
        item
      )}
    </p>
  );
}

export default function NarrativeSectionOneThroughThree({
  data,
  contentItems = null,
  showTitle = true,
  showDropCap = true,
}) {
  const content = contentItems || data.narrative.content;

  // Split content into two columns
  const midpoint = Math.ceil(content.length / 2);
  const column1Content = content.slice(0, midpoint);
  const column2Content = content.slice(midpoint);

  return (
    <div>
      <div className="text-text-primary flex flex-col md:grid md:grid-cols-2 md:grid-rows-2 gap-x-8 gap-y-8 lg:gap-y-12">
        {showTitle && (
          <ProgressIndicator className="text-primary-12 px-4 pl-0 py-4 mb-0 col-span-2 row-span-2">
            {data.narrative.title}
          </ProgressIndicator>
        )}
        {/* Column 1 */}
        <div className="flex flex-col gap-y-8 lg:gap-y-12">
          {column1Content.map((item, index) => {
            const isFirstTextParagraph = showDropCap && index === 0;
            return (
              <NarrativeParagraph
                key={index}
                item={item}
                isFirst={isFirstTextParagraph}
              />
            );
          })}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-y-8 lg:gap-y-12">
          {column2Content.map((item, index) => (
            <NarrativeParagraph
              key={index + midpoint}
              item={item}
              isFirst={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
