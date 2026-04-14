import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("ui-badge", {
  variants: {
    variant: {
      default: "ui-badge-default",
      success: "ui-badge-success",
      warning: "ui-badge-warning",
      error: "ui-badge-error"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  const statusSymbol =
    variant === "success" ? "✓" : variant === "warning" ? "!" : variant === "error" ? "✕" : null;

  return (
    <span className={cn(badgeVariants({ variant }), statusSymbol ? "ui-badge-with-symbol" : "", className)} {...props}>
      {statusSymbol ? (
        <span className="ui-badge-symbol" aria-hidden="true">
          {statusSymbol}
        </span>
      ) : null}
      {children}
    </span>
  );
}
