import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, FileText } from "lucide-react";

const reports = [
  { name: "Weekly Pipeline", period: "This Week", size: "1.2 MB" },
  { name: "Team Performance", period: "Last 30 days", size: "900 KB" },
  { name: "Activity Summary", period: "This Month", size: "600 KB" },
];

const ManagerReports = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardSidebar role="manager" />
      <main className="flex-1 p-4 lg:p-8 pt-20 sm:pt-16 lg:pt-8 overflow-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports</h1>
            <p className="text-slate-400">Download weekly and monthly summaries</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
            <Download className="w-4 h-4" /> Export All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card key={report.name} className="p-4 bg-white/5 border-white/10 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-semibold">{report.name}</div>
                  <div className="text-xs text-slate-400">{report.period}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Size: {report.size}</span>
                <Button variant="outline" className="bg-white/5 text-white border-white/10 hover:bg-white/10 gap-2">
                  <FileText className="w-4 h-4" /> Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ManagerReports;


