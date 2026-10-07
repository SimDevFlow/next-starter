"use client";

import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmVariant?: VariantProps<typeof buttonVariants>["variant"];
  isLoading?: boolean;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  confirmVariant = "destructive",
  isLoading,
}: ConfirmDialogProps) {
  const t = useTranslations("common");

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">{t("actions.cancel")}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={confirmVariant} onClick={onConfirm} disabled={isLoading}>
              {t("actions.confirm")}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
