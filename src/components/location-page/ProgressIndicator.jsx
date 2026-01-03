export default function ProgressIndicator({ children, className }) {
  return (
    <p className={`text-[0.75rem] md:text-[0.938rem] lg:text-[1.125rem] font-[500] font-poppins ${className}`}>
      {children}
    </p>
  );
}
