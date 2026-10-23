"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyButton({ text, label = "Copy", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Please try manually.");
    }
  };

  if (!text.trim()) return null;

  return (
    <button onClick={handleCopy} disabled={copied}
      className={`p-1.5 rounded-md bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors flex items-center justify-center shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] dark:shadow-none ${className} ${copied ? "cursor-default" : ""}`}
      aria-label={`Copy ${label}`}>
      {copied ? <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : <Copy className="w-4 h-4 text-slate-600 dark:text-white/60" />}
    </button>
  );
}
