import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://leigpmlspanqumxjipka.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlaWdwbWxzcGFucXVteGppcGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODY1OTIsImV4cCI6MjA5MjM2MjU5Mn0.J1nfZhWtjBILABjH6RnYcNAhAxpZGJST3_VPPT3YKek";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Commitment functions ──

export async function fetchCommitments() {
  const { data, error } = await supabase
    .from("commitments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function insertCommitment(commitment: {
  farmer_address: string;
  farmer_name: string;
  token: string;
  total_amount: number;
  crop_description: string;
  location: string;
  expected_harvest_date: string;
}) {
  const { data, error } = await supabase
    .from("commitments")
    .insert([commitment])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCommitmentFunded(id: string, buyerAddress: string) {
  const { error } = await supabase
    .from("commitments")
    .update({
      status: "Funded",
      buyer_address: buyerAddress,
      funded_at: new Date().toISOString(),
      milestones: { planting: true, midCrop: false, delivery: false },
    })
    .eq("id", id);

  if (error) throw error;
}

export async function updateMilestone(
  id: string,
  milestone: "planting" | "midCrop" | "delivery"
) {
  const { data: current } = await supabase
    .from("commitments")
    .select("milestones")
    .eq("id", id)
    .single();

  const updatedMilestones = { ...current?.milestones, [milestone]: true };
  const newStatus =
    milestone === "delivery"
      ? "Completed"
      : milestone === "midCrop"
        ? "MidCrop"
        : "Funded";

  const { error } = await supabase
    .from("commitments")
    .update({ milestones: updatedMilestones, status: newStatus })
    .eq("id", id);

  if (error) throw error;
}