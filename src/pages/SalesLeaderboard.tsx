import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Flame, Star } from "lucide-react";

const leaderboard = [
  { name: "Sally Seller", role: "Senior AE", revenue: 125000, deals: 9, trend: "+12%" },
  { name: "Sam Seller", role: "AE", revenue: 99000, deals: 7, trend: "+8%" },
  { name: "You", role: "AE", revenue: 87000, deals: 6, trend: "+6%" },
  { name: "Steve Sales", role: "AE", revenue: 72000, deals: 5, trend: "+4%" },
];

const SalesLeaderboard = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <DashboardSidebar role="salesman" />
      <main className="flex-1 p-4 lg:p-8 pt-20 sm:pt-16 lg:pt-8 overflow-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>
            <p className="text-slate-600">See how you stack up this month</p>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800 border-0 flex items-center gap-2"><Flame className="w-4 h-4" /> Keep climbing</Badge>
        </div>

        <Card className="bg-white border border-slate-200 text-slate-900 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-slate-900" />
            <h3 className="text-xl font-bold">Top Performer Bonus</h3>
          </div>
          <p className="text-sm text-slate-600">Hit $120K to unlock a 10% accelerator</p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {leaderboard.map((rep, index) => (
            <Card key={rep.name} className="p-4 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900">{rep.name}</div>
                  <div className="text-sm text-slate-600">{rep.role}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-slate-900">${rep.revenue.toLocaleString()}</div>
                <div className="text-sm text-slate-600">{rep.deals} deals · {rep.trend}</div>
                {rep.name === "You" && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 mt-2 inline-flex items-center gap-1"><Star className="w-4 h-4" /> Personal Best</Badge>
                )}
                {index === 0 && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-0 mt-2 inline-flex items-center gap-1"><Award className="w-4 h-4" /> #1 this month</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SalesLeaderboard;


