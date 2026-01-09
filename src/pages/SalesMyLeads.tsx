import { useEffect, useMemo, useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, ArrowUpRight, Flame, Loader } from "lucide-react";
import { getLeads, getCurrentUser, updateLead } from "@/lib/supabase";

const stageColors: Record<string, string> = {
  new: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  qualified: "bg-green-500/20 text-green-200 border-green-500/40",
  negotiation: "bg-purple-500/20 text-purple-200 border-purple-500/40",
  won: "bg-blue-500/20 text-blue-200 border-blue-500/40",
  lost: "bg-slate-500/20 text-slate-200 border-slate-500/40",
};

const scoreColors: Record<string, string> = {
  hot: "bg-red-500/20 text-red-200 border-red-500/40",
  warm: "bg-orange-500/20 text-orange-200 border-orange-500/40",
  cold: "bg-slate-500/20 text-slate-200 border-slate-500/40",
};

const SalesMyLeads = () => {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        const { data } = await getLeads(user ? { assignedTo: user.id } : undefined);
        setLeads(data || []);
      } catch (error) {
        console.error("Error loading my leads", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalValue = useMemo(() => leads.reduce((s, l) => s + (l.value || 0), 0), [leads]);

  const handleAdvanceStage = async (leadId: string, currentStatus: string) => {
    const order = ["new", "qualified", "negotiation", "won"];
    const idx = order.indexOf(currentStatus);
    const next = order[Math.min(order.length - 1, idx + 1)] || currentStatus;
    try {
      await updateLead(leadId, { status: next });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: next } : l)));
    } catch (error) {
      console.error("Failed to advance lead", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardSidebar role="salesman" />
      <main className="flex-1 p-4 lg:p-8 pt-20 sm:pt-16 lg:pt-8 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center text-slate-300 flex flex-col items-center gap-3">
              <Loader className="w-10 h-10 animate-spin text-orange-400" />
              <span>Loading leads...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">My Leads</h1>
                <p className="text-slate-400">Focus on the hottest opportunities first</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" /> ${totalValue.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leads.map((lead) => {
                const stageKey = (lead.status || "new").toLowerCase();
                const scoreKey = (lead.lead_score || "warm").toLowerCase();
                return (
                  <Card key={lead.id} className="p-4 bg-white/5 border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-orange-500 text-white font-semibold">
                            {(lead.company_name || "?").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-lg font-semibold text-white">{lead.company_name || "Unknown"}</div>
                          <div className="text-sm text-slate-400">{lead.contact_name || lead.email || "No contact"}</div>
                        </div>
                      </div>
                      <Badge className={`${stageColors[stageKey] || stageColors.new} border-0`}>
                        {lead.status || "new"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" />{lead.email || "-"}</div>
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" />{lead.phone || lead.contact_phone || "-"}</div>
                      <div className="text-slate-400">Value</div>
                      <div className="text-white font-semibold">${Number(lead.value || 0).toLocaleString()}</div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Badge className={`${scoreColors[scoreKey] || scoreColors.warm} border-0`}>
                        {(lead.lead_score || "Warm").toString()}
                      </Badge>
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                        onClick={() => handleAdvanceStage(lead.id, (lead.status || "new").toLowerCase())}
                      >
                        <ArrowUpRight className="w-4 h-4" /> Advance Stage
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SalesMyLeads;


