'use client';

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../../components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function ConfirmationDialog({ isOpen, onClose, email }: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center">Check your email</DialogTitle>
          <DialogDescription className="text-center space-y-3">
            <p>
              We sent a confirmation link to
              <br />
              <span className="font-semibold">{email}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Click the link in the email to confirm your account.
              If you don't see it, check your spam folder.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
