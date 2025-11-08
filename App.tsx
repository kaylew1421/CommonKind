// App.tsx
import React, { useEffect, useState, useCallback } from "react";
import type { Hub, Voucher, HubApplication, Donation, ActivityEvent } from "./types";
import { MOCK_HUBS } from "./constants";

import Header from "./frontend/components/Header";
import MapContainer from "./frontend/components/MapContainer";
import HubDetailView from "./frontend/components/HubDetailView";
import HubScannerView from "./frontend/components/HubScannerView";
import HubOnboardingView from "./frontend/components/HubOnboardingView";
import AdminDashboard from "./frontend/components/AdminDashboard";
import VoucherModal from "./frontend/components/VoucherModal";
import DonateModal from "./frontend/components/DonateModal";

import { fetchHubs, issueVoucher } from "./lib/api";

type View = "map" | "hubDetail" | "scanner" | "onboarding" | "admin";

const zipToLatLng = (addr: string): [number, number] => {
  const zipMatch = addr.match(/(\d{5})(?:-\d{4})?$/);
  const zip = zipMatch ? zipMatch[1] : "";
  if (zip === "76009") return [32.4057, -97.2136];
  if (zip === "76028") return [32.536, -97.325];
  return [32.4057, -97.2136];
};

export default function App() {
  const [view, setView] = useState<View>("map");

  // ---------- Hubs ----------
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
    return () => { mounted = false; };
  }, []);

  // ---------- Applications (persist) ----------
  const [applications, setApplications] = useState<HubApplication[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem("ck_apps");
    if (saved) { try { setApplications(JSON.parse(saved)); } catch {} }
  }, []);
  useEffect(() => { localStorage.setItem("ck_apps", JSON.stringify(applications)); }, [applications]);

  // ---------- Donations / Activity / Redeems ----------
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [redeemLog, setRedeemLog] = useState<Array<{ hubId: string; createdAt: number }>>([]);

  const logActivity = useCallback((type: ActivityEvent["type"], message: string) => {
    setActivity(prev => [{ id: "ACT-" + Date.now() + Math.random(), type, createdAt: Date.now(), message }, ...prev].slice(0, 80));
  }, []);

  // ---------- Selection / Modals ----------
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);
  const [isDonateModalOpen, setDonateModalOpen] = useState(false);
  const [donationHub, setDonationHub] = useState<Hub | null>(null);

  const handleSelectHub = useCallback((hub: Hub) => { setSelectedHub(hub); setView("hubDetail"); }, []);
  const handleBackToMap = useCallback(() => { setSelectedHub(null); setView("map"); }, []);
  const handleOpenDonateModal = (hub: Hub | null) => { setDonationHub(hub); setDonateModalOpen(true); };

  // ---------- Redeem (declare BEFORE use) ----------
  const handleRedeemVoucher = useCallback((voucherId: string) => {
    const v = activeVoucher;
    if (!v || v.id !== voucherId) return false;

    setHubs(prev =>
      prev.map(h =>
        h.id === v.hubId
          ? { ...h, vouchersRemaining: Math.max(0, Number(h.vouchersRemaining || 0) - 1) }
          : h
      )
    );

    const hubName = hubs.find(h => h.id === v.hubId)?.name ?? "Hub";
    setRedeemLog(prev => [{ hubId: v.hubId, createdAt: Date.now() }, ...prev]);
    logActivity("voucher_redeemed", `Voucher redeemed at ${hubName}.`);
    return true;
  }, [activeVoucher, hubs, logActivity]);

  // ---------- Use voucher (5s mock timer) ----------
  const handleUseVoucher = useCallback((voucherId: string) => {
    setTimeout(() => {
      handleRedeemVoucher(voucherId);
      setActiveVoucher(null);
      setView("map");
    }, 5000);
    return true; // <- your VoucherModal expects boolean
  }, [handleRedeemVoucher]);

  // ---------- Issue voucher ----------
  const handleGetVoucher = useCallback(async (hub: Hub) => {
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
      logActivity("voucher_issued" as ActivityEvent["type"], `Voucher issued for ${hub.name}.`);
    } catch {
      setActiveVoucher({
        id: `VOUCHER-${Date.now()}`,
        hubId: hub.id,
        status: "issued",
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      });
      logActivity("voucher_issued" as ActivityEvent["type"], `Voucher issued for ${hub.name}.`);
    }
  }, [logActivity]);

  // ---------- Donations ----------
  const handleDonation = useCallback((amount: number, hub: Hub | null) => {
    setDonations(prev => [{ id: "DON-" + Date.now(), hubId: hub?.id ?? "general", amount, createdAt: Date.now() }, ...prev]);
    const msg = `Donation of ${amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}${hub ? ` to ${hub.name}` : ""}.`;
    logActivity("donation", msg as ActivityEvent["type"] & string);
  }, [logActivity]);

  // ---------- Become-a-Hub submission ----------
  const handleSubmitApplication = useCallback((input: {
    businessName: string; address: string; phone: string; offer: string; dailyCap: number; email: string;
  }) => {
    const app: HubApplication = {
      id: "APP-" + Date.now(),
      businessName: input.businessName, address: input.address, phone: input.phone,
      offer: input.offer, dailyCap: input.dailyCap, email: input.email,
      createdAt: new Date().toISOString(), status: "pending",
    };
    setApplications(prev => [app, ...prev]);
    logActivity("application_submitted", `New Hub Application from ${input.businessName}.`);
    setView("admin");
  }, [logActivity]);

  const handleRejectApp = useCallback((id: string) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" } : a));
  }, []);

  const handleApproveApp = useCallback((id: string, hubType: Hub["type"]) => {
    setApplications(prev => {
      const found = prev.find(a => a.id === id);
      if (!found) return prev;
      const [lat, lng] = zipToLatLng(found.address);
      const newHub: Hub = {
        id: "hub-" + Date.now(),
        name: found.businessName, address: found.address, lat, lng,
        hours: "TBD", offer: found.offer,
        dailyCap: found.dailyCap, vouchersRemaining: found.dailyCap,
        type: hubType, phone: found.phone,
        requirements: ["Photo ID (any)", "Self-attest financial need"],
        selfAttestation: true,
      };
      setHubs(hs => [newHub, ...hs]);
      logActivity("hub_approved", `Hub approved: ${found.businessName}.`);
      return prev.map(a => a.id === id ? { ...a, status: "approved" } : a);
    });
    setView("map");
  }, [logActivity]);

  // ---------- Metrics ----------
  const totalDonations = donations.reduce((s, d) => s + d.amount, 0);
  const redeemed24h = redeemLog.filter(r => (Date.now() - r.createdAt) < 24 * 60 * 60 * 1000).length;
  const mealsFunded = redeemLog.length;

  // ---------- View routing ----------
  const renderView = () => {
    switch (view) {
      case "hubDetail": {
        if (!selectedHub) return null;
        const h = hubs.find(x => x.id === selectedHub.id) ?? selectedHub;
        return (
          <HubDetailView
            hub={h}
            onBack={handleBackToMap}
            onGetVoucher={handleGetVoucher}
            onDonate={handleOpenDonateModal}
          />
        );
      }
      case "scanner":
        return <HubScannerView onVoucherRedeemed={(id) => handleRedeemVoucher(id)} />;

      case "onboarding":
        return <HubOnboardingView onBack={() => setView("map")} onSubmit={handleSubmitApplication} />;

      case "admin":
        return (
          <AdminDashboard
            hubs={hubs}
            applications={applications}
            activity={activity}
            metrics={{
              totalDonations,
              activeHubs: hubs.length,
              pendingApprovals: applications.filter(a => a.status === "pending").length,
              redeemed24h
            }}
            onApprove={handleApproveApp}
            onReject={handleRejectApp}
            onCreateHub={(input) => {
              const hub: Hub = { ...input, id: "hub-" + Date.now() };
              setHubs(prev => [hub, ...prev]);
              logActivity("hub_created", `Hub created: ${hub.name}.`);
            }}
            onUpdateHub={(id, updates) => {
              setHubs(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
              const h = hubs.find(x => x.id === id);
              if (h) logActivity("hub_updated", `Hub updated: ${h.name}.`);
            }}
            onDeleteHub={(id) => {
              const h = hubs.find(x => x.id === id);
              setHubs(prev => prev.filter(hh => hh.id !== id));
              if (h) logActivity("hub_deleted", `Hub deleted: ${h.name}.`);
            }}
            onBackToMap={() => setView("map")}
          />
        );

      case "map":
      default:
        return (
          <MapContainer
            hubs={hubs}
            onSelectHub={(hub) => { setSelectedHub(hub); setView("hubDetail"); }}
            onDonate={handleOpenDonateModal}
            metrics={{ totalDonations, mealsFunded, redeemedToday: redeemed24h }}
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
        pendingCount={applications.filter(a => a.status === "pending").length}
      />

      <main className="flex-grow flex flex-col">{renderView()}</main>

      {activeVoucher && (
        <VoucherModal
          voucher={activeVoucher}
          hub={hubs.find(h => h.id === activeVoucher.hubId) || null}
          onUseVoucher={() => handleUseVoucher(activeVoucher.id)} // returns boolean
          onClose={() => setActiveVoucher(null)}
        />
      )}

      {isDonateModalOpen && (
        <DonateModal
          hub={donationHub}
          onDonate={(payload) => {
            const hub = payload.hubId ? hubs.find(h => h.id === payload.hubId) ?? null : donationHub;
            handleDonation(payload.amount, hub);
          }}
          onClose={() => setDonateModalOpen(false)}
        />
      )}
    </div>
  );
}
