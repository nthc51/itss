import * as React from "react";
import { cn } from "@/lib/utils";

export const Refrigerator = React.forwardRef<
  SVGSVGElement,
  React.HTMLAttributes<SVGSVGElement>
>(({ className, ...props }, ref) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-4 w-4", className)}
    {...props}
    ref={ref}
  >
    <rect width="20" height="20" x="2" y="2" rx="2" ry="2" />
    <path d="M2 14h20" />
    <path d="M8 2v2" />
    <path d="M16 2v2" />
  </svg>
));
Refrigerator.displayName = "Refrigerator";
