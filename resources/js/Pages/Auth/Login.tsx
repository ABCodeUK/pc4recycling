import { useForm } from "@inertiajs/react";
import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
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

                {/* Login Card */}
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Welcome back</CardTitle>
                        <CardDescription>Login with your credentials</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-6">
                            {/* Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="bob@example.com"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    required
                                />
                                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                            </div>

                            {/* Buttons */}
                            <div className="grid gap-2">
                                <Button type="submit" className="w-full" disabled={processing}>
                                    Login
                                </Button>
                                {canResetPassword && (
                                    <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.location.href = route("password.request");
                                    }}
                                >
                                    Forgot your password?
                                </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer Text */}
                <div className="text-center text-sm text-muted-foreground">
                    If you have any issues accessing your account, please contact{" "}
                    <a href="mailto:info@pc4recycling.co.uk" className="underline">
                        info@pc4recycling.co.uk
                    </a>
                    .
                </div>
            </div>
        </div>
    );
}
