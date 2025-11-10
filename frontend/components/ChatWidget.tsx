import React, { useState } from "react";
import { API } from "../../lib/api";

type Msg = { role: "user" | "bot"; text: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi! Ask me about nearby hubs, vouchers, or hours. (No personal info, please.)" }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask() {
    const q = input.trim();
    if (!q || busy) return;
    setMsgs(m => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch(`${API}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q })
      });
      const j = await r.json();
      setMsgs(m => [...m, { role: "bot", text: j?.answer || "Sorry, no answer." }]);
    } catch {
      setMsgs(m => [...m, { role: "bot", text: "Server error. Try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-teal-600 text-white px-4 py-3 shadow-lg hover:bg-teal-700"
      >
        {open ? "Close chat" : "Chat"}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-40 w-80 rounded-xl bg-white shadow-2xl border">
          <div className="px-3 py-2 border-b font-semibold">CommonKind Help</div>
          <div className="h-60 overflow-y-auto p-3 space-y-2 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <span
                  className={
                    "inline-block px-3 py-2 rounded " +
                    (m.role === "user" ? "bg-teal-600 text-white" : "bg-gray-100")
                  }
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 p-3 border-t">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && ask()}
              placeholder="Ask about hubs, hours…"
              className="flex-1 rounded border px-2 py-2 text-sm outline-none focus:border-teal-600"
            />
            <button
              onClick={ask}
              disabled={busy}
              className="rounded bg-teal-600 px-3 py-2 text-white text-sm disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
