import { useForm } from "@inertiajs/react";
import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("verification.send"));
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                {/* Logo */}
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    PC4 Recycling
                </a>

                {/* Verify Email Card */}
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Email Verification</CardTitle>
                        <CardDescription>
                            Thanks for signing up! Before getting started, please verify your email address by clicking the link we sent to your email. If you didn’t receive the email, we’ll gladly send another.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {status === "verification-link-sent" && (
                            <div className="text-center text-sm font-medium text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                        <form onSubmit={submit} className="grid gap-6 mt-6">
                            {/* Resend Verification Email Button */}
                            <Button type="submit" className="w-full" disabled={processing}>
                                Resend Verification Email
                            </Button>

                            {/* Log Out Button */}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = route("logout");
                                }}
                            >
                                Log Out
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer Text */}
                <div className="text-center text-sm text-muted-foreground">
                    If you have any issues accessing your account, please contact {" "}
                    <a href="mailto:info@pc4recycling.co.uk" className="underline">
                        info@pc4recycling.co.uk
                    </a>.
                </div>
            </div>
        </div>
    );
}
