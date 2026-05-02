import { supabase } from "./client";

export interface ClaudeSession {
  id: string;
  skill_name: string;
  task_type: string;
  duration_minutes: number;
  tokens_used: number;
  hours_of_work_saved: number;
  bugs_prevented_count: number;
  description: string;
  status: "completed" | "in-progress" | "optimized";
  created_at: string;
}

export async function getClaudeSessions(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ClaudeSession[]> {
  if (!supabase) return [];

  let query = supabase
    .from("claude_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (startDate) {
    query = query.gte("created_at", startDate.toISOString());
  }

  if (endDate) {
    query = query.lte("created_at", endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Claude sessions:", error);
    return [];
  }

  return data || [];
}

export async function getAllClaudeSessions(
  startDate?: Date,
  endDate?: Date
): Promise<ClaudeSession[]> {
  if (!supabase) return [];

  let query = supabase
    .from("claude_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (startDate) {
    query = query.gte("created_at", startDate.toISOString());
  }

  if (endDate) {
    query = query.lte("created_at", endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching all Claude sessions:", error);
    return [];
  }

  return data || [];
}

export async function insertClaudeSession(
  userId: string,
  session: Omit<ClaudeSession, "id" | "created_at">
): Promise<ClaudeSession | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.from("claude_sessions").insert([
    {
      user_id: userId,
      ...session,
    },
  ]).select().single();

  if (error) {
    console.error("Error inserting Claude session:", error);
    return null;
  }

  return data;
}

export async function getTokenMetricsByDateRange(
  userId: string | null,
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  byDay: Record<string, number>;
  bySkill: Record<string, number>;
}> {
  if (!supabase) return { total: 0, byDay: {}, bySkill: {} };

  let query = supabase
    .from("claude_sessions")
    .select("tokens_used, skill_name, created_at");

  if (userId) {
    query = query.eq("user_id", userId);
  }

  query = query
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching token metrics:", error);
    return { total: 0, byDay: {}, bySkill: {} };
  }

  const byDay: Record<string, number> = {};
  const bySkill: Record<string, number> = {};
  let total = 0;

  (data || []).forEach((row: any) => {
    const date = new Date(row.created_at).toLocaleDateString();
    byDay[date] = (byDay[date] || 0) + row.tokens_used;
    bySkill[row.skill_name] = (bySkill[row.skill_name] || 0) + row.tokens_used;
    total += row.tokens_used;
  });

  return { total, byDay, bySkill };
}
