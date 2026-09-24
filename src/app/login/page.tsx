"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heartbeat, CircleNotch } from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Something went wrong");
  return json;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingBootstrap, setCheckingBootstrap] = useState(true);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetch("/api/auth/bootstrap-status")
      .then((r) => r.json())
      .then((j) => setNeedsBootstrap(Boolean(j.needsBootstrap)))
      .catch(() => setNeedsBootstrap(false))
      .finally(() => setCheckingBootstrap(false));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await postJson("/api/auth/login", { email, password });
      router.push(searchParams.get("next") || "/");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  async function handleBootstrap(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await postJson("/api/users", { name, email, password });
      await postJson("/api/auth/login", { email, password });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2.5">
            <div className="flex size-[34px] flex-none items-center justify-center rounded-md border border-primary text-primary">
              <Heartbeat size={19} />
            </div>
            <div>
              <div className="font-heading text-[15px] font-semibold tracking-wide">KADCHMA</div>
              <div className="text-[10.5px] leading-tight text-muted-foreground">Enrollment Dashboard</div>
            </div>
          </div>
          <CardTitle>{checkingBootstrap ? "" : needsBootstrap ? "Create the first administrator account" : "Sign in"}</CardTitle>
          <CardDescription>
            {needsBootstrap
              ? "No staff accounts exist yet. Set up the first System Administrator account to get started."
              : "Sign in with your KADCHMA staff account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checkingBootstrap ? (
            <div className="flex justify-center py-6 text-muted-foreground">
              <CircleNotch size={20} className="animate-spin" />
            </div>
          ) : (
            <form className="flex flex-col gap-3" onSubmit={needsBootstrap ? handleBootstrap : handleLogin}>
              {needsBootstrap && (
                <div className="space-y-1.5">
                  <Label htmlFor="login-name">Full name</Label>
                  <Input id="login-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@kadchma.kd.gov.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete={needsBootstrap ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={needsBootstrap ? 12 : undefined}
                  required
                />
                {needsBootstrap && <div className="text-[11.5px] text-muted-foreground">Minimum 12 characters.</div>}
              </div>
              {needsBootstrap && (
                <div className="space-y-1.5">
                  <Label htmlFor="login-confirm">Confirm password</Label>
                  <Input
                    id="login-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              {error && <div className="text-[12.5px] text-[var(--st-expired-fg)]">{error}</div>}
              <Button type="submit" disabled={submitting} className="mt-1">
                {submitting && <CircleNotch size={14} className="animate-spin" />}
                <span>{submitting ? "Please wait…" : needsBootstrap ? "Create account and sign in" : "Sign in"}</span>
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
