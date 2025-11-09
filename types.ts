// types.ts
export type RequirementItem = string | { label: string; optional?: boolean };

export interface Hub {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours: string;
  offer: string;
  dailyCap: number;
  vouchersRemaining: number;
  type: 'Restaurant' | 'Grocery' | 'Church' | 'Library';
  phone: string;
  requirements?: RequirementItem[];
  selfAttestation?: boolean;
}

export interface Voucher {
  id: string;
  hubId: string;
  status: 'issued' | 'redeemed' | 'expired';
  issuedAt: Date;
  expiresAt: Date;
  /** Number of people covered (household size). Defaults to 1. */
  quantity?: number; // <-- NEW
}

export interface HubApplication {
  id: string;
  businessName: string;
  address: string;
  phone: string;
  offer: string;
  dailyCap: number;
  email: string;
  createdAt: string; // ISO
  status: 'pending' | 'approved' | 'rejected';
}

export interface Donation {
  id: string;
  hubId: string; // 'general' if not tied to a hub
  amount: number;
  createdAt: number; // epoch ms
}

export type ActivityEventType =
  | 'donation'
  | 'voucher_issued'     // <-- NEW
  | 'voucher_redeemed'
  | 'application_submitted'
  | 'hub_approved'
  | 'hub_created'
  | 'hub_updated'
  | 'hub_deleted'
  | 'fraud_flag'
  | 'fraud_resolved';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  createdAt: number;
  message: string;
}

export interface FraudFlag {
  id: string;
  hubId: string;
  hubName: string;
  title: string;     // e.g., "High redemption velocity"
  details?: string;  // optional text
  status: 'open' | 'resolved';
  createdAt: number;
}
