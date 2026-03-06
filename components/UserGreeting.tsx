"use client";

import { useEffect, useState } from "react";
import { getGreetingMessage } from "@/lib/messages";

export function UserGreeting() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUsername(data?.user?.username ?? null))
      .catch(() => setUsername(null));
  }, []);

  if (!username) return null;
  const greeting = getGreetingMessage();
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-sm font-medium text-ink-600 truncate max-w-[120px] sm:max-w-[180px]" title={username}>
        Olá, {username}
      </span>
      <span className="text-xs text-ink-500">{greeting}</span>
    </div>
  );
}
