'use client'

import { cn } from "../../lib/style";

type ButtonVariant = "primary" | "outline" | "unselected" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0891B2] text-white disabled:opacity-60 rounded-md p-2 mt-2",
  outline: "border border-blue-500 text-blue-500 ",
  unselected: "text-black rounded-md p-2 mt-2 hover:bg-gray-100/60 transition",
  danger: "bg-red-500 text-white rounded-md p-2 px-3 mt-2 disabled:opacity-60",
};

const Button = ({
  children,
  variant = "primary",
  loading = false,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) => {
  'use client'
  return (
    <button
      className={cn(
        `flex items-center justify-center ${fullWidth ? "w-full" : ""} ${
          variantClasses[variant]
        }`,
        className,
      )}
      disabled={loading}
      {...props}
    >
      {loading ? <div className="loader" /> : children}
    </button>
  );
};

export default Button;
