export const Button = ({ children, className = "", onClick, variant = "filled" }) => {
  const getVariantClasses = () => {
    // Note: The design specifies border-2 for hover state. To achieve this visual effect
    // while preventing layout shift, we use border-1 consistently and add an inset shadow
    // on hover (hover:shadow-[inset_0_0_0_1px_#80412B]) to simulate the thicker border.
    // The shadow is removed on active state (active:shadow-none) to return to the thinner border appearance.
    switch (variant) {
      case "ghost":
        return "text-primary-11 py-4 px-10 text-xl hover:text-bold hover:text-[#FED9CC] active:text-bold active:text-[#FED9CC]";
      case "outline":
        return "border border-1 border-primary-8 hover:border-[#80412B] hover:shadow-[inset_0_0_0_1px_#80412B] active:shadow-none active:border-1 active:border-[#69311D] text-primary-11 hover:text-bold hover:text-[#FED9CC] active:text-bold active:text-[#FED9CC] font-medium font-['Poppins'] flex items-center justify-center py-4 px-6 md:py-[1.25rem] md:px-[1.875rem] lg:py-[1.5rem] lg:px-[2.25rem] text-[1.125rem] md:text-[1.40625rem] lg:text-[1.6875rem] leading-[1.5rem] md:leading-[1.875rem] lg:leading-[2.25rem]";
      case "filled":
        return "focus-none bg-primary-4 hover:bg-[#592411] active:bg-[#341A11] text-primary-11 font-['Poppins'] font-medium hover:text-bold hover:text-[#FED9CC] active:text-bold active:text-[#FED9CC] border-1 border-primary-6 hover:shadow-[inset_0_0_0_1px_#80412B] active:shadow-none active:border-1 active:border-[#69311D] flex items-center justify-center py-4 px-6 md:py-[1.25rem] md:px-[1.875rem] lg:py-[1.5rem] lg:px-[2.25rem] text-[1.125rem] md:text-[1.40625rem] lg:text-[1.6875rem] leading-[1.5rem] md:leading-[1.875rem] lg:leading-[2.25rem]";
      case "filled-secondary":
        return "bg-[#FFC6B3] text-[#BD3900] border border-[#F7A98F] font-['Poppins'] font-medium text-center flex items-center justify-center w-[148px] py-4 px-6 md:py-[1.25rem] md:px-[1.875rem] lg:py-[1.5rem] lg:px-[2.25rem] text-[1.125rem] md:text-[1.40625rem] lg:text-[1.6875rem] leading-[1.5rem] md:leading-[1.875rem] lg:leading-[2.25rem]";
      default:
        return "text-primary-11 py-4 px-10 text-xl";
    }
  };

  return (
    <button className={`rounded-full w-auto min-w-[147px] cursor-pointer transition-all duration-200 ${getVariantClasses()} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};
