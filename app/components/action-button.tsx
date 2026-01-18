import React from "react";
import { CircularProgress } from "@mui/material";

interface ActionButtonProps {
  icon: React.ElementType;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  onClick,
  disabled,
  isLoading,
  label,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex flex-col items-center justify-center rounded cursor-pointer p-0.5 my-1 text-slate-700 border border-slate-400 hover:scale-105 active:scale-100 transition min-w-0 min-h-0
    ${(disabled || isLoading) && "opacity-50 cursor-not-allowed"}
    `}
    >
      {isLoading ? <CircularProgress size={12} /> : <Icon size={14} />}
      {label && <span className="text-[8px] mt-0 font-medium leading-tight">{label}</span>}
    </button>
  );
};

export default ActionButton;
