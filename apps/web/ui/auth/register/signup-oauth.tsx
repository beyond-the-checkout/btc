"use client";

import { Button, Github, Google } from "@dub/ui";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Default callback for OAuth when no `next` param - routes through QR onboarding
const DEFAULT_OAUTH_CALLBACK = "/onboarding/qr-landing";

export const SignUpOAuth = ({
  methods,
}: {
  methods: ("email" | "google" | "github")[];
}) => {
  const searchParams = useSearchParams();
  const next = searchParams?.get("next");
  // Use provided next param only if it's a safe internal path, otherwise default to QR onboarding
  // This prevents open redirect attacks via crafted next params
  const callbackUrl =
    next && next.startsWith("/") ? next : DEFAULT_OAUTH_CALLBACK;
  const [clickedGoogle, setClickedGoogle] = useState(false);
  const [clickedGithub, setClickedGithub] = useState(false);

  useEffect(() => {
    // when leave page, reset state
    return () => {
      setClickedGoogle(false);
      setClickedGithub(false);
    };
  }, []);

  return (
    <>
      {methods.includes("google") && (
        <Button
          variant="secondary"
          text="Continue with Google"
          onClick={() => {
            setClickedGoogle(true);
            signIn("google", { callbackUrl });
          }}
          loading={clickedGoogle}
          icon={<Google className="h-4 w-4" />}
        />
      )}
      {methods.includes("github") && (
        <Button
          variant="secondary"
          text="Continue with GitHub"
          onClick={() => {
            setClickedGithub(true);
            signIn("github", { callbackUrl });
          }}
          loading={clickedGithub}
          icon={<Github className="h-4 w-4" />}
        />
      )}
    </>
  );
};
