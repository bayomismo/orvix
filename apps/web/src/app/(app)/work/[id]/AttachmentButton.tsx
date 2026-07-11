"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@orvix/ui";

import { addAttachment } from "../actions";

export function AttachmentButton({ workItemId }: { workItemId: string }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    await addAttachment({
      clientRequestId: crypto.randomUUID(),
      workItemId,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      storageKey: `local://work-items/${workItemId}/${file.name}`,
    });
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        onChange={onChange}
        disabled={busy}
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
        Attach
      </Button>
    </>
  );
}
