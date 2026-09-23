import React from "react";
import { Sparkles, Camera, Tag } from "lucide-react";
import { getBouquetPackageBadgeStyle } from "@/lib/constants/bouquet";

interface BouquetPackageBadgeProps {
  packageType?: string | null;
  variant?: "floating" | "inline";
  showIcon?: boolean;
  className?: string;
  useShortLabel?: boolean;
}

export default function BouquetPackageBadge({
  packageType,
  variant = "inline",
  showIcon = true,
  className = "",
  useShortLabel,
}: BouquetPackageBadgeProps) {
  const style = getBouquetPackageBadgeStyle(packageType);
  const upper = (packageType || "REGULER").toUpperCase();
  const isShort = useShortLabel ?? (variant === "floating");
  const label = isShort ? style.shortLabel : style.label;

  const IconComponent =
    upper === "VIP"
      ? Sparkles
      : upper === "MEDIUM" || upper === "MEDIUM_PHOTO_TAKING"
      ? Camera
      : Tag;

  if (variant === "floating") {
    return (
      <div
        className={`backdrop-blur-xs text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 tracking-wide ${style.floatingBadgeClass} ${className}`}
      >
        {showIcon && <IconComponent className="w-3 h-3 shrink-0" />}
        <span>{label}</span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${style.inlineBadgeClass} ${className}`}
    >
      {showIcon && <IconComponent className="w-3 h-3 shrink-0" />}
      <span>{label}</span>
    </span>
  );
}
