import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { claim_id } = await req.json();
    if (!claim_id) {
      return new Response(JSON.stringify({ error: "claim_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch the claim
    const { data: claim, error: claimError } = await supabase
      .from("refund_claims")
      .select("*")
      .eq("id", claim_id)
      .single();

    if (claimError || !claim) {
      return new Response(JSON.stringify({ error: "Claim not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch taxpayer profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", claim.taxpayer_id)
      .single();

    // Fetch all active risk parameters
    const { data: parameters } = await supabase
      .from("risk_parameters")
      .select("*")
      .eq("is_active", true);

    // Fetch taxpayer's claim history
    const { data: claimHistory } = await supabase
      .from("refund_claims")
      .select("*")
      .eq("taxpayer_id", claim.taxpayer_id)
      .order("created_at", { ascending: false });

    // Fetch category benchmarks
    const { data: benchmarks } = await supabase
      .from("category_benchmarks")
      .select("*")
      .eq("business_category", profile?.business_category || "general")
      .limit(1)
      .maybeSingle();

    // ─── Calculate risk scores per parameter ───
    const totalClaims = claimHistory?.length || 1;
    const avgClaimAmount =
      (claimHistory || []).reduce((s, c) => s + Number(c.claim_amount), 0) /
      totalClaims;
    const claimAmount = Number(claim.claim_amount);
    const registrationAge = profile?.registration_date
      ? Math.floor(
          (Date.now() - new Date(profile.registration_date).getTime()) /
            (1000 * 60 * 60 * 24 * 365)
        )
      : 0;
    const rejectedClaims = (claimHistory || []).filter(
      (c) => c.status === "rejected"
    ).length;

    const assessmentDetails: Record<
      string,
      { score: number; weight: number; weighted: number; reason: string }
    > = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const param of parameters || []) {
      let rawScore = 0; // 0-100, higher = riskier
      let reason = "";

      switch (param.parameter_code) {
        // ── Financial parameters ──
        case "REF_REV_RATIO":
          rawScore = claimAmount > 10_000_000 ? 80 : claimAmount > 1_000_000 ? 50 : 20;
          reason = `Claim amount ETB ${claimAmount.toLocaleString()}`;
          break;
        case "CLAIM_VAR":
          const variance = avgClaimAmount > 0 ? Math.abs(claimAmount - avgClaimAmount) / avgClaimAmount : 0;
          rawScore = variance > 2 ? 90 : variance > 1 ? 60 : variance > 0.5 ? 35 : 15;
          reason = `${(variance * 100).toFixed(0)}% variance from average`;
          break;
        case "INV_MATCH":
          rawScore = 20; // Default low risk (would need actual invoice data)
          reason = "Pending invoice verification";
          break;
        case "BANK_CONSIST":
          rawScore = 25;
          reason = "Bank verification pending";
          break;
        case "CASH_FLOW":
          rawScore = claimAmount > avgClaimAmount * 3 ? 70 : 20;
          reason = claimAmount > avgClaimAmount * 3 ? "Unusual cash flow pattern" : "Normal pattern";
          break;
        case "REV_TREND":
          rawScore = 25;
          reason = "Revenue trend analysis pending";
          break;
        case "CREDIT_HIST":
          rawScore = rejectedClaims > 2 ? 70 : rejectedClaims > 0 ? 40 : 10;
          reason = `${rejectedClaims} rejected claims in history`;
          break;
        case "REG_AGE":
          rawScore = registrationAge < 1 ? 80 : registrationAge < 3 ? 40 : 10;
          reason = `${registrationAge} year(s) registered`;
          break;
        case "SUPP_VERIFY":
          rawScore = 30;
          reason = "Supplier verification pending";
          break;
        case "CUST_VERIFY":
          rawScore = 30;
          reason = "Customer verification pending";
          break;
        case "RELATED_TRANS":
          rawScore = 20;
          reason = "No related party flags detected";
          break;

        // ── Compliance parameters ──
        case "AUDIT_HIST":
          rawScore = rejectedClaims > 3 ? 85 : rejectedClaims > 1 ? 50 : 15;
          reason = `Past audit findings: ${rejectedClaims}`;
          break;
        case "LATE_FILE":
          rawScore = 20;
          reason = "Filing timeliness check pending";
          break;
        case "PENALTY_HIST":
          rawScore = rejectedClaims > 2 ? 60 : 15;
          reason = `${rejectedClaims} penalties on record`;
          break;
        case "PAY_COMPLY":
          rawScore = 15;
          reason = "Payment compliance satisfactory";
          break;
        case "DOC_QUAL":
          rawScore = 25;
          reason = "Document quality assessment pending";
          break;
        case "DECL_ACC":
          rawScore = 20;
          reason = "Declaration accuracy check pending";
          break;
        case "AMEND_FREQ":
          rawScore = 20;
          reason = "Amendment frequency normal";
          break;
        case "VAT_FREQ":
          rawScore = 15;
          reason = "VAT return frequency normal";
          break;
        case "EXPORT_DOC":
          rawScore = 25;
          reason = "Export documentation pending review";
          break;
        case "IMPORT_DUTY":
          rawScore = 20;
          reason = "Import duty compliance pending";
          break;

        // ── Behavioral parameters ──
        case "CLAIM_FREQ":
          rawScore = totalClaims > 10 ? 70 : totalClaims > 5 ? 40 : 15;
          reason = `${totalClaims} total claims filed`;
          break;
        case "SEASON_CLAIM":
          rawScore = 20;
          reason = "No unusual seasonal patterns";
          break;
        case "DATA_QUAL":
          rawScore = profile?.business_name ? 15 : 50;
          reason = profile?.business_name ? "Complete profile data" : "Incomplete profile data";
          break;
        case "LAST_MIN":
          rawScore = 15;
          reason = "Filing timing normal";
          break;
        case "RESP_TIME":
          rawScore = 10;
          reason = "Good response time";
          break;
        case "COOP_SCORE":
          rawScore = 10;
          reason = "Cooperative taxpayer";
          break;
        case "VOL_DISCL":
          rawScore = 5; // Negative weight = reduces risk
          reason = "No voluntary disclosures";
          break;
        case "DIGITAL_FILE":
          rawScore = 10;
          reason = "Digital filing used";
          break;
        case "SUPPORT_HIST":
          rawScore = 15;
          reason = "Normal support request pattern";
          break;

        // ── Industry & geographic parameters ──
        case "IND_RISK":
          rawScore = 30;
          reason = `Industry: ${profile?.business_category || "unclassified"}`;
          break;
        case "GEO_RISK":
          rawScore = 25;
          reason = `Region: ${profile?.business_address || "unknown"}`;
          break;
        case "PEER_COMP":
          if (benchmarks) {
            const benchAvg = Number(benchmarks.avg_refund_amount) || 100000;
            rawScore = claimAmount > benchAvg * 2 ? 70 : claimAmount > benchAvg ? 40 : 15;
            reason = `Peer avg: ETB ${benchAvg.toLocaleString()}`;
          } else {
            rawScore = 30;
            reason = "No peer benchmark data available";
          }
          break;
        case "CROSS_BORDER":
          rawScore = 20;
          reason = "Cross-border check pending";
          break;
        case "BIZ_SIZE":
          rawScore = claimAmount > 5_000_000 ? 50 : 20;
          reason = claimAmount > 5_000_000 ? "Large business claim" : "Standard business claim";
          break;
        case "MARKET_COND":
          rawScore = 20;
          reason = "Normal market conditions";
          break;
        case "TAX_INCENTIVE":
          rawScore = 15;
          reason = "No special incentive flags";
          break;
        case "OWNERSHIP":
          rawScore = 20;
          reason = "Ownership structure check pending";
          break;
        case "MULTI_REG":
          rawScore = 15;
          reason = "No multiple registration flags";
          break;

        default:
          rawScore = 25;
          reason = `Default assessment for ${param.parameter_name}`;
      }

      const weight = Number(param.weight);
      const weightedScore = rawScore * Math.abs(weight);
      // Negative weight means it reduces risk
      const effectiveWeighted = weight < 0 ? -weightedScore : weightedScore;

      assessmentDetails[param.parameter_code] = {
        score: rawScore,
        weight,
        weighted: effectiveWeighted,
        reason,
      };

      totalWeightedScore += effectiveWeighted;
      totalWeight += Math.abs(weight);
    }

    // Normalize to 0-100
    const riskScore = Math.max(0, Math.min(100, totalWeight > 0 ? totalWeightedScore / totalWeight : 50));

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" | "critical";
    let recommendation: string;

    if (riskScore <= 25) {
      riskLevel = "low";
      recommendation = "Auto-approve recommended. All risk indicators are within acceptable thresholds.";
    } else if (riskScore <= 50) {
      riskLevel = "medium";
      recommendation = "Partial audit recommended. Standard review by officer with spot-check on key financial documents.";
    } else if (riskScore <= 75) {
      riskLevel = "high";
      recommendation = "Full manual audit required by MoR Audit Team. All supporting documents must be verified against SIGTAS records.";
    } else {
      riskLevel = "critical";
      recommendation = "Critical risk — Immediate escalation to MoR Senior Audit Team. Full forensic audit of all transactions, supplier chains, and bank statements required.";
    }

    // Historical analysis
    const historicalAnalysis = {
      total_claims: totalClaims,
      avg_claim_amount: avgClaimAmount,
      rejected_claims: rejectedClaims,
      registration_age_years: registrationAge,
      business_category: profile?.business_category || "unclassified",
    };

    // Peer comparison
    const peerComparison = benchmarks
      ? {
          benchmark_avg_amount: benchmarks.avg_refund_amount,
          benchmark_approval_rate: benchmarks.avg_approval_rate,
          benchmark_sample_size: benchmarks.sample_size,
          claim_vs_benchmark_ratio: benchmarks.avg_refund_amount
            ? (claimAmount / Number(benchmarks.avg_refund_amount)).toFixed(2)
            : null,
        }
      : null;

    // Insert risk assessment
    const { data: assessment, error: insertError } = await supabase
      .from("risk_assessments")
      .insert({
        claim_id,
        risk_level: riskLevel,
        risk_score: Math.round(riskScore),
        recommendation,
        assessment_details: assessmentDetails,
        historical_analysis: historicalAnalysis,
        peer_comparison_data: peerComparison,
        auto_assessed: true,
        assessed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update claim status to risk_assessment
    await supabase
      .from("refund_claims")
      .update({ status: "risk_assessment", updated_at: new Date().toISOString() })
      .eq("id", claim_id);

    // Create workflow state entry
    await supabase.from("workflow_states").insert({
      claim_id,
      from_status: "submitted",
      to_status: "risk_assessment",
      action_type: "auto_risk_assessment",
      comments: `Auto-assessed: ${riskLevel.toUpperCase()} risk (score: ${Math.round(riskScore)}/100). ${recommendation}`,
    });

    // Route based on risk level
    let nextStatus = "risk_assessment";
    let routingComment = "";

    if (riskLevel === "low") {
      nextStatus = "approved";
      routingComment = "Low risk — auto-approved by system";
      await supabase
        .from("refund_claims")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", claim_id);
      await supabase.from("workflow_states").insert({
        claim_id,
        from_status: "risk_assessment",
        to_status: "approved",
        action_type: "auto_approve",
        comments: routingComment,
      });
    } else if (riskLevel === "medium") {
      nextStatus = "officer_review";
      routingComment = "Medium risk — routed to officer for partial audit";
      await supabase
        .from("refund_claims")
        .update({ status: "officer_review", updated_at: new Date().toISOString() })
        .eq("id", claim_id);
      await supabase.from("workflow_states").insert({
        claim_id,
        from_status: "risk_assessment",
        to_status: "officer_review",
        action_type: "route_partial_audit",
        comments: routingComment,
      });
    } else {
      // high or critical → full audit
      nextStatus = "under_review";
      routingComment = `${riskLevel === "critical" ? "Critical" : "High"} risk — assigned to MoR Audit Team for full manual audit`;
      await supabase
        .from("refund_claims")
        .update({ status: "under_review", updated_at: new Date().toISOString() })
        .eq("id", claim_id);
      await supabase.from("workflow_states").insert({
        claim_id,
        from_status: "risk_assessment",
        to_status: "under_review",
        action_type: "route_full_audit",
        comments: routingComment,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        risk_level: riskLevel,
        risk_score: Math.round(riskScore),
        recommendation,
        next_status: nextStatus,
        assessment_id: assessment.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Risk assessment error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
