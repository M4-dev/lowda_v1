import React from "react";

interface StatusProps {
  text: string;
  icon: React.ElementType;
  bg: string;
  color: string;
}

const Status: React.FC<StatusProps> = ({ text, icon: Icon, bg, color }) => {
  return (
    <div
      className={`
    ${bg}
    ${color}
    px-1.5
    py-0.5
    my-1
    rounded
    flex
    items-center
    gap-1
    text-xs
    `}
    >
      {text} <Icon size={12} />
    </div>
  );
};

export default Status;
