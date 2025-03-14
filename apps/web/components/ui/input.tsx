import { cn } from "../../lib/style";

export default function Input({
  className,
  asChild = false,
  children,
  ...props
}: {
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return asChild ? (
    <div
      className={cn(
        "px-[21px] py-2 flex items-center rounded-lg border border-sold border-black border-opacity-25 text-black focus:outline-none focus:ring focus:border-blue-400",
        className,
      )}
    >
      {children}
    </div>
  ) : (
    <input
      className={cn(
        "px-[21px] py-2 flex placeholder:text-black placeholder:text-[20px] leading-normal font-medium placeholder:text-opacity-25 items-center rounded-lg border border-sold border-black border-opacity-25 text-black focus:outline-none focus:ring focus:border-blue-400",
        className,
      )}
      {...props}
    />
  );
}
