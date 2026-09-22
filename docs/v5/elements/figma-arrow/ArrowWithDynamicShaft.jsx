// svg code from: "../assets/downarrow.svg";

export const ArrowWithDynamicShaft = ({ className = "", opacity = 0.87 }) => {
  return (
    <div
      className={`inline-flex h-full min-h-0 flex-col items-center ${className}`.trim()}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        width="2"
        className="block flex-1 min-h-0"
        viewBox="0 0 2 1"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0.4 0H1.6V1H0.4V0Z" fill="currentColor" />
      </svg>

      <svg
        width="13"
        height="9"
        className="block shrink-0"
        viewBox="0 87 13 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.769365 87.191C0.570806 87.4017 0.549833 87.6395 0.706451 87.9045L5.51518 95.4491C5.75034 95.8164 6.07861 96 6.49998 96C6.92134 96 7.24961 95.8164 7.48478 95.4491L12.2935 87.9045C12.4501 87.6395 12.4291 87.4017 12.2306 87.191C12.032 86.9803 11.7909 86.9439 11.5073 87.0819L7.2273 89.4624L5.77265 89.4624L1.49269 87.0819C1.20903 86.9439 0.967926 86.9803 0.769365 87.191Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};
