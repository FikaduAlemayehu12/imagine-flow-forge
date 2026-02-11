import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type RefundClaim = Tables<"refund_claims">;
export type ClaimStatus = RefundClaim["status"];
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ClaimWithRisk extends RefundClaim {
  risk_level?: RiskLevel | null;
  risk_score?: number | null;
}

// Hook for staff to view all claims with risk data
export const useAllClaims = () => {
  return useQuery({
    queryKey: ["all_claims"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("refund_claims")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch risk assessments for all claims
      const claimIds = (data || []).map((c) => c.id);
      let riskMap: Record<string, { risk_level: RiskLevel; risk_score: number }> = {};

      if (claimIds.length > 0) {
        const { data: risks } = await supabase
          .from("risk_assessments")
          .select("claim_id, risk_level, risk_score")
          .in("claim_id", claimIds)
          .order("assessed_at", { ascending: false });

        if (risks) {
          for (const r of risks) {
            if (!riskMap[r.claim_id]) {
              riskMap[r.claim_id] = { risk_level: r.risk_level as RiskLevel, risk_score: r.risk_score };
            }
          }
        }
      }

      return (data || []).map((claim) => ({
        ...claim,
        risk_level: riskMap[claim.id]?.risk_level ?? null,
        risk_score: riskMap[claim.id]?.risk_score ?? null,
      })) as ClaimWithRisk[];
    },
  });
};

// Hook for claims filtered by status
export const useClaimsByStatus = (statuses: ClaimStatus[]) => {
  return useQuery({
    queryKey: ["claims_by_status", statuses],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("refund_claims")
        .select("*")
        .in("status", statuses)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const claimIds = (data || []).map((c) => c.id);
      let riskMap: Record<string, { risk_level: RiskLevel; risk_score: number }> = {};

      if (claimIds.length > 0) {
        const { data: risks } = await supabase
          .from("risk_assessments")
          .select("claim_id, risk_level, risk_score")
          .in("claim_id", claimIds)
          .order("assessed_at", { ascending: false });

        if (risks) {
          for (const r of risks) {
            if (!riskMap[r.claim_id]) {
              riskMap[r.claim_id] = { risk_level: r.risk_level as RiskLevel, risk_score: r.risk_score };
            }
          }
        }
      }

      return (data || []).map((claim) => ({
        ...claim,
        risk_level: riskMap[claim.id]?.risk_level ?? null,
        risk_score: riskMap[claim.id]?.risk_score ?? null,
      })) as ClaimWithRisk[];
    },
    enabled: statuses.length > 0,
  });
};

// Hook to update claim status
export const useUpdateClaimStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ claimId, status }: { claimId: string; status: ClaimStatus }) => {
      const { data, error } = await supabase
        .from("refund_claims")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", claimId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all_claims"] });
      queryClient.invalidateQueries({ queryKey: ["claims_by_status"] });
      queryClient.invalidateQueries({ queryKey: ["refund_claims"] });
    },
  });
};

// Get claims statistics for staff
export const useClaimsStats = () => {
  const { data: claims = [], isLoading } = useAllClaims();

  const stats = {
    total: claims.length,
    submitted: claims.filter((c) => c.status === "submitted").length,
    underReview: claims.filter((c) => c.status === "under_review").length,
    riskAssessment: claims.filter((c) => c.status === "risk_assessment").length,
    officerReview: claims.filter((c) => c.status === "officer_review").length,
    supervisorApproval: claims.filter((c) => c.status === "supervisor_approval").length,
    approved: claims.filter((c) => c.status === "approved").length,
    rejected: claims.filter((c) => c.status === "rejected").length,
    paid: claims.filter((c) => c.status === "paid").length,
    paymentProcessing: claims.filter((c) => c.status === "payment_processing").length,
    totalAmount: claims.reduce((sum, c) => sum + Number(c.claim_amount), 0),
    approvedAmount: claims
      .filter((c) => c.status === "approved" || c.status === "paid")
      .reduce((sum, c) => sum + Number(c.claim_amount), 0),
  };

  return { stats, isLoading };
};
