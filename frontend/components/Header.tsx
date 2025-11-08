// frontend/components/Header.tsx
import React from "react";

type View = "map" | "hubDetail" | "scanner" | "onboarding" | "admin";

interface HeaderProps {
  view: View;
  setView: (v: View) => void;
  onOpenDonateModal: () => void;

  // Admin gate
  isAdmin: boolean;
  pendingCount: number;

  onShowLogin: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  view,
  setView,
  onOpenDonateModal,
  isAdmin,
  pendingCount,
  onShowLogin,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-teal-600 grid place-items-center">
            {/* simple heart-pin glyph */}
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
              <path d="M12 21s-6-5.19-8.485-7.676A6 6 0 1112 5a6 6 0 118.485 8.324C18 15.81 12 21 12 21z"/>
            </svg>
          </div>
          <button className="text-lg font-semibold" onClick={() => setView("map")}>
            CommonKind
          </button>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setView("map")}
            className={`px-3 py-2 rounded ${view === "map" ? "bg-teal-50 text-teal-700" : "hover:bg-gray-50"}`}
          >
            Map
          </button>
          <button
            onClick={() => setView("onboarding")}
            className={`px-3 py-2 rounded ${view === "onboarding" ? "bg-teal-50 text-teal-700" : "hover:bg-gray-50"}`}
          >
            Become a Hub
          </button>

          {/* Admin tab only when logged in */}
          {isAdmin && (
            <button
              onClick={() => setView("admin")}
              className={`px-3 py-2 rounded ${view === "admin" ? "bg-teal-50 text-teal-700" : "hover:bg-gray-50"}`}
            >
              Admin {pendingCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-teal-600 text-white text-xs px-1.5">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDonateModal}
            className="px-4 py-2 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700"
          >
            Donate
          </button>

          {!isAdmin ? (
            <button onClick={onShowLogin} className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50">
              Admin Login
            </button>
          ) : (
            <button onClick={onLogout} className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50">
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
