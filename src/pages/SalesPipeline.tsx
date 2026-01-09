import { useEffect, useState, useMemo } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Clock, CheckCircle2, Loader } from "lucide-react";
import { getLeads, getCurrentUser } from "@/lib/supabase";

type StageKey = "new" | "qualified" | "negotiation" | "won" | "lost";

const stageMeta: Record<StageKey, { label: string; sla: string; progress: number }> = {
  new: { label: "New", sla: "24h", progress: 20 },
  qualified: { label: "Qualified", sla: "48h", progress: 45 },
  negotiation: { label: "Negotiation", sla: "5d", progress: 70 },
  won: { label: "Won", sla: "-", progress: 100 },
  lost: { label: "Lost", sla: "-", progress: 0 },
};

const SalesPipeline = () => {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        const { data } = await getLeads(user ? { assignedTo: user.id } : undefined);
        setLeads(data || []);
      } catch (error) {
        console.error("Error loading pipeline leads", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stages = useMemo(() => {
    const grouped: Record<StageKey, { leads: number; value: number }> = {
      new: { leads: 0, value: 0 },
      qualified: { leads: 0, value: 0 },
      negotiation: { leads: 0, value: 0 },
      won: { leads: 0, value: 0 },
      lost: { leads: 0, value: 0 },
    };

    leads.forEach((lead: any) => {
      const key = (lead.status || "new") as StageKey;
      if (!grouped[key]) return;
      grouped[key].leads += 1;
      grouped[key].value += lead.value || 0;
    });

    return (Object.keys(stageMeta) as StageKey[]).map((key) => ({
      key,
      name: stageMeta[key].label,
      leads: grouped[key].leads,
      value: grouped[key].value,
      sla: stageMeta[key].sla,
      progress: stageMeta[key].progress,
    }));
  }, [leads]);

  const totalValue = stages.reduce((s, st) => s + st.value, 0);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardSidebar role="salesman" />
      <main className="flex-1 p-4 lg:p-8 pt-20 sm:pt-16 lg:pt-8 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center text-slate-300 flex flex-col items-center gap-3">
              <Loader className="w-10 h-10 animate-spin text-orange-400" />
              <span>Loading pipeline...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Pipeline</h1>
                <p className="text-slate-400">Track where every deal stands</p>
              </div>
              <Badge className="bg-orange-500/20 text-orange-200 border-orange-500/40">
                Total ${totalValue.toLocaleString()}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stages.map((stage) => (
                <Card key={stage.key} className="p-4 bg-white/5 border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-lg font-semibold text-white">{stage.name}</div>
                      <div className="text-sm text-slate-400">{stage.leads} leads</div>
                    </div>
                    <Badge className="bg-orange-500/15 text-orange-200 border-orange-500/40">
                      ${stage.value.toLocaleString()}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-slate-300 mb-4">
                    <div className="flex items-center gap-2"><Target className="w-4 h-4 text-orange-400" /> Momentum: {stage.progress}%</div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-400" /> SLA: {stage.sla}</div>
                    {stage.key === "won" && (
                      <div className="flex items-center gap-2 text-green-400"><CheckCircle2 className="w-4 h-4" /> Closed won</div>
                    )}
                    {stage.key === "lost" && (
                      <div className="flex items-center gap-2 text-red-300"><CheckCircle2 className="w-4 h-4" /> Closed lost</div>
                    )}
                  </div>

                  <Progress value={stage.progress} className="h-2" />
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SalesPipeline;


