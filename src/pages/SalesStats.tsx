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
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <DashboardSidebar role="salesman" />
      <main className="flex-1 p-4 lg:p-8 pt-20 sm:pt-16 lg:pt-8 overflow-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Stats</h1>
            <p className="text-gray-500">Track efficiency and momentum</p>
          </div>
          <Badge className="bg-green-100 text-green-700 border-0 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Trending up
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => (
            <Card key={metric.title} className="p-4 bg-white border border-orange-100 shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center ${metric.accent}`}>
                  <metric.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">{metric.title}</div>
                  <div className="text-xl font-semibold text-gray-900">{metric.value}{metric.title.includes("Cycle") ? "" : "%"}</div>
                </div>
              </div>
              <Progress value={metric.value} className="h-2" />
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-white border border-orange-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
              <p className="text-sm text-gray-500">Calls vs. emails sent</p>
            </div>
            <Badge className="bg-orange-100 text-orange-700 border-0">Goal: 120 calls</Badge>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {weekly.map((day) => (
              <div key={day.day} className="space-y-2">
                <div className="text-sm font-semibold text-gray-700">{day.day}</div>
                <div className="text-xs text-gray-500">Calls</div>
                <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${day.calls}%` }} />
                </div>
                <div className="text-xs text-gray-500">Emails</div>
                <div className="h-2 bg-pink-100 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500" style={{ width: `${day.emails}%` }} />
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


