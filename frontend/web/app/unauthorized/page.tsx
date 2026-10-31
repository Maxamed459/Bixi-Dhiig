"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

export default function UnauthorizedPage() {
  const t = useT();

  return (
    <div className="relative flex flex-1 items-center justify-center px-4 py-12">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle>{t("auth.unauthorized.title")}</CardTitle>
          <CardDescription>{t("auth.unauthorized.body")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">{t("auth.unauthorized.back")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
