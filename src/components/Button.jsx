import React from "react";

export const Button = ({ children, className = "", onClick, variant = "filled", state = "default" }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "ghost":
        return "text-primary-11 py-4 px-10 text-xl";
      case "outline":
        return "border border-2 border-primary-8 text-primary-11 font-medium font-['Poppins'] flex items-center justify-center py-4 px-6 md:py-[1.25rem] md:px-[1.875rem] lg:py-[1.5rem] lg:px-[2.25rem] text-[1.125rem] md:text-[1.40625rem] lg:text-[1.6875rem] leading-[1.5rem] md:leading-[1.875rem] lg:leading-[2.25rem]";
      case "filled":
        return "bg-primary-4 text-primary-11 font-medium font-['Poppins'] border-1 border-primary-6 flex items-center justify-center py-4 px-6 md:py-[1.25rem] md:px-[1.875rem] lg:py-[1.5rem] lg:px-[2.25rem] text-[1.125rem] md:text-[1.40625rem] lg:text-[1.6875rem] leading-[1.5rem] md:leading-[1.875rem] lg:leading-[2.25rem]";
      case "filled-secondary":
        return "bg-[#FFC6B3] text-[#BD3900] border border-[#F7A98F] font-['Poppins'] font-medium text-center flex items-center justify-center w-[148px] py-4 px-6 md:py-[1.25rem] md:px-[1.875rem] lg:py-[1.5rem] lg:px-[2.25rem] text-[1.125rem] md:text-[1.40625rem] lg:text-[1.6875rem] leading-[1.5rem] md:leading-[1.875rem] lg:leading-[2.25rem]";
      default:
        return "text-primary-11 py-4 px-10 text-xl";
    }
  };

  return (
    <button className={`rounded-full min-w-[147px] cursor-pointer ${getVariantClasses()} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};
