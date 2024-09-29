"use client";

import { useState } from "react";
import { Hash, MessageSquareReply, Users } from "lucide-react";

import { SignInFlow } from "../types";
import { SignInCard } from "./SignInCard";
import { SignUpCard } from "./SignUpCard";

const FEATURES = [
  { icon: Hash, text: "Channels per workspace, with invite codes for new members" },
  { icon: MessageSquareReply, text: "Threaded replies, reactions and image attachments" },
  { icon: Users, text: "Private direct messages between workspace members" },
];

export const AuthScreen = () => {
  const [state, setState] = useState<SignInFlow>("signIn");

  return (
    <main className="min-h-full grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] bg-background">
      <section className="bg-rail text-panel-foreground px-6 py-8 md:px-12 md:py-16 flex flex-col justify-between gap-8">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="size-9 rounded-md bg-signal text-white font-display font-bold text-xl grid place-items-center"
          >
            b
          </span>
          <span className="font-display text-xl font-semibold text-white">Backchannel</span>
        </div>

        <div className="space-y-6 max-w-md">
          <h1 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
            Channels, threads and direct messages for small teams, synced live.
          </h1>
          <ul className="space-y-3 hidden sm:block">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm">
                <Icon aria-hidden className="size-4 mt-0.5 shrink-0 text-signal" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-panel-foreground/70 hidden md:block">
          Real-time sync and sign-in are powered by Convex.
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 md:px-10">
        <div className="w-full max-w-[420px]">
          {state === "signIn" ? (
            <SignInCard setState={setState} />
          ) : (
            <SignUpCard setState={setState} />
          )}
        </div>
      </section>
    </main>
  );
};
