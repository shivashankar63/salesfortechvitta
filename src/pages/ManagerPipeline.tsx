import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Target, DollarSign, Timer, Loader, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getLeads, getCurrentUser } from "@/lib/supabase";

const ManagerPipeline = () => {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const leadsRes = await getLeads();
        const allLeads = leadsRes.data || [];
        
        setLeads(allLeads);
      } catch (error) {
        console.error("Error fetching pipeline data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stage metrics from real data
  const calculateStages = () => {
    const newLeads = leads.filter(l => l.status === 'new');
    const qualifiedLeads = leads.filter(l => l.status === 'qualified');
    const negotiationLeads = leads.filter(l => l.status === 'negotiation');
    const wonLeads = leads.filter(l => l.status === 'won');
    const lostLeads = leads.filter(l => l.status === 'lost');

    return [
      { 
        name: "New", 
        count: newLeads.length, 
        value: newLeads.reduce((sum, l) => sum + (l.value || 0), 0), 
        sla: "1d",
        color: "text-blue-400"
      },
      { 
        name: "Qualified", 
        count: qualifiedLeads.length, 
        value: qualifiedLeads.reduce((sum, l) => sum + (l.value || 0), 0), 
        sla: "3d",
        color: "text-cyan-400"
      },
      { 
        name: "Negotiation", 
        count: negotiationLeads.length, 
        value: negotiationLeads.reduce((sum, l) => sum + (l.value || 0), 0), 
        sla: "7d",
        color: "text-orange-400"
      },
      { 
        name: "Closed Won", 
        count: wonLeads.length, 
        value: wonLeads.reduce((sum, l) => sum + (l.value || 0), 0), 
        sla: "-",
        color: "text-green-400"
      },
      { 
        name: "Lost", 
        count: lostLeads.length, 
        value: lostLeads.reduce((sum, l) => sum + (l.value || 0), 0), 
        sla: "-",
        color: "text-red-400"
      },
    ];
  };

  const stages = calculateStages();
  const totalValue = stages.reduce((sum, s) => sum + s.value, 0);
  const maxValue = Math.max(...stages.map(s => s.value), 1);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <DashboardSidebar role="manager" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-slate-300">Loading pipeline data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardSidebar role="manager" />
      <main className="flex-1 p-4 lg:p-8 pt-20 sm:pt-16 lg:pt-8 overflow-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Lead Pipeline</h1>
              <p className="text-slate-400">Stage-wise breakdown with value and SLA</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-8">
            <Card className="bg-slate-800/60 border-slate-700 p-5 hover:bg-slate-800/80 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-xs mb-1">Total Pipeline Value</p>
                  <p className="text-xl font-bold text-white">${(totalValue / 1000000).toFixed(2)}M</p>
                </div>
                <DollarSign className="w-6 h-6 text-slate-300" />
              </div>
            </Card>
            <Card className="bg-slate-800/60 border-slate-700 p-5 hover:bg-slate-800/80 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-xs mb-1">Total Deals</p>
                  <p className="text-xl font-bold text-white">{leads.length}</p>
                </div>
                <Target className="w-6 h-6 text-slate-300" />
              </div>
            </Card>
            <Card className="bg-slate-800/60 border-slate-700 p-5 hover:bg-slate-800/80 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-xs mb-1">Conversion Rate</p>
                  <p className="text-xl font-bold text-white">
                    {leads.length > 0 ? Math.round((stages[3].count / leads.length) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-slate-300" />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stages.map((stage) => {
            const pct = maxValue > 0 ? Math.round((stage.value / maxValue) * 100) : 0;
            const iconColor = stage.name === 'Closed Won'
              ? 'text-emerald-300'
              : stage.name === 'Lost'
              ? 'text-rose-300'
              : 'text-slate-300';
            return (
              <Card key={stage.name} className="bg-slate-800/60 border-slate-700 p-5 hover:bg-slate-800/80 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white font-semibold flex items-center gap-2 text-base">
                    <Target className={`w-5 h-5 ${iconColor}`} /> {stage.name}
                  </div>
                  <Badge className="bg-slate-700 text-white border-slate-600 font-semibold">{stage.count} deals</Badge>
                </div>
                <div className="text-sm text-slate-300 font-medium mb-2">
                  Value: ${stage.value >= 1000 ? (stage.value/1000).toFixed(1) : stage.value}K
                </div>
                <Progress value={pct} className="h-3 mb-3" />
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Timer className="w-4 h-4" /> SLA: {stage.sla}
                  </div>
                  <div className="text-slate-400">{pct}% of max stage</div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ManagerPipeline;


