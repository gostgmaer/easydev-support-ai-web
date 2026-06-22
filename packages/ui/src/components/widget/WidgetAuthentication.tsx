import * as React from 'react';
import { ShieldCheck } from 'lucide-react';
import { EmailInput } from '../base/EmailInput';
import { OTPInput } from '../base/OTPInput';
import { Button } from '../base/Button';

export interface WidgetAuthenticationProps {
  onRequestCode: (email: string) => void | Promise<void>;
  onVerifyCode: (email: string, code: string) => void | Promise<void>;
  onContinueAsGuest?: () => void;
  isSubmitting?: boolean;
  codeSent?: boolean;
}

export function WidgetAuthentication({ onRequestCode, onVerifyCode, onContinueAsGuest, isSubmitting = false, codeSent = false }: WidgetAuthenticationProps) {
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <ShieldCheck className="h-4 w-4 text-primary" />
        Verify your identity to continue
      </div>
      <EmailInput value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" disabled={codeSent} />
      {codeSent && <OTPInput value={code} onChange={setCode} length={6} autoFocus />}
      {codeSent ? (
        <Button type="button" className="w-full" disabled={code.length !== 6} isLoading={isSubmitting} onClick={() => onVerifyCode(email, code)}>
          Verify code
        </Button>
      ) : (
        <Button type="button" className="w-full" disabled={!email.includes('@')} isLoading={isSubmitting} onClick={() => onRequestCode(email)}>
          Send verification code
        </Button>
      )}
      {onContinueAsGuest && (
        <Button type="button" variant="ghost" className="w-full" onClick={onContinueAsGuest}>
          Continue as guest
        </Button>
      )}
    </div>
  );
}
