"use client";

import { useEffect, useState } from "react";

type Handoff = {
  status?: string;
  orderId?: string;
  mode?: string;
  detail?: string;
};

export function PrintHandoff({ paymentIntentId }: { paymentIntentId: string }) {
  const [result, setResult] = useState<Handoff | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function send() {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
          const response = await fetch("/api/fulfill", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentIntentId }),
            signal: controller.signal,
          });
          const body = (await response.json()) as Handoff;
          if (cancelled) return;
          setResult(body);
          if (body.status !== "placing") return;
        } catch {
          if (controller.signal.aborted || cancelled) return;
          setResult({ status: "failed", detail: "The print handoff did not answer." });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    void send();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [paymentIntentId]);

  return <p className="mt-4 text-lg">{result ? sentence(result) : "Sending the shirt to print…"}</p>;
}

function sentence(result: Handoff) {
  if (result.status === "placed" && result.mode === "test") {
    return `Scalable Press accepted test order ${result.orderId}. It will not be printed or shipped.`;
  }
  if (result.status === "placed") {
    return `Scalable Press accepted order ${result.orderId}.`;
  }
  if (result.status === "blocked") {
    return "The payment is complete. The print order was not sent. Add the Scalable Press test key next to the live key, restart the shop, and open this page again.";
  }
  if (result.status === "placing") {
    return "Sending the shirt to print…";
  }
  if (result.status === "skipped") {
    return "The payment is complete. Nothing in this order is set up to print.";
  }
  if (result.detail) return result.detail;
  return "The payment is complete. The print order has not been confirmed yet.";
}
