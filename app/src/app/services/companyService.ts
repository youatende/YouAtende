import api from "./api";
import { PlanFeatures } from "../hooks/usePlanFeatures";

export async function getPlanFeatures(): Promise<PlanFeatures> {
  const { data } = await api.get<PlanFeatures>("/company/plan");
  return data;
}
