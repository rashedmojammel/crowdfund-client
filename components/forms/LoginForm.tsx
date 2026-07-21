"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, PasswordInput, TextInput } from "@gravity-ui/uikit";
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
      {formError ? <Alert theme="danger" message={formError} /> : null}

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <FormField label="Email" htmlFor="login-email" required>
            <TextInput
              id="login-email"
              size="l"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={field.value}
              onUpdate={field.onChange}
              onBlur={field.onBlur}
              validationState={fieldState.error ? "invalid" : undefined}
              errorMessage={fieldState.error?.message}
            />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <FormField label="Password" htmlFor="login-password" required>
            <PasswordInput
              id="login-password"
              size="l"
              placeholder="Your password"
              autoComplete="current-password"
              value={field.value}
              onUpdate={field.onChange}
              onBlur={field.onBlur}
              validationState={fieldState.error ? "invalid" : undefined}
              errorMessage={fieldState.error?.message}
            />
          </FormField>
        )}
      />

      <Pressable>
        <Button type="submit" view="action" size="l" width="max" loading={isSubmitting}>
          Log in
        </Button>
      </Pressable>
    </form>
  );
}
