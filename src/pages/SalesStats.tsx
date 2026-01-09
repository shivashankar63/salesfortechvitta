import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, PhoneCall, Mail, Clock, TrendingUp } from "lucide-react";

const metrics = [
  { title: "Quota Progress", value: 82, icon: Target, accent: "bg-orange-500" },
  { title: "Call Connect Rate", value: 68, icon: PhoneCall, accent: "bg-blue-500" },
  { title: "Email Reply Rate", value: 32, icon: Mail, accent: "bg-purple-500" },
  { title: "Avg. Cycle (days)", value: 18, icon: Clock, accent: "bg-emerald-500" },
];

const weekly = [
  { day: "Mon", calls: 24, emails: 30 },
  { day: "Tue", calls: 18, emails: 22 },
  { day: "Wed", calls: 27, emails: 28 },
  { day: "Thu", calls: 22, emails: 25 },
  { day: "Fri", calls: 16, emails: 18 },
];

const SalesStats = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <DashboardSidebar role="salesman" />
      <main className="flex-1 p-4 lg:p-8 pt-20 sm:pt-16 lg:pt-8 overflow-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Stats</h1>
            <p className="text-slate-600">Track efficiency and momentum</p>
          </div>
          <Badge className="bg-slate-900 text-white border-transparent flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Trending up
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => (
            <Card key={metric.title} className="p-4 bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center ${metric.accent}`}>
                  <metric.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">{metric.title}</div>
                  <div className="text-xl font-semibold text-slate-900">{metric.value}{metric.title.includes("Cycle") ? "" : "%"}</div>
                </div>
              </div>
              <Progress value={metric.value} className="h-2" />
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Weekly Activity</h3>
              <p className="text-sm text-slate-600">Calls vs. emails sent</p>
            </div>
            <Badge className="bg-slate-100 text-slate-800 border-slate-200">Goal: 120 calls</Badge>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {weekly.map((day) => (
              <div key={day.day} className="space-y-2">
                <div className="text-sm font-semibold text-slate-800">{day.day}</div>
                <div className="text-xs text-slate-500">Calls</div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900" style={{ width: `${day.calls}%` }} />
                </div>
                <div className="text-xs text-slate-500">Emails</div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${day.emails}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default SalesStats;


