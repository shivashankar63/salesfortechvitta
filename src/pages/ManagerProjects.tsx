import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CalendarDays, Plus, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects, createProject, createBulkLeads } from "@/lib/supabase";

const ManagerProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", budget: "", status: "planned", start_date: "", end_date: "" });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await getProjects();
      setProjects(data || []);
    })();
  }, []);

  const addProject = async () => {
    if (!form.name) return;
    setCreating(true);
    const payload: any = {
      name: form.name,
      budget: form.budget ? Number(form.budget) : undefined,
      status: form.status,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
    };
    const { error } = await createProject(payload);
    setCreating(false);
    if (!error) {
      setShowModal(false);
      const { data } = await getProjects();
      setProjects(data || []);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardSidebar role="manager" />
      <main className="flex-1 p-4 lg:p-8 pt-20 sm:pt-16 lg:pt-8 overflow-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <p className="text-slate-400">Add and track sales projects</p>
          </div>
          <Button className="bg-purple-600 text-white" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p: any) => (
            <Card
              key={p.id}
              className="p-4 bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
              onClick={() => navigate(`/manager/projects/${p.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/manager/projects/${p.id}`); }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-white font-semibold truncate break-words">{p.name}</div>
                  <div className="text-xs text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">{p.status} • Budget: ${p.budget || 0}</div>
                  <div className="text-xs text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">{p.start_date || "-"} → {p.end_date || "-"}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="budget">Budget</Label>
                <Input id="budget" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Input id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="start">Start Date</Label>
                <Input id="start" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="end">End Date</Label>
                <Input id="end" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={creating}>Cancel</Button>
              <Button onClick={addProject} disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ManagerProjects;


