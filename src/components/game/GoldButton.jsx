import React from "react";
import { cn } from "@/lib/utils";

export default function GoldButton({ as: Component = "button", variant = "solid", className, children, ...props }) {
  const variants = {
    solid:
      "bg-primary text-primary-foreground hover:glow-gold-strong hover:brightness-110",
    outline: "border border-primary/60 text-primary hover:bg-primary/10",
    ghost: "text-muted-foreground hover:text-foreground",
  };

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 font-heading text-[11px] uppercase tracking-[0.18em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}