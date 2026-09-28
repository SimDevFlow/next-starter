"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SecretCell({ value, copyable = false }: { value: string; copyable?: boolean }) {
  const [visible, setVisible] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }

  return (
    <span className="inline-flex items-center gap-1 font-mono text-sm">
      {visible ? value : "••••••••"}
      <Button variant="ghost" size="icon-xs" onClick={() => setVisible((v) => !v)}>
        {visible ? <EyeOff /> : <Eye />}
        <span className="sr-only">{visible ? "Hide" : "Reveal"}</span>
      </Button>
      {copyable && (
        <Button variant="ghost" size="icon-xs" onClick={copy}>
          <Copy />
          <span className="sr-only">Copy</span>
        </Button>
      )}
    </span>
  );
}
