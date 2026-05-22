import { useEffect, useState } from "react";
import api from "../services/api";

export interface PlanFeatures {
  maxUsers: number;
  maxWhatsAppSessions: number;
  maxTeams: number;
  maxFlows: number;
  campaigns: boolean;
  reports: boolean;
  integrations: boolean;
}

export function usePlanFeatures() {
  const [features, setFeatures] = useState<PlanFeatures | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/company/plan")
      .then(res => setFeatures(res.data))
      .catch(() => setFeatures(null))
      .finally(() => setLoading(false));
  }, []);

  return { features, loading };
}
