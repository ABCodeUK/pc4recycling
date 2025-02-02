import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Alert } from "@/Components/ui/alert";
import { Separator } from "@/Components/ui/separator"
import { useForm } from "@inertiajs/react";
import { FormEventHandler, useRef } from "react";

export default function UpdatePasswordForm({ className = "" }: { className?: string }) {
  const passwordInput = useRef<HTMLInputElement>(null);
  const currentPasswordInput = useRef<HTMLInputElement>(null);

  const {
    data,
    setData,
    errors,
    put,
    reset,
    processing,
    recentlySuccessful,
  } = useForm({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const updatePassword: FormEventHandler = (e) => {
    e.preventDefault();

    put(route("password.update"), {
      preserveScroll: true,
      onSuccess: () => reset(),
      onError: (errors) => {
        if (errors.password) {
          reset("password", "password_confirmation");
          passwordInput.current?.focus();
        }

        if (errors.current_password) {
          reset("current_password");
          currentPasswordInput.current?.focus();
        }
      },
    });
  };

  return (
    <section className={className}>
      <header className="space-y-1">
        <h2 className="text-xl font-semibold leading-7 text-gray-900">Update Password</h2>
        <p className="text-sm text-muted-foreground">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </header>
      <Separator className="my-4" />
      <form onSubmit={updatePassword} className="mt-6 space-y-6">
        {/* Current Password */}
        <div className="space-y-2">
          <Label htmlFor="current_password">Current Password</Label>
          <Input
            id="current_password"
            ref={currentPasswordInput}
            value={data.current_password}
            onChange={(e) => setData("current_password", e.target.value)}
            type="password"
            placeholder="Enter your current password"
            autoComplete="current-password"
            disabled={processing}
          />
          {errors.current_password && (
            <Alert variant="destructive">{errors.current_password}</Alert>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            ref={passwordInput}
            value={data.password}
            onChange={(e) => setData("password", e.target.value)}
            type="password"
            placeholder="Enter a new password"
            autoComplete="new-password"
            disabled={processing}
          />
          {errors.password && <Alert variant="destructive">{errors.password}</Alert>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirm Password</Label>
          <Input
            id="password_confirmation"
            value={data.password_confirmation}
            onChange={(e) => setData("password_confirmation", e.target.value)}
            type="password"
            placeholder="Confirm your new password"
            autoComplete="new-password"
            disabled={processing}
          />
          {errors.password_confirmation && (
            <Alert variant="destructive">{errors.password_confirmation}</Alert>
          )}
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={processing}>
            Change Password
          </Button>
          {recentlySuccessful && (
            <p className="text-sm text-muted-foreground">Saved.</p>
          )}
        </div>
      </form>
    </section>
  );
}
