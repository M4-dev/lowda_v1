"use client";

import { CircularProgress } from "@mui/material";
import React from "react";

interface ButtonProps {
  label: string;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  custom?: string;
  isLoading?: boolean;
  icon?: React.ElementType;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  roundedBottom?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  disabled,
  outline,
  small,
  custom,
  isLoading,
  icon: Icon,
  onClick,
  type = "button",
  roundedBottom = false,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-80 w-full border-zinc-800 flex items-center justify-center gap-2 active:scale-95 transition
      ${roundedBottom ? "rounded-b-lg" : "rounded-md"}
      ${outline ? "bg-white" : "bg-zinc-900"}
      ${outline ? "text-zinc-900" : "text-white"}
      ${small ? "text-sm font-light" : "text-md font-semibold"}
      ${small ? "py-1 px-2 border-[1px]" : "py-3 px-4 border-2"}
      ${custom ? custom : ""}
      ${typeof className === "string" ? className : ""}
      `}
    >
      {isLoading && <CircularProgress size={22} />}
      {Icon && <Icon size={24} />}
      {label}
    </button>
  );
};

export default Button;
