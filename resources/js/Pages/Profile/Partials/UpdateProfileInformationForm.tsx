import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Alert } from "@/Components/ui/alert";
import { Separator } from "@/Components/ui/separator"
import { useForm, usePage } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { Inertia } from "@inertiajs/inertia";

export default function UpdateProfileInformation({
  mustVerifyEmail,
  status,
  className = "",
}: {
  mustVerifyEmail: boolean;
  status?: string;
  className?: string;
}) {
  const user = usePage().props.auth.user;

  const { data, setData, patch, errors, processing, recentlySuccessful } =
    useForm({
      name: user.name,
      email: user.email,
      position: (user as any).position || "",
      landline: (user as any).landline || "",
      mobile: (user as any).mobile || "",
    });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    patch(route("profile.update"));
  };

  return (
    <section className={className}>
      <header className="space-y-1">
        <h2 className="text-xl font-semibold leading-7 text-gray-900">
          Your Details
        </h2>
        <p className="text-sm text-muted-foreground">
          Keep your contact details up to date.
        </p>
      </header>
      <Separator className="my-4" />

      <form onSubmit={submit} className="mt-6 space-y-6">
        {/* Form Field */}
        {[
          { label: "Your Name", id: "name", value: data.name, onChange: (v: string) => setData("name", v) },
          { label: "Email Address", id: "email", type: "email", value: data.email, onChange: (v: string) => setData("email", v) },
          { label: "Position", id: "position", value: data.position, onChange: (v: string) => setData("position", v) },
          { label: "Landline", id: "landline", value: data.landline, onChange: (v: string) => setData("landline", v) },
          { label: "Mobile", id: "mobile", value: data.mobile, onChange: (v: string) => setData("mobile", v) },
        ].map(({ label, id, type = "text", value, onChange }) => (
          <div key={id} className="flex items-center gap-4">
            <Label htmlFor={id} className="w-1/4 text-left">
              {label}
            </Label>
            <div className="flex-1">
              <Input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Your ${label}`}
                disabled={processing}
              />
              {errors[id as keyof typeof errors] && (
                <Alert variant="destructive">{errors[id as keyof typeof errors]}</Alert>
              )}
            </div>
          </div>
        ))}

        {/* Verification Section */}
        {mustVerifyEmail && user.email_verified_at === null && (
          <div className="space-y-2">
            <Alert variant="default">
              <p className="text-sm">
                Your email address is unverified.{" "}
                <button
                  type="button"
                  className="underline text-primary"
                  onClick={() =>
                    Inertia.post(route("verification.send"))
                  }
                >
                  Click here to re-send the verification email.
                </button>
              </p>
            </Alert>
            {status === "verification-link-sent" && (
              <Alert variant="default">
                <p className="text-sm">
                  A new verification link has been sent to your email address.
                </p>
              </Alert>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={processing}>
            Save
          </Button>
          {recentlySuccessful && (
            <p className="text-sm text-muted-foreground">Saved.</p>
          )}
        </div>
      </form>
    </section>
  );
}
