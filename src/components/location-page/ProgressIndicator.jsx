export default function ProgressIndicator({ children, className, ref }) {
  return (
    <p ref={ref} className={`text-[0.75rem] md:text-[0.9375rem] lg:text-[1.125rem] leading-[1.125rem] md:leading-[1.875rem] lg:leading-[1.6875rem] font-[500] font-poppins ${className}`}>
      {children}
    </p>
  );
}
