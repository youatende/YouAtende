import api from './api';
import { PlanFeatures } from '../hooks/usePlanFeatures';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: PlanFeatures;
  createdAt: string;
}

export const listPlans = async (): Promise<Plan[]> => {
  const response = await api.get('/plans');
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.plans)) return data.plans;
  return [];
};

export const createPlan = (plan: {
  name: string;
  description: string;
  price: number;
  features: PlanFeatures;
}): Promise<Plan> =>
  api.post('/plans', plan).then(res => res.data);

export const updatePlan = (id: string, plan: Partial<Plan>): Promise<void> =>
  api.put(`/plans/${id}`, plan);

export const deletePlan = (id: string): Promise<void> =>
  api.delete(`/plans/${id}`);
