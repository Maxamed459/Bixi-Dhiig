"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/lib/i18n/context";

interface RejectDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectDialog({ open, loading, onClose, onConfirm }: RejectDialogProps) {
  const t = useT();
  const [reason, setReason] = useState("");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("requests.rejectTitle")}
      description={t("requests.rejectDescription")}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(reason.trim())} disabled={loading}>
            {t("requests.confirmReject")}
          </Button>
        </>
      }
    >
      <div className="space-y-1.5">
        <Label htmlFor="reject-reason">
          {t("requests.rejectReason")} <span className="font-normal text-zinc-400">{t("common.optional")}</span>
        </Label>
        <Textarea
          id="reject-reason"
          value={reason}
          maxLength={500}
          placeholder={t("requests.rejectReasonPlaceholder")}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </Dialog>
  );
}
