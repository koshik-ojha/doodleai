"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatWidget from "@components/ChatWidget";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function WidgetLoader() {
  const searchParams = useSearchParams();
  const botId = searchParams.get("botId");
  const domain = searchParams.get("domain") || "";
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (!botId) return;
    fetch(`${API_URL}/api/chatbots/public/${botId}?domain=${encodeURIComponent(domain)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setConfig(data); })
      .catch(() => {});
  }, [botId, domain]);

  if (!config) return null;

  return (
    <ChatWidget
      botId={botId}
      domain={domain}
      botName={config.botName}
      welcomeMessage={config.welcomeMessage}
      primaryColor={config.primaryColor}
      position={config.position || "bottom-right"}
      faqs={config.faqs || []}
      quickReplies={config.quickReplies || []}
      whatsappNumber={config.whatsappNumber || ""}
    />
  );
}

export default function WidgetPage() {
  return (
    <Suspense fallback={null}>
      <WidgetLoader />
    </Suspense>
  );
}

