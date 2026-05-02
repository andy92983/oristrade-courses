"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/supabase/useAuth";
import { AuthGuard } from "../../../components/auth/AuthGuard";
import { getAllClaudeSessions, getTokenMetricsByDateRange } from "../../../lib/supabase/claude-sessions";

interface DashboardStats {
  totalSessions: number;
  totalHours: number;
  skillsUsed: Record<string, number>;
  tasksCompleted: Record<string, number>;
  hoursSaved: number;
  bugsPreventedShip: number;
  avgSessionDuration: number;
  mostUsedSkill: string;
  mostCommonTask: string;
}

interface Session {
  id: string;
  date: string;
  skill: string;
  taskType: string;
  duration: number;
  timelineHours: number;
  hoursOfWork: number;
  bugsPreventedCount: number;
  description: string;
  status: "completed" | "in-progress" | "optimized";
  tokensUsed: number;
}

interface TokenMetrics {
  day: number;
  week: number;
  month: number;
  total: number;
}

interface SkillMetrics {
  name: string;
  usageCount: number;
  totalTime: number;
  avgTime: number;
  successRate: number;
  issuesCaught: number;
}

type DateFilter = "today" | "week" | "month" | "all";

function StatCard({
  label,
  value,
  unit = "",
  trend = null,
}: {
  label: string;
  value: string | number;
  unit?: string;
  trend?: { up: boolean; percent: number } | null;
}) {
  return (
    <div className="card">
      <div className="text-brand-muted text-xs font-medium mb-2">{label}</div>
      <div className="flex items-end gap-2">
        <div className="font-display font-bold text-3xl text-brand-gold">{value}</div>
        {unit && <div className="text-brand-muted text-sm mb-1">{unit}</div>}
      </div>
      {trend && (
        <div className={`text-xs mt-2 ${trend.up ? "text-brand-green" : "text-brand-red"}`}>
          {trend.up ? "↑" : "↓"} {trend.percent}% vs last period
        </div>
      )}
    </div>
  );
}

function MetricsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard label="Sessions" value={stats.totalSessions} />
      <StatCard label="Total Hours" value={stats.totalHours} unit="hrs" />
      <StatCard label="Hours Saved" value={stats.hoursSaved} unit="hrs" />
      <StatCard label="Bugs Prevented" value={stats.bugsPreventedShip} />
      <StatCard label="Avg Duration" value={Math.round(stats.avgSessionDuration)} unit="min" />
      <StatCard label="Productivity" value={`${Math.round((stats.hoursSaved / Math.max(stats.totalHours, 1)) * 100)}%`} />
    </div>
  );
}

