import clsx from "clsx";

export function ChevronRight({
    width = 8,
    height = 14,
    fill = "none",
    className = "",
    ...props
}) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 8 14"
            fill={fill}
            xmlns="http://www.w3.org/2000/svg"
            className={clsx(className)}
            {...props}
        >
            <path
                d="M1 13L7 7L1 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}