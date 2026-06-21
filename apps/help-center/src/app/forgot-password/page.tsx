'use client';

import { GuestRoute, ForgotPasswordForm } from '@easydev/auth';

export default function ForgotPasswordPage() {
  return (
    <GuestRoute>
      <ForgotPasswordForm />
    </GuestRoute>
  );
}
