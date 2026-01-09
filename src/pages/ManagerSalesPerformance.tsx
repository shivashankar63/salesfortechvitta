import { useState, useEffect } from "react";
import { Loader, TrendingUp, Target, Users, DollarSign, Award, AlertCircle } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCurrentUser, getUsers, getLeads, getQuotas } from "@/lib/supabase";

interface SalesPersonPerformance {
  id: string;
  name: string;
  email: string;
  leads: {
    total: number;
    won: number;
    lost: number;
    negotiation: number;
    new: number;
  };
  revenue: number;
  quota: number;
  achievement: number;
  avgDealValue: number;
  winRate: number;
}

const ManagerSalesPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [salesTeam, setSalesTeam] = useState<SalesPersonPerformance[]>([]);
  const [selectedSalesman, setSelectedSalesman] = useState<SalesPersonPerformance | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const manager = await getCurrentUser();
        if (!manager) {
          setLoading(false);
          return;
        }

        const [usersRes, leadsRes, quotasRes] = await Promise.all([
          getUsers(),
          getLeads(),
          getQuotas(manager.id),
        ]);

        const users = usersRes.data || [];
        const leads = leadsRes.data || [];
        const quotas = quotasRes.data || [];

        // Filter for salesman role
        const salespeople = users.filter((u: any) =>
          String(u.role || "").toLowerCase().includes("sales")
        );

        // Calculate performance metrics for each salesman
        const performance = salespeople.map((salesman: any) => {
          const salesmanLeads = leads.filter((l: any) => l.assigned_to === salesman.id);
          const wonLeads = salesmanLeads.filter((l: any) => l.status === "won");
          const lostLeads = salesmanLeads.filter((l: any) => l.status === "lost");
          const negotiationLeads = salesmanLeads.filter((l: any) => l.status === "negotiation");
          const newLeads = salesmanLeads.filter((l: any) => l.status === "new");

          const revenue = wonLeads.reduce((sum: number, l: any) => sum + (l.value || 0), 0);
          const quota = quotas.find((q: any) => q.user_id === salesman.id)?.target_amount || 150000;
          const winRate = salesmanLeads.length > 0 ? Math.round((wonLeads.length / salesmanLeads.length) * 100) : 0;
          const avgDealValue = salesmanLeads.length > 0 ? Math.round(revenue / (wonLeads.length || 1)) : 0;

          return {
            id: salesman.id,
            name: salesman.full_name || salesman.email?.split("@")[0] || "Unknown",
            email: salesman.email,
            leads: {
              total: salesmanLeads.length,
              won: wonLeads.length,
              lost: lostLeads.length,
              negotiation: negotiationLeads.length,
              new: newLeads.length,
            },
            revenue,
            quota,
            achievement: quota > 0 ? Math.round((revenue / quota) * 100) : 0,
            avgDealValue,
            winRate,
          };
        });

        setSalesTeam(performance.sort((a, b) => b.achievement - a.achievement));
      } catch (error) {
        console.error("Error fetching sales performance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAchievementColor = (achievement: number) => {
    if (achievement >= 100) return "text-green-400";
    if (achievement >= 75) return "text-blue-400";
    if (achievement >= 50) return "text-orange-400";
    return "text-red-400";
  };

  const getAchievementBg = (achievement: number) => {
    if (achievement >= 100) return "bg-green-500/20 border-green-500/30";
    if (achievement >= 75) return "bg-blue-500/20 border-blue-500/30";
    if (achievement >= 50) return "bg-orange-500/20 border-orange-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  const totalRevenue = salesTeam.reduce((sum, s) => sum + s.revenue, 0);
  const totalQuota = salesTeam.reduce((sum, s) => sum + s.quota, 0);
  const avgWinRate = Math.round(
    salesTeam.reduce((sum, s) => sum + s.winRate, 0) / (salesTeam.length || 1)
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <DashboardSidebar role="manager" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-slate-300">Loading sales performance...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardSidebar role="manager" />

      <main className="flex-1 p-2 sm:p-4 lg:p-8 pt-20 sm:pt-16 lg:pt-8 overflow-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">Sales Performance Dashboard</h1>
          <p className="text-sm sm:text-base text-white/90 drop-shadow">Monitor team performance, quotas, and pipeline metrics</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-3 sm:p-6 bg-slate-800/60 border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-slate-300 text-xs sm:text-sm mb-1 font-bold">Total Revenue</p>
                <p className="text-lg sm:text-2xl font-bold text-green-400">${(totalRevenue / 1000000).toFixed(2)}M</p>
              </div>
              <DollarSign className="w-6 sm:w-8 h-6 sm:h-8 text-green-400" />
            </div>
          </Card>

          <Card className="p-3 sm:p-6 bg-slate-800/60 border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-slate-300 text-xs sm:text-sm mb-1 font-bold">Total Quota</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-100">${(totalQuota / 1000000).toFixed(2)}M</p>
              </div>
              <Target className="w-6 sm:w-8 h-6 sm:h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-3 sm:p-6 bg-slate-800/60 border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-slate-300 text-xs sm:text-sm mb-1 font-bold">Team Size</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-100">{salesTeam.length}</p>
              </div>
              <Users className="w-6 sm:w-8 h-6 sm:h-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-3 sm:p-6 bg-slate-800/60 border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-slate-300 text-xs sm:text-sm mb-1 font-bold">Avg Win Rate</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-100">{avgWinRate}%</p>
              </div>
              <Award className="w-6 sm:w-8 h-6 sm:h-8 text-orange-400" />
            </div>
          </Card>
        </div>

        {/* Team Performance Table */}
        <Card className="p-3 sm:p-6 bg-slate-800/60 border-slate-700">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-4 sm:mb-6">Sales Team Performance</h2>

          {salesTeam.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <AlertCircle className="w-10 sm:w-12 h-10 sm:h-12 text-[#8697C4] mx-auto mb-4" />
              <p className="text-sm sm:text-base text-[#3D52A0] font-medium">No salespeople assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {salesTeam.map((salesman) => (
                <div
                  key={salesman.id}
                  className="bg-slate-900/60 p-3 sm:p-5 rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-900/80 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedSalesman(salesman);
                    setShowDetailsModal(true);
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-6 mb-3 sm:mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                          {salesman.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-sm sm:text-lg">{salesman.name}</h3>
                          <p className="text-xs text-slate-400 truncate font-medium">{salesman.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:self-start">
                      <div className={`text-xl sm:text-2xl font-bold ${getAchievementColor(salesman.achievement)}`}>
                        {salesman.achievement}%
                      </div>
                      <p className="text-xs text-[#3D52A0] font-bold">of quota</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                    <div className="bg-slate-800 p-2 sm:p-3 rounded-lg border border-slate-700">
                      <p className="text-xs text-slate-300 mb-1 font-bold">Revenue</p>
                      <p className="font-bold text-green-600 text-xs sm:text-sm">${(salesman.revenue / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="bg-slate-800 p-2 sm:p-3 rounded-lg border border-slate-700">
                      <p className="text-xs text-slate-300 mb-1 font-bold">Quota</p>
                      <p className="font-bold text-slate-100 text-xs sm:text-sm">${(salesman.quota / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="bg-slate-800 p-2 sm:p-3 rounded-lg border border-slate-700">
                      <p className="text-xs text-slate-300 mb-1 font-bold">Won</p>
                      <p className="font-bold text-slate-100 text-xs sm:text-sm">{salesman.leads.won}</p>
                    </div>
                    <div className="bg-slate-800 p-2 sm:p-3 rounded-lg border border-slate-700 hidden sm:block">
                      <p className="text-xs text-slate-300 mb-1 font-bold">Win Rate</p>
                      <p className="font-bold text-orange-500 text-sm">{salesman.winRate}%</p>
                    </div>
                    <div className="bg-slate-800 p-2 sm:p-3 rounded-lg border border-slate-700 hidden sm:block">
                      <p className="text-xs text-slate-300 mb-1 font-bold">Avg Deal</p>
                      <p className="font-bold text-slate-100 text-sm">${(salesman.avgDealValue / 1000).toFixed(0)}K</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          salesman.achievement >= 100
                            ? "bg-green-500"
                            : salesman.achievement >= 75
                            ? "bg-blue-500"
                            : salesman.achievement >= 50
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(salesman.achievement, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Lead Pipeline */}
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {salesman.leads.new > 0 && (
                      <Badge className="bg-slate-600 text-slate-200">New: {salesman.leads.new}</Badge>
                    )}
                    {salesman.leads.negotiation > 0 && (
                      <Badge className="bg-orange-600/30 text-orange-200 border-orange-600/50">
                        Negotiation: {salesman.leads.negotiation}
                      </Badge>
                    )}
                    {salesman.leads.won > 0 && (
                      <Badge className="bg-green-600/30 text-green-200 border-green-600/50">Won: {salesman.leads.won}</Badge>
                    )}
                    {salesman.leads.lost > 0 && (
                      <Badge className="bg-red-600/30 text-red-200 border-red-600/50">Lost: {salesman.leads.lost}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="sm:max-w-2xl bg-slate-950 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-slate-800 pb-4">
              <DialogTitle className="text-xl text-white">Performance Details</DialogTitle>
            </DialogHeader>
            {selectedSalesman && (
              <div className="space-y-6 pb-4">
                {/* Header */}
                <div className="pb-4 border-b border-slate-800 bg-gradient-to-r from-purple-950/30 to-blue-950/30 p-4 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{selectedSalesman.name}</h3>
                      <p className="text-gray-300 text-sm mt-2">📧 {selectedSalesman.email}</p>
                    </div>
                    <Badge className={`${getAchievementBg(selectedSalesman.achievement)} text-sm px-3 py-1`}>
                      {selectedSalesman.achievement}% Achievement
                    </Badge>
                  </div>
                </div>

                {/* Revenue Info */}
                <div>
                  <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                    Revenue Overview
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700">
                      <span className="text-xs font-semibold text-green-300 block mb-2 uppercase tracking-wide">💰 Total Revenue</span>
                      <span className="text-xl font-bold text-green-400">${(selectedSalesman.revenue / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700">
                      <span className="text-xs font-semibold text-blue-300 block mb-2 uppercase tracking-wide">📊 Quota</span>
                      <span className="text-xl font-bold text-blue-400">${(selectedSalesman.quota / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700">
                      <span className="text-xs font-semibold text-pink-300 block mb-2 uppercase tracking-wide">💎 Avg Deal Value</span>
                      <span className="text-xl font-bold text-pink-400">${(selectedSalesman.avgDealValue / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>

                {/* Deal Stats */}
                <div>
                  <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                    Deal Pipeline
                  </h4>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700 text-center">
                      <p className="text-2xl font-bold text-white">{selectedSalesman.leads.total}</p>
                      <p className="text-xs text-slate-400 mt-1">Total Leads</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700 text-center">
                      <p className="text-2xl font-bold text-slate-300">{selectedSalesman.leads.new}</p>
                      <p className="text-xs text-slate-400 mt-1">New</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700 text-center">
                      <p className="text-2xl font-bold text-orange-400">{selectedSalesman.leads.negotiation}</p>
                      <p className="text-xs text-slate-400 mt-1">Negotiating</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700 text-center">
                      <p className="text-2xl font-bold text-green-400">{selectedSalesman.leads.won}</p>
                      <p className="text-xs text-slate-400 mt-1">Won</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700 text-center">
                      <p className="text-2xl font-bold text-red-400">{selectedSalesman.leads.lost}</p>
                      <p className="text-xs text-slate-400 mt-1">Lost</p>
                    </div>
                  </div>
                </div>

                {/* Win Rate */}
                <div>
                  <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                    Performance Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700">
                      <span className="text-xs font-semibold text-orange-300 block mb-2 uppercase tracking-wide">🎯 Win Rate</span>
                      <p className="text-xl font-bold text-orange-400">{selectedSalesman.winRate}%</p>
                      <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${selectedSalesman.winRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-lg border border-slate-700">
                      <span className="text-xs font-semibold text-green-300 block mb-2 uppercase tracking-wide">📈 Quota Achievement</span>
                      <p className="text-xl font-bold text-green-400">{selectedSalesman.achievement}%</p>
                      <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${Math.min(selectedSalesman.achievement, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ManagerSalesPerformance;


