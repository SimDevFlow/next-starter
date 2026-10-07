import Image from "next/image";

import { cn } from "@/lib/utils";

const LOGO_SRC = "/brand/logo-emblem.png";
const LOGO_ALT = "Afrizuminko";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 96 }: Readonly<LogoProps>) {
  return (
    <Image
      src={LOGO_SRC}
      alt={LOGO_ALT}
      width={size}
      height={size}
      preload
      className={cn("object-contain", className)}
    />
  );
}

export function LogoIcon({ className, size = 32 }: Readonly<LogoProps>) {
  return (
    <Image
      src={LOGO_SRC}
      alt={LOGO_ALT}
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}
