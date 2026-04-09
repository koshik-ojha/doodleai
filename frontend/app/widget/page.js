"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatWidget from "@components/ChatWidget";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function WidgetLoader() {
  const searchParams = useSearchParams();
  const botId = searchParams.get("botId");
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (!botId) return;
    fetch(`${API_URL}/api/chatbots/public/${botId}`)
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfig({}));
  }, [botId]);

  if (!config) return null;

  return (
    <ChatWidget
      botId={botId}
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
