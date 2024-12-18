'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Mail, CheckCircle2 } from "lucide-react";
import { supabase } from '../../lib/supabase';

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordDialog({ isOpen, onClose }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (resetError) throw resetError;
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {isSuccess ? (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle className="text-center">Check your email</DialogTitle>
              <DialogDescription className="text-center space-y-3">
                <p>
                  We sent a password reset link to
                  <br />
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Click the link in your email to reset your password.
                  The link will expire in 24 hours.
                </p>
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>Reset your password</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Mail className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>
        ) : (
          <Button onClick={handleClose} className="w-full">
            Got it, thanks!
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
