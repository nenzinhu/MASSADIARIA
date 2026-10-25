"use client";

import { useEffect, useState } from "react";

export function PwaStatus() {
  const [online, setOnline] = useState(true);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    const updateConnection = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    if (!("serviceWorker" in navigator)) return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };

    let refreshing = false;
    const controllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", controllerChange);
    void navigator.serviceWorker.register("/sw.js").then(registration => {
      if (registration.waiting) setWaiting(registration.waiting);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) setWaiting(worker);
        });
      });
    }).catch(() => undefined);

    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
      navigator.serviceWorker.removeEventListener("controllerchange", controllerChange);
    };
  }, []);

  if (online && !waiting) return null;
  return <div className="pwa-status" role="status">
    <span>{waiting ? "Uma nova versão está disponível." : "Você está offline. O diário local continua disponível."}</span>
    {waiting && <button type="button" onClick={() => waiting.postMessage({ type: "SKIP_WAITING" })}>Atualizar agora</button>}
  </div>;
}
