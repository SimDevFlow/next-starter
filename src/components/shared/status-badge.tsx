import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TONE_CLASSES, enumTones, type EnumNamespace } from "@/lib/enums";

interface StatusBadgeProps {
  namespace: EnumNamespace;
  value: string;
  className?: string;
}

export function StatusBadge({ namespace, value, className }: StatusBadgeProps) {
  const t = useTranslations("enums");
  const tones = enumTones[namespace] as Record<string, keyof typeof TONE_CLASSES>;
  const tone = tones[value] ?? "neutral";

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", TONE_CLASSES[tone], className)}
    >
      {t(`${namespace}.${value}`)}
    </Badge>
  );
}