function SkillBreakdown({ stats }: { stats: DashboardStats }) {
  const sortedSkills = Object.entries(stats.skillsUsed)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const maxCount = Math.max(...sortedSkills.map(([, count]) => count), 1);

  return (
    <div className="card">
      <h3 className="font-display font-bold text-white text-lg mb-4">Top Skills Used</h3>
      <div className="space-y-3">
        {sortedSkills.length === 0 ? (
          <p className="text-brand-muted text-sm">No sessions yet in this period</p>
        ) : (
          sortedSkills.map(([skill, count]) => {
            const percent = (count / maxCount) * 100;
            return (
              <div key={skill} className="flex items-center gap-3">
                <span className="text-xs font-semibold w-28 text-brand-gold truncate">/{skill}</span>
                <div className="flex-1 h-2 bg-brand-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-gold/50"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-brand-muted text-xs w-12 text-right font-mono">{count}×</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function TaskTypeBreakdown({ stats }: { stats: DashboardStats }) {
  const taskTypes = Object.entries(stats.tasksCompleted).sort(([, a], [, b]) => b - a);
  const colors: Record<string, string> = {
    "bug-fix": "bg-brand-red",
    feature: "bg-brand-green",
    refactor: "bg-brand-gold",
    optimization: "text-brand-gold",
    "code-review": "bg-brand-green/50",
    documentation: "bg-brand-muted",
  };

  return (
    <div className="card">
      <h3 className="font-display font-bold text-white text-lg mb-4">Task Type Distribution</h3>
      <div className="space-y-3">
        {taskTypes.length === 0 ? (
          <p className="text-brand-muted text-sm">No tasks in this period</p>
        ) : (
          taskTypes.map(([type, count]) => {
            const percent = (count / Math.max(...taskTypes.map(([, c]) => c))) * 100;
            const color = colors[type] || "bg-brand-gold/30";
            return (
              <div key={type} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-sm text-white capitalize">{type}</span>
                <div className="flex-1" />
                <span className="text-brand-muted text-xs font-mono">{count}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SkillMetricsTable({ metrics }: { metrics: SkillMetrics[] }) {
  return (
    <div className="card">
      <h3 className="font-display font-bold text-white text-lg mb-4">Skill Performance Metrics</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              <th className="pb-3 text-left text-brand-muted font-medium">Skill</th>
              <th className="pb-3 text-right text-brand-muted font-medium">Uses</th>
              <th className="pb-3 text-right text-brand-muted font-medium">Total Time</th>
              <th className="pb-3 text-right text-brand-muted font-medium">Avg Time</th>
              <th className="pb-3 text-right text-brand-muted font-medium">Success Rate</th>
              <th className="pb-3 text-right text-brand-muted font-medium">Issues Caught</th>
            </tr>
          </thead>
          <tbody>
            {metrics.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-brand-muted text-sm">
                  No skill data available
                </td>
              </tr>
            ) : (
              metrics.map((m) => (
                <tr key={m.name} className="border-b border-brand-border/50 hover:bg-brand-bg/30">
                  <td className="py-3 text-white font-medium">/{m.name}</td>
                  <td className="py-3 text-right text-brand-muted">{m.usageCount}×</td>
                  <td className="py-3 text-right text-brand-muted">{m.totalTime}m</td>
                  <td className="py-3 text-right text-brand-muted">{m.avgTime.toFixed(1)}m</td>
                  <td className="py-3 text-right">
                    <span className={`text-xs font-semibold ${m.successRate >= 90 ? "text-brand-green" : "text-brand-gold"}`}>
                      {m.successRate}%
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-brand-green font-semibold">{m.issuesCaught}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TokenUsagePanel({ tokenMetrics }: { tokenMetrics: TokenMetrics }) {
  const SUBSCRIPTION_MONTHLY = 10_000_000;
  const tokensRemaining = SUBSCRIPTION_MONTHLY - tokenMetrics.month;
  const monthlyPercent = (tokenMetrics.month / SUBSCRIPTION_MONTHLY) * 100;
  const weeklyPercent = (tokenMetrics.week / (SUBSCRIPTION_MONTHLY / 4.33)) * 100;
  const dailyPercent = (tokenMetrics.day / (SUBSCRIPTION_MONTHLY / 30)) * 100;
  const daysInMonth = 30;
  const daysUsed = 21;
  const daysRemaining = daysInMonth - daysUsed;
  const projectedMonthlyUsage = tokenMetrics.month > 0 ? (tokenMetrics.month / daysUsed) * daysInMonth : 0;
  const onTrack = projectedMonthlyUsage <= SUBSCRIPTION_MONTHLY;

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-white text-lg">Token Budget ($20/mo)</h3>
          <span className="text-xs font-mono text-brand-muted">{tokenMetrics.month.toLocaleString()} / {SUBSCRIPTION_MONTHLY.toLocaleString()}</span>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white font-semibold">Monthly Usage</span>
            <span className="text-sm text-brand-muted font-mono">{monthlyPercent.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-brand-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                monthlyPercent > 90
                  ? "bg-brand-red"
                  : monthlyPercent > 70
                  ? "bg-brand-gold"
                  : "bg-brand-green"
              }`}
              style={{ width: `${Math.min(monthlyPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-brand-muted">
            <span>Used</span>
            <span>Remaining: {tokensRemaining.toLocaleString()} tokens ({(100 - monthlyPercent).toFixed(1)}%)</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-brand-bg/50 border border-brand-border">
            <p className="text-xs text-brand-muted mb-1">Today</p>
            <p className="font-mono text-white font-semibold">{tokenMetrics.day.toLocaleString()}</p>
            <p className="text-xs text-brand-muted mt-1">{dailyPercent.toFixed(1)}% of daily</p>
          </div>
          <div className="p-3 rounded-lg bg-brand-bg/50 border border-brand-border">
            <p className="text-xs text-brand-muted mb-1">This Week</p>
            <p className="font-mono text-white font-semibold">{tokenMetrics.week.toLocaleString()}</p>
            <p className="text-xs text-brand-muted mt-1">{weeklyPercent.toFixed(1)}% of weekly</p>
          </div>
          <div className={`p-3 rounded-lg ${onTrack ? "bg-brand-green/10 border border-brand-green/30" : "bg-brand-red/10 border border-brand-red/30"}`}>
            <p className="text-xs text-brand-muted mb-1">Projection</p>
            <p className={`font-mono font-semibold ${onTrack ? "text-brand-green" : "text-brand-red"}`}>
              {projectedMonthlyUsage.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className={`text-xs mt-1 ${onTrack ? "text-brand-green" : "text-brand-red"}`}>
              {onTrack ? "✓ Within budget" : "⚠ Over budget"}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-brand-gold/5 border border-brand-gold/20">
          <p className="text-xs text-brand-muted mb-2">Burn Rate & Timeline</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{(tokenMetrics.month / Math.max(daysUsed, 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })} tokens/day</p>
              <p className="text-xs text-brand-muted">{(tokenMetrics.week / 7).toLocaleString(undefined, { maximumFractionDigits: 0 })} tokens/day (weekly avg)</p>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">{daysRemaining} days left</p>
              <p className="text-xs text-brand-muted">in billing cycle</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-display font-bold text-white text-lg mb-4">Cost Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-brand-bg/50 border border-brand-border">
            <p className="text-xs text-brand-muted mb-1">Monthly Subscription</p>
            <p className="text-xl font-semibold text-brand-gold">$20.00</p>
            <p className="text-xs text-brand-muted mt-1">10M tokens included</p>
          </div>
          <div className="p-3 rounded-lg bg-brand-bg/50 border border-brand-border">
            <p className="text-xs text-brand-muted mb-1">Cost per Million Tokens</p>
            <p className="text-xl font-semibold text-white">$2.00</p>
            <p className="text-xs text-brand-muted mt-1">Effective rate</p>
          </div>
          <div className="p-3 rounded-lg bg-brand-bg/50 border border-brand-border">
            <p className="text-xs text-brand-muted mb-1">Tokens Used (Monthly)</p>
            <p className="text-xl font-semibold text-white">{(tokenMetrics.month / 1_000_000).toFixed(2)}M</p>
            <p className="text-xs text-brand-muted mt-1">{monthlyPercent.toFixed(1)}% of budget</p>
          </div>
          <div className={`p-3 rounded-lg border ${tokensRemaining > 0 ? "bg-brand-green/5 border-brand-green/30" : "bg-brand-red/5 border-brand-red/30"}`}>
            <p className="text-xs text-brand-muted mb-1">Projected This Month</p>
            <p className={`text-xl font-semibold ${tokensRemaining > 0 ? "text-brand-green" : "text-brand-red"}`}>
              ${((projectedMonthlyUsage > SUBSCRIPTION_MONTHLY ? (projectedMonthlyUsage - SUBSCRIPTION_MONTHLY) * 0.000002 : 0) + 20).toFixed(2)}
            </p>
            <p className="text-xs text-brand-muted mt-1">{tokensRemaining > 0 ? "Within budget" : "Overage charge"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionTimeline({ sessions }: { sessions: Session[] }) {
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="card">
      <h3 className="font-display font-bold text-white text-lg mb-4">Recent Sessions</h3>
      <div className="space-y-2">
        {sortedSessions.length === 0 ? (
          <p className="text-brand-muted text-sm py-4">No sessions in this period</p>
        ) : (
          sortedSessions.slice(0, 10).map((session) => {
            const statusColors: Record<string, string> = {
              completed: "bg-brand-green/10 border-brand-green/30",
              "in-progress": "bg-brand-gold/10 border-brand-gold/30",
              optimized: "bg-brand-green/10 border-brand-green/30",
            };
            return (
              <div key={session.id} className={`p-3 border rounded-lg ${statusColors[session.status]} transition-all hover:border-brand-gold/50`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-brand-gold text-xs font-bold uppercase">/{session.skill}</span>
                      <span className="text-brand-muted text-xs">{session.taskType}</span>
                      <span className="text-brand-muted text-xs ml-auto">{session.date}</span>
                    </div>
                    <p className="text-white text-sm mb-2">{session.description}</p>
                    <div className="flex items-center gap-4 text-xs text-brand-muted">
                      <span>Duration: <span className="text-white font-mono">{session.duration}m</span></span>
                      <span>Work: <span className="text-white font-mono">{session.hoursOfWork}h saved</span></span>
                      <span>Bugs: <span className="text-brand-green font-mono">{session.bugsPreventedCount}</span></span>
                      <span>Tokens: <span className="text-white font-mono">{(session.tokensUsed / 1000).toFixed(0)}k</span></span>
                      <span className={`ml-auto font-semibold ${session.status === "completed" ? "text-brand-green" : "text-brand-gold"}`}>
                        ✓ {session.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ClaudeUsageContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [skillMetrics, setSkillMetrics] = useState<SkillMetrics[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tokenMetrics, setTokenMetrics] = useState<TokenMetrics>({ day: 0, week: 0, month: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>("month");

  useEffect(() => {
    loadData();
  }, [dateFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "all":
          startDate = new Date(0);
          break;
      }

      const allSessions = await getAllClaudeSessions(startDate, now);
      const tokenData = await getTokenMetricsByDateRange(null, startDate, now);

      // Calculate today's data
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayData = await getTokenMetricsByDateRange(null, today, now);

      // Calculate this week's data
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      const weekData = await getTokenMetricsByDateRange(null, weekStart, now);

      // Transform sessions
      const transformedSessions: Session[] = (allSessions || []).map((s) => ({
        id: s.id,
        date: new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        skill: s.skill_name,
        taskType: s.task_type,
        duration: s.duration_minutes,
        timelineHours: Math.round(s.hours_of_work_saved * 12),
        hoursOfWork: s.hours_of_work_saved,
        bugsPreventedCount: s.bugs_prevented_count,
        description: s.description || "",
        status: s.status as "completed" | "in-progress" | "optimized",
        tokensUsed: s.tokens_used,
      }));

      // Calculate stats
      const skillsUsed: Record<string, number> = {};
      const tasksCompleted: Record<string, number> = {};
      let totalHours = 0;
      let totalBugsPrevented = 0;

      transformedSessions.forEach((session) => {
        skillsUsed[session.skill] = (skillsUsed[session.skill] || 0) + 1;
        tasksCompleted[session.taskType] = (tasksCompleted[session.taskType] || 0) + 1;
        totalHours += session.hoursOfWork;
        totalBugsPrevented += session.bugsPreventedCount;
      });

      const avgDuration = transformedSessions.length > 0
        ? transformedSessions.reduce((sum, s) => sum + s.duration, 0) / transformedSessions.length
        : 0;

      const mostUsedSkill = Object.entries(skillsUsed).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";
      const mostCommonTask = Object.entries(tasksCompleted).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

      const calculatedStats: DashboardStats = {
        totalSessions: transformedSessions.length,
        totalHours: Math.round(totalHours * 10) / 10,
        skillsUsed,
        tasksCompleted,
        hoursSaved: Math.round(totalHours * 10) / 10,
        bugsPreventedShip: totalBugsPrevented,
        avgSessionDuration: Math.round(avgDuration),
        mostUsedSkill,
        mostCommonTask,
      };

      // Calculate skill metrics
      const skillMetricsMap: Record<string, SkillMetrics> = {};
      transformedSessions.forEach((session) => {
        if (!skillMetricsMap[session.skill]) {
          skillMetricsMap[session.skill] = {
            name: session.skill,
            usageCount: 0,
            totalTime: 0,
            avgTime: 0,
            successRate: 100,
            issuesCaught: 0,
          };
        }
        skillMetricsMap[session.skill].usageCount += 1;
        skillMetricsMap[session.skill].totalTime += session.duration;
        skillMetricsMap[session.skill].issuesCaught += session.bugsPreventedCount;
      });

      Object.values(skillMetricsMap).forEach((metric) => {
        metric.avgTime = metric.totalTime / metric.usageCount;
      });

      setStats(calculatedStats);
      setSkillMetrics(Object.values(skillMetricsMap));
      setSessions(transformedSessions);
      setTokenMetrics({
        day: todayData.total,
        week: weekData.total,
        month: tokenData.total,
        total: tokenData.total,
      });
    } catch (error) {
      console.error("Error loading Claude sessions:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <div className="w-5 h-5 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
        <span className="text-brand-muted text-sm">Loading Claude usage data…</span>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-brand-muted py-10">No data available</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-brand-gold text-sm font-bold">🤖 CLAUDE CODE</span>
            </div>
            <h1 className="font-display font-black text-3xl text-white">Claude Usage Dashboard</h1>
            <p className="text-brand-muted text-sm mt-1">Real-time developer productivity metrics & skill effectiveness</p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex gap-2">
          {(["today", "week", "month", "all"] as DateFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateFilter === filter
                  ? "bg-brand-gold text-black"
                  : "bg-brand-card border border-brand-border text-brand-muted hover:border-brand-gold/50"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <MetricsGrid stats={stats} />

      {/* Token Usage Section */}
      <div className="my-8">
        <TokenUsagePanel tokenMetrics={tokenMetrics} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-8">
        <div className="lg:col-span-2">
          <SkillBreakdown stats={stats} />
        </div>
        <TaskTypeBreakdown stats={stats} />
      </div>

      {/* Detailed Metrics */}
      <SkillMetricsTable metrics={skillMetrics} />

      {/* Session Timeline */}
      <div className="mt-8">
        <SessionTimeline sessions={sessions} />
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 rounded-lg bg-brand-card border border-brand-border">
        <p className="text-xs text-brand-muted">
          <strong>Data source:</strong> Real Supabase claude_sessions table.
          <strong className="ml-4">Filter:</strong> {dateFilter === "all" ? "All time" : `Last ${dateFilter}`}.
          <strong className="ml-4">Last updated:</strong> {new Date().toLocaleTimeString()}.
        </p>
      </div>
    </div>
  );
}

export default function ClaudeUsagePage() {
  return (
    <AuthGuard requireAdmin>
      <ClaudeUsageContent />
    </AuthGuard>
  );
}
