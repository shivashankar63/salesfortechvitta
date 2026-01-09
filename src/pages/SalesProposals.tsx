import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle2, Send } from "lucide-react";

const proposals = [
  { company: "Umbrella", title: "Platform Rollout", value: 38000, status: "Awaiting signature", eta: "Today" },
  { company: "Globex", title: "Pilot Expansion", value: 24000, status: "Sent", eta: "Tomorrow" },
  { company: "Initech", title: "Renewal", value: 18000, status: "Draft", eta: "Due in 2 days" },
];

const statusBadge: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700",
  Sent: "bg-blue-100 text-blue-700",
  "Awaiting signature": "bg-green-100 text-green-700",
};

const SalesProposals = () => {
  const total = proposals.reduce((s, p) => s + p.value, 0);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <DashboardSidebar role="salesman" />
      <main className="flex-1 p-4 lg:p-8 pt-20 sm:pt-16 lg:pt-8 overflow-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Proposals</h1>
            <p className="text-slate-600">Keep deals moving to signature</p>
          </div>
          <Badge className="bg-orange-100 text-orange-700 border-0">${total.toLocaleString()} open</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {proposals.map((proposal) => (
            <Card key={proposal.company} className="p-4 bg-white border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-lg font-semibold text-slate-900">{proposal.company}</div>
                  <div className="text-sm text-slate-600">{proposal.title}</div>
                </div>
                <Badge className={`${statusBadge[proposal.status]} border-0`}>{proposal.status}</Badge>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-orange-500" /> ${proposal.value.toLocaleString()}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /> {proposal.eta}</div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                  <Send className="w-4 h-4" /> Send Reminder
                </Button>
                <Button size="sm" variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                  <CheckCircle2 className="w-4 h-4" /> Mark Signed
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SalesProposals;


