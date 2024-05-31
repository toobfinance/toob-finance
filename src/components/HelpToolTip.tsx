import React from "react";
import Help from "./svgs/Help";

interface HelpToolTipProps {
  children: React.ReactNode;
  className?: string;
}

const HelpToolTip: React.FC<HelpToolTipProps> = ({ children, className }) => {
  return (
    <div
      className={`relative inline-flex group cursor-pointer ${className ?? ""}`}
    >
      <span className="bg-black/10 p-0.5 rounded-full">
        <Help />
      </span>
      <div className="absolute hidden group-hover:block top-0 left-1/2 -translate-y-full -translate-x-1/2 -mt-1 bg-[#f3f3f3]/95 py-2 px-3 rounded-lg border border-[#b19f85]">
        {children}
      </div>
    </div>
  );
};

export default HelpToolTip;
