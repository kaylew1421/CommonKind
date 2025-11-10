// App.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Hub, Voucher, HubApplication, Donation, ActivityEvent } from "./types";
import type { View } from "./view";
import { MOCK_HUBS } from "./constants";

import Header from "./components/Header";
import MapContainer from "./components/MapContainer";
import HubDetailView from "./components/HubDetailView";
import HubScannerView from "./components/HubScannerView";
import HubOnboardingView from "./components/HubOnboardingView";
import AdminDashboard from "./components/AdminDashboard";
import VoucherModal from "./components/VoucherModal";
import DonateModal from "./components/DonateModal";
import AdminLoginModal from "./components/AdminLoginModal";
import HubPortal from "./components/HubPortal";

import {
  fetchHubs,
  issueVoucher,
  redeemVoucher,
  adminMe,
  askAi, // <-- chat endpoint
} from "./lib/api";
import { isAuthed, getToken, clearToken } from "./lib/auth";

/* ------------------------ Family size modal ------------------------ */
function FamilySizeModal({
  open,
  onCancel,
  onConfirm,
  defaultNotes = "",
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: (size: number, notes: string) => void;
  defaultNotes?: string;
}) {
  const [size, setSize] = useState<number>(1);
  const [notes, setNotes] = useState<string>(defaultNotes);

  useEffect(() => {
    if (open) {
      setSize(1);
      setNotes(defaultNotes);
    }
  }, [open, defaultNotes]);

  if (!open) return null;
  const valid = Number.isFinite(size) && size >= 1 && size <= 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-xl bg-white shadow-xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Family size</h2>
          <p className="mt-1 text-sm text-gray-500">This helps us estimate meals at the hub.</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <label className="block text-sm font-medium text-gray-700">Number of people</label>
          <input
            type="number"
            min={1}
            max={12}
            value={size}
            onChange={(e) =>
              setSize(Math.max(1, Math.min(12, Number(e.target.value) || 1)))
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
          <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., vegetarian, no nuts"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
          <p className="text-xs text-gray-500">
            We issue one demo voucher; size is logged for impact + planning.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t">
          <button
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-teal-700"
            disabled={!valid}
            onClick={() => onConfirm(size, notes.trim())}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------ Tiny chat panel (Gemini via /api/ai) ------------------------ */
function ChatPanel({
  open,
  onClose,
  hubs,
}: {
  open: boolean;
  onClose: () => void;
  hubs: Hub[];
}) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<{ from: "bot" | "you"; text: string; ts: number }[]>([
    { from: "bot", text: "Hi! I’m the CK helper. Ask about vouchers, hubs, or scanning.", ts: Date.now() },
  ]);
  if (!open) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setMessages((m) => [...m, { from: "you", text, ts: Date.now() }]);
    setInput("");
    setBusy(true);
    try {
      const r = await askAi(text, hubs, "en");
      const reply =
        (r?.answer && String(r.answer)) ||
        "Sorry—no answer right now.";
      setMessages((m) => [...m, { from: "bot", text: reply, ts: Date.now() }]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Server error. Please try again.", ts: Date.now() },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl flex flex-col">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">CK Chat</div>
          <button
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.ts} className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  m.from === "you" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
          />
          <button
            onClick={send}
            disabled={busy}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {busy ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Helpers -------------------------------- */
const zipToLatLng = (addr: string): [number, number] => {
  const zipMatch = addr.match(/(\d{5})(?:-\d{4})?$/);
  const zip = zipMatch ? zipMatch[1] : "";
  if (zip === "76009") return [32.4057, -97.2136];
  if (zip === "76028") return [32.536, -97.325];
  return [32.4057, -97.2136];
};

export default function App() {
  const [view, setView] = useState<View>("map");

  // Chat & portals
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false); // admin login
  const [hubPortalOpen, setHubPortalOpen] = useState<boolean>(false);

  // Admin auth
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      if (!isAuthed()) return;
      try {
        await adminMe(getToken() || undefined);
        setIsAdmin(true);
      } catch {
        clearToken();
        setIsAdmin(false);
      }
    })();
  }, []);
  useEffect(() => {
    if (view === "admin" && !isAdmin) setShowLogin(true);
  }, [view, isAdmin]);

  // Hubs
  const [hubs, setHubs] = useState<Hub[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchHubs();
        if (mounted && Array.isArray(data) && data.length) setHubs(data);
        else if (mounted) setHubs(MOCK_HUBS);
      } catch {
        if (mounted) setHubs(MOCK_HUBS);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Hub session
  const [authedHubId, setAuthedHubId] = useState<string | null>(null);
  const authedHub = useMemo(
    () => hubs.find((h) => h.id === authedHubId) || null,
    [authedHubId, hubs]
  );

  // Applications (persist)
  const [applications, setApplications] = useState<HubApplication[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem("ck_apps");
    if (saved) {
      try {
        setApplications(JSON.parse(saved));
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("ck_apps", JSON.stringify(applications));
  }, [applications]);

  // Donations / Activity / Redeems
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [redeemLog, setRedeemLog] = useState<Array<{ hubId: string; createdAt: number }>>([]);

  const logActivity = useCallback((type: ActivityEvent["type"], message: string) => {
    setActivity((prev) =>
      [{ id: "ACT-" + Date.now() + Math.random(), type, createdAt: Date.now(), message }, ...prev].slice(0, 80)
    );
  }, []);

  // Selection / Modals
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);
  const [isDonateModalOpen, setDonateModalOpen] = useState<boolean>(false);
  const [donationHub, setDonationHub] = useState<Hub | null>(null);

  // Family size ask-before-issue
  const [familyAskOpen, setFamilyAskOpen] = useState<boolean>(false);
  const [familyAskHub, setFamilyAskHub] = useState<Hub | null>(null);

  const handleSelectHub = useCallback((hub: Hub) => {
    setSelectedHub(hub);
    setView("hubDetail");
  }, []);
  const handleBackToMap = useCallback(() => {
    setSelectedHub(null);
    setView("map");
  }, []);
  const handleOpenDonateModal = (hub: Hub | null) => {
    setDonationHub(hub);
    setDonateModalOpen(true);
  };

  // Redeem
  const handleRedeemVoucher = useCallback(
    (voucherId: string) => {
      const v = activeVoucher;
      if (!v || v.id !== voucherId) return false;
      setHubs((prev) =>
        prev.map((h) =>
          h.id === v.hubId
            ? { ...h, vouchersRemaining: Math.max(0, Number(h.vouchersRemaining || 0) - 1) }
            : h
        )
      );
      const hubName = hubs.find((h) => h.id === v.hubId)?.name ?? "Hub";
      setRedeemLog((prev) => [{ hubId: v.hubId, createdAt: Date.now() }, ...prev]);
      logActivity("voucher_redeemed", `Voucher redeemed at ${hubName}.`);
      return true;
    },
    [activeVoucher, hubs, logActivity]
  );

  // Use voucher (call API, update UI)
  const handleUseVoucher = useCallback(
    async (voucherId: string) => {
      try {
        await redeemVoucher(voucherId);
      } catch {}
      return handleRedeemVoucher(voucherId);
    },
    [handleRedeemVoucher]
  );

  // Issue voucher (gated by family size modal)
  const openFamilyAsk = useCallback((hub: Hub) => {
    setFamilyAskHub(hub);
    setFamilyAskOpen(true);
  }, []);
  const proceedIssueVoucher = useCallback(
    async (hub: Hub, familySize: number, notes: string) => {
      try {
        const issued = await issueVoucher(hub.id);
        const v: Voucher = {
          id: issued?.id ?? `VOUCHER-${Date.now()}`,
          hubId: hub.id,
          status: "issued",
          issuedAt: new Date(),
          expiresAt: new Date(issued?.expiresAt ?? Date.now() + 2 * 60 * 60 * 1000),
        };
        setActiveVoucher(v);
        const noteText = notes ? ` (notes: ${notes})` : "";
        const headsUp = familySize > 1 ? ` Family of ${familySize}.` : "";
        logActivity("application_submitted", `Voucher issued for ${hub.name}.${headsUp}${noteText}`);
      } catch {
        setActiveVoucher({
          id: `VOUCHER-${Date.now()}`,
          hubId: hub.id,
          status: "issued",
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        });
        const noteText = notes ? ` (notes: ${notes})` : "";
        const headsUp = familySize > 1 ? ` Family of ${familySize}.` : "";
        logActivity("application_submitted", `Voucher issued for ${hub.name}.${headsUp}${noteText}`);
      }
    },
    [logActivity]
  );
  const handleFamilyConfirm = useCallback(
    (size: number, notes: string) => {
      const hub = familyAskHub;
      setFamilyAskOpen(false);
      if (!hub) return;
      void proceedIssueVoucher(hub, size, notes);
    },
    [familyAskHub, proceedIssueVoucher]
  );

  // Donations
  const handleDonation = useCallback(
    (amount: number, hub: Hub | null) => {
      setDonations((prev) => [{ id: "DON-" + Date.now(), hubId: hub?.id ?? "general", amount, createdAt: Date.now() }, ...prev]);
      const msg = `Donation of ${amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      })}${hub ? ` to ${hub.name}` : ""}.`;
      logActivity("donation", msg as ActivityEvent["type"] & string);
    },
    [logActivity]
  );

  // Become-a-Hub submission
  const handleSubmitApplication = useCallback(
    (input: {
      businessName: string;
      address: string;
      phone: string;
      offer: string;
      dailyCap: number;
      email: string;
    }) => {
      const app: HubApplication = {
        id: "APP-" + Date.now(),
        businessName: input.businessName,
        address: input.address,
        phone: input.phone,
        offer: input.offer,
        dailyCap: input.dailyCap,
        email: input.email,
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      setApplications((prev) => [app, ...prev]);
      logActivity("application_submitted", `New Hub Application from ${input.businessName}.`);
    },
    [logActivity]
  );

  const handleRejectApp = useCallback((id: string) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: "rejected" } : a)));
  }, []);
  const handleApproveApp = useCallback(
    (id: string, hubType: Hub["type"]) => {
      setApplications((prev) => {
        const found = prev.find((a) => a.id === id);
        if (!found) return prev;
        const [lat, lng] = zipToLatLng(found.address);
        const newHub: Hub = {
          id: "hub-" + Date.now(),
          name: found.businessName,
          address: found.address,
          lat,
          lng,
          hours: "TBD",
          offer: found.offer,
          dailyCap: found.dailyCap,
          vouchersRemaining: found.dailyCap,
          type: hubType,
          phone: found.phone,
          requirements: ["Photo ID (any)", "Self-attest financial need"],
          selfAttestation: true,
        };
        setHubs((hs) => [newHub, ...hs]);
        logActivity("hub_approved", `Hub approved: ${found.businessName}.`);
        return prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a));
      });
      setView("map");
    },
    [logActivity]
  );

  // Metrics
  const donationsForHub = useCallback(
    (hubId: string) => donations.filter((d) => d.hubId === hubId).reduce((s, d) => s + d.amount, 0),
    [donations]
  );
  const redemptionsForHub = useCallback(
    (hubId: string) => redeemLog.filter((r) => r.hubId === hubId).length,
    [redeemLog]
  );
  const getSinceDate = useCallback((_hubId: string) => "2024", []); // demo

  const totalDonations = donations.reduce((s, d) => s + d.amount, 0);
  const redeemed24h = redeemLog.filter((r) => Date.now() - r.createdAt < 24 * 60 * 60 * 1000).length;
  const mealsFunded = redeemLog.length;

  // Contact view
  const ContactView = () => (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Contact CommonKind</h2>
      <p className="text-gray-700">Questions? Reach out anytime.</p>
      <div className="mt-3 space-y-1">
        <div>
          📧{" "}
          <a className="text-teal-700 underline" href="mailto:kaylew1421@gmail.com">
            kaylew1421@gmail.com
          </a>
        </div>
        <div>
          📞{" "}
          <a className="text-teal-700 underline" href="tel:+18174716373">
            (817) 471-6373
          </a>
        </div>
      </div>
      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          alert("Thanks! We'll reply soon.");
        }}
      >
        <input className="w-full rounded-md border px-3 py-2" placeholder="Your name" required />
        <input className="w-full rounded-md border px-3 py-2" placeholder="Email" type="email" required />
        <textarea className="w-full rounded-md border px-3 py-2" rows={4} placeholder="Your message" required />
        <button className="rounded bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
          Send
        </button>
      </form>
    </div>
  );

  /* ---------- View routing ---------- */
  const renderView = () => {
    switch (view) {
      case "hubDetail": {
        if (!selectedHub) return null;
        const h = hubs.find((x) => x.id === selectedHub.id) ?? selectedHub;
        return (
          <HubDetailView
            hub={h}
            onBack={handleBackToMap}
            onGetVoucher={(hub) => openFamilyAsk(hub)}
            onDonate={handleOpenDonateModal}
          />
        );
      }
      case "scanner":
        return <HubScannerView onVoucherRedeemed={(id) => handleRedeemVoucher(id)} />;
      case "onboarding":
        return <HubOnboardingView onBack={() => setView("map")} onSubmit={handleSubmitApplication} />;
      case "admin":
        if (!isAdmin) {
          return (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-2">Admin</h2>
              <p className="text-gray-600">Please log in to access the dashboard.</p>
            </div>
          );
        }
        return (
          <AdminDashboard
            hubs={hubs}
            applications={applications}
            activity={activity}
            metrics={{
              totalDonations,
              activeHubs: hubs.length,
              pendingApprovals: applications.filter((a) => a.status === "pending").length,
              redeemed24h,
            }}
            onApprove={handleApproveApp}
            onReject={handleRejectApp}
            onCreateHub={(input) => {
              const hub: Hub = { ...input, id: "hub-" + Date.now() };
              setHubs((prev) => [hub, ...prev]);
              logActivity("hub_created", `Hub created: ${hub.name}.`);
            }}
            onUpdateHub={(id, updates) => {
              setHubs((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
              const h = hubs.find((x) => x.id === id);
              if (h) logActivity("hub_updated", `Hub updated: ${h.name}.`);
            }}
            onDeleteHub={(id) => {
              const h = hubs.find((x) => x.id === id);
              setHubs((prev) => prev.filter((hh) => hh.id !== id));
              if (h) logActivity("hub_deleted", `Hub deleted: ${h.name}.`);
            }}
            onBackToMap={() => setView("map")}
          />
        );
      case "contact":
        return <ContactView />;
      case "map":
      default:
        return (
          <MapContainer
            hubs={hubs}
            onSelectHub={(hub) => {
              setSelectedHub(hub);
              setView("hubDetail");
            }}
            onDonate={handleOpenDonateModal}
            metrics={{ totalDonations, mealsFunded, redeemed24h }}
          />
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col">
      <Header
        view={view}
        setView={setView}
        onOpenDonateModal={() => handleOpenDonateModal(null)}
        isAdmin={isAdmin}
        pendingCount={applications.filter((a) => a.status === "pending").length}
        onShowLogin={() => setShowLogin(true)}
        onLogout={() => {
          clearToken();
          setIsAdmin(false);
          if (view === "admin") setView("map");
        }}
        onOpenHubPortal={() => setHubPortalOpen(true)}
        onHubLogout={() => setAuthedHubId(null)}
        hubAuthed={authedHub ? { id: authedHub.id, name: authedHub.name } : null}
        onOpenChat={() => setChatOpen(true)}
      />

      <main className="flex-grow flex flex-col">{renderView()}</main>

      {/* Admin Login */}
      <AdminLoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onLoggedIn={() => {
          setIsAdmin(true);
          setShowLogin(false);
        }}
      />

      {/* Hub Portal */}
      <HubPortal
        open={hubPortalOpen}
        hubs={hubs}
        hub={authedHub}
        onClose={() => setHubPortalOpen(false)}
        onAuthed={(hubId) => setAuthedHubId(hubId)}
        onLogout={() => setAuthedHubId(null)}
        donationsForHub={authedHub ? donationsForHub(authedHub.id) : 0}
        redemptionsForHub={authedHub ? redemptionsForHub(authedHub.id) : 0}
        getSinceDate={getSinceDate}
        onManualRedeem={async (code: string) => {
          try {
            await redeemVoucher(code);
          } catch {}
          if (activeVoucher?.id === code) handleRedeemVoucher(code);
          return `Redeemed code ${code}`;
        }}
      />

      {/* Family size ask-before-issue */}
      <FamilySizeModal
        open={familyAskOpen}
        onCancel={() => setFamilyAskOpen(false)}
        onConfirm={(size, notes) => {
          const hub = familyAskHub;
          setFamilyAskOpen(false);
          if (hub) void proceedIssueVoucher(hub, size, notes);
        }}
      />

      {/* Voucher modal */}
      {activeVoucher && (
        <VoucherModal
          voucher={activeVoucher}
          hub={hubs.find((h) => h.id === activeVoucher.hubId) || null}
          onUseVoucher={(id) => handleUseVoucher(id)}
          onClose={() => setActiveVoucher(null)}
        />
      )}

      {/* Donate modal */}
      {isDonateModalOpen && (
        <DonateModal
          hub={donationHub}
          onDonate={(payload) => {
            const hub = payload.hubId ? hubs.find((h) => h.id === payload.hubId) ?? null : donationHub;
            handleDonation(payload.amount, hub);
          }}
          onClose={() => setDonateModalOpen(false)}
        />
      )}

      {/* Chat panel */}
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} hubs={hubs} />
    </div>
  );
}
