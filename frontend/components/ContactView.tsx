import React, { useEffect, useState } from "react";

type Props = {
  onBack?: () => void;
};

type ContactMsg = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  createdAt: number; // epoch ms
};

const STORAGE_KEY = "ck_contact_msgs";

function loadMsgs(): ContactMsg[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveMsgs(msgs: ContactMsg[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch {}
}

const ContactView: React.FC<Props> = ({ onBack }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => setSent(null), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = {
      name: name.trim(),
      email: email.trim(),
      topic: topic.trim(),
      message: message.trim(),
    };
    if (!trimmed.name || !trimmed.email || !trimmed.message) {
      setSent("Please complete name, email, and message.");
      return;
    }
    const newMsg: ContactMsg = {
      id: "C-" + Date.now(),
      ...trimmed,
      createdAt: Date.now(),
    };
    const all = [newMsg, ...loadMsgs()].slice(0, 100);
    saveMsgs(all);
    setSent("Thanks! Your question has been received. We'll reach out soon.");
    setName(""); setEmail(""); setTopic(""); setMessage("");
  };

  return (
    <div className="max-w-3xl w-full mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contact</h1>
        {onBack && (
          <button
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            onClick={onBack}
          >
            Back
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="md:col-span-2 rounded-xl border bg-white p-5">
          <h2 className="text-lg font-medium mb-3">Send us a question</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Topic (optional)</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Donations, becoming a hub, etc."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                className="mt-1 w-full min-h-[120px] rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help?"
              />
            </div>

            {sent && (
              <div className={`rounded-md ${sent.startsWith("Thanks!") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"} px-3 py-2 text-sm`}>
                {sent}
              </div>
            )}

            <div className="pt-1">
              <button
                type="submit"
                className="rounded bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Submit
              </button>
            </div>
          </form>
        </div>

        {/* Contact details */}
        <aside className="rounded-xl border bg-white p-5">
          <h2 className="text-lg font-medium mb-3">Or reach us directly</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 text-teal-600">
                <path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.7 19.7 0 0 1-8.58-3.06 19.4 19.4 0 0 1-6-6 19.7 19.7 0 0 1-3.06-8.6A2 2 0 0 1 4.18 1h2a2 2 0 0 1 2 1.72c.12.9.33 1.77.64 2.6a2 2 0 0 1-.45 2.11L7 8.09a16 16 0 0 0 6 6l.66-.37a2 2 0 0 1 2.11-.45c.83.31 1.7.52 2.6.64A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <a href="tel:+18174716373" className="text-teal-700 hover:underline">
                (817) 471-6373
              </a>
            </li>
            <li className="flex items-start gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 text-teal-600">
                <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.6" />
                <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <a href="mailto:kaylew1421@gmail.com" className="text-teal-700 hover:underline">
                kaylew1421@gmail.com
              </a>
            </li>
          </ul>
          <p className="mt-4 text-xs text-gray-500">
            We typically respond within 1–2 business days.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default ContactView;
