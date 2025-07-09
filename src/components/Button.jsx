import React from "react";

export const Button = ({ children, className = "", onClick, variant = "filled", state = "default" }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "ghost":
        return "text-primary-11 py-4 px-10 text-xl";
      case "outline":
        return "border border-2 border-primary-8 text-primary-11 py-4 px-10 text-xl";
      case "filled":
        return "bg-primary-4 text-primary-11 hover:bg-primary-5 border-2 border-primary-6 py-4 px-10 text-xl";
      case "filled-secondary":
        return "bg-[#FFC6B3] text-[#BD3900] border border-[#F7A98F] font-['Poppins'] font-medium leading-[24px] text-center flex items-center justify-center w-[148px] h-[64px] pt-[20px] pb-[20px] px-4 text-[18px]";
      default:
        return "text-primary-11 py-4 px-10 text-xl";
    }
  };

  return (
    <button className={`rounded-full cursor-pointer ${getVariantClasses()} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};
