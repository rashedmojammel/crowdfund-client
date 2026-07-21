"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pressable } from "@/components/animations/Pressable";
import { FormField } from "@/components/forms/FormField";
import { apiFetch } from "@/lib/api-client";
import { useSessionStore } from "@/lib/store";
import { loginSchema, type LoginInput } from "@/lib/validators";
import type { AuthResponse } from "@/types";

export function LoginForm() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { user, token } = await apiFetch<AuthResponse>("/auth/sign-in", {
        method: "POST",
        body: values,
      });
      setSession(user, token);
      router.push("/dashboard");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Login failed — try again");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {formError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <FormField label="Email" htmlFor="login-email" required error={fieldState.error?.message}>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <FormField
            label="Password"
            htmlFor="login-password"
            required
            error={fieldState.error?.message}
          >
            <Input
              id="login-password"
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.error ? true : undefined}
            />
          </FormField>
        )}
      />

      <Pressable>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          Log in
        </Button>
      </Pressable>
    </form>
  );
}
