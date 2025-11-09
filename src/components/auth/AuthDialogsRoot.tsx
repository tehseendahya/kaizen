'use client';

import { useState, useEffect } from 'react';
import { LoginDialog } from './LoginDialog';
import { OnboardingDialog } from '../OnboardingDialog';

let openLoginDialog: (() => void) | null = null;
let openSignupDialog: (() => void) | null = null;

export function openLogin() {
  if (openLoginDialog) openLoginDialog();
}

export function openSignup() {
  if (openSignupDialog) openSignupDialog();
}

export function AuthDialogsRoot() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  useEffect(() => {
    openLoginDialog = () => setLoginOpen(true);
    openSignupDialog = () => setSignupOpen(true);

    return () => {
      openLoginDialog = null;
      openSignupDialog = null;
    };
  }, []);

  return (
    <>
      <button data-login-trigger style={{ display: 'none' }} onClick={() => setLoginOpen(true)} />
      <button data-signup-trigger style={{ display: 'none' }} onClick={() => setSignupOpen(true)} />
      
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <OnboardingDialog open={signupOpen} onOpenChange={setSignupOpen} />
    </>
  );
}

