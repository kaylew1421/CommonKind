import React from "react";

// Keep it local to avoid missing import errors
type View = "map" | "onboarding" | "contact" | "admin";

interface HeaderProps {
  view: View;
  setView: (v: View) => void;

  onOpenDonateModal: () => void;

  // admin auth
  onShowLogin: () => void;
  onLogout: () => void;
  isAdmin: boolean;

  // hub auth
  onOpenHubPortal: () => void;
  onHubLogout: () => void;
  hubAuthed?: { id: string; name: string } | null;

  // chat
  onOpenChat: () => void;

  // admin badge count
  pendingCount: number;
}

const Header: React.FC<HeaderProps> = ({
  view,
  setView,
  onOpenDonateModal,
  onShowLogin,
  onLogout,
  onOpenHubPortal,
  onHubLogout,
  hubAuthed,
  onOpenChat,
  isAdmin,
  pendingCount,
}) => {
  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-teal-600 grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor" aria-hidden="true">
              <path d="M12 21s-6-5.19-8.485-7.676A6 6 0 1112 5a6 6 0 118.485 8.324C18 15.81 12 21 12 21z" />
            </svg>
          </div>
          <button
            className="text-lg font-semibold"
            onClick={() => setView("map")}
            aria-label="Go to map"
          >
            CommonKind
          </button>
        </div>

        {/* Left nav */}
        <nav className="flex items-center gap-2 ml-4">
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
          <button
            onClick={() => setView("contact")}
            className={`px-3 py-2 rounded ${view === "contact" ? "bg-teal-50 text-teal-700" : "hover:bg-gray-50"}`}
          >
            Contact
          </button>
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onOpenDonateModal}
            className="px-4 py-2 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700"
          >
            Donate
          </button>

          {!isAdmin ? (
            <button
              onClick={onShowLogin}
              className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50"
            >
              Admin Login
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50"
            >
              Logout (Admin)
            </button>
          )}

          {!hubAuthed ? (
            <button
              onClick={onOpenHubPortal}
              className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50"
            >
              Hub Login
            </button>
          ) : (
            <button
              onClick={onHubLogout}
              title={`Logged in as ${hubAuthed.name}`}
              className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50"
            >
              Logout (Hub)
            </button>
          )}

          {/* Chat */}
          <button
            type="button"
            onClick={onOpenChat}
            className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white hover:bg-teal-700 focus:outline-none"
            aria-label="Open chat"
            title="Chat"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path
                d="M4 7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H9l-4 3v-3.5A3.5 3.5 0 0 1 4 13V7Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="10" r="1" fill="currentColor" />
              <circle cx="12" cy="10" r="1" fill="currentColor" />
              <circle cx="15" cy="10" r="1" fill="currentColor" />
            </svg>
          </button>

          {/* Admin tab (only when logged in) */}
          {isAdmin && (
            <button
              onClick={() => setView("admin")}
              className={`ml-2 px-3 py-2 rounded ${view === "admin" ? "bg-teal-50 text-teal-700" : "hover:bg-gray-50"}`}
            >
              Admin{" "}
              {pendingCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-teal-600 text-white text-xs px-1.5">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
