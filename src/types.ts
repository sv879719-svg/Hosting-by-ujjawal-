export interface Plan {
  name: string;
  price: string;
  durationSeconds: number; // Duration for this plan
  features: string[];
}

export type PaymentStatus = "none" | "pending" | "approved";
