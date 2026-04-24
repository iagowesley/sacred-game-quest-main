import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-14 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 border-b-4 text-sm font-extrabold ring-offset-background shadow-[0_5px_0_hsl(var(--button-shadow))] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_0_hsl(var(--button-shadow))] active:translate-y-0.5 active:border-b-2 active:shadow-[0_2px_0_hsl(var(--button-shadow))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 disabled:shadow-[0_5px_0_hsl(var(--button-shadow))] [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-primary/80 bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "border-destructive/80 bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-primary/45 bg-background text-foreground hover:border-primary/70 hover:bg-primary/10 hover:text-primary",
        secondary: "border-secondary/80 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "border-transparent bg-transparent text-foreground shadow-none hover:bg-accent hover:text-accent-foreground hover:shadow-none active:shadow-none",
        link: "min-h-0 border-transparent bg-transparent p-0 text-primary shadow-none underline-offset-4 hover:translate-y-0 hover:underline hover:shadow-none active:translate-y-0 active:border-b-0 active:shadow-none",
      },
      size: {
        default: "px-7 py-4",
        sm: "min-h-12 px-5 py-3",
        lg: "min-h-16 px-9 py-5 text-base",
        icon: "h-14 w-14 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
