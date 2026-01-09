import { useState, useEffect } from "react";
import { Plus, Loader, Briefcase, Users, TrendingUp, DollarSign, Target, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, getProjects, createProject, getLeads, getUsers } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [salesTeam, setSalesTeam] = useState<any[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: "", description: "", budget: "" });
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const [projectsRes, leadsRes, usersRes] = await Promise.all([
          getProjects(),
          getLeads(),
          getUsers(),
        ]);

        setProjects(projectsRes.data || []);
        setLeads(leadsRes.data || []);
        setSalesTeam((usersRes.data || []).filter((u: any) => 
          String(u.role || "").toLowerCase().includes("sales")
        ));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateProject = async () => {
    if (!projectForm.name) return;
    setCreatingProject(true);
    try {
      await createProject({
        name: projectForm.name,
        description: projectForm.description,
        budget: projectForm.budget ? Number(projectForm.budget) : undefined,
        status: 'active',
      });
      const projectsRes = await getProjects();
      setProjects(projectsRes.data || []);
      setShowProjectModal(false);
      setProjectForm({ name: "", description: "", budget: "" });
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreatingProject(false);
    }
  };

  // Calculate metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  const negotiationLeads = leads.filter(l => l.status === 'negotiation').length;
  const wonLeads = leads.filter(l => l.status === 'won').length;
  const lostLeads = leads.filter(l => l.status === 'lost').length;
  const totalRevenue = leads.filter(l => l.status === 'won').reduce((sum, l) => sum + (l.value || 0), 0);
  const totalPipeline = leads.filter(l => ['new', 'qualified', 'negotiation'].includes(l.status)).reduce((sum, l) => sum + (l.value || 0), 0);
  const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <DashboardSidebar role="manager" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-slate-300">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardSidebar role="manager" />
      
      <main className="flex-1 p-4 lg:p-8 pt-20 sm:pt-16 lg:pt-8 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Manager Dashboard</h1>
          <p className="text-slate-300">Complete overview of projects, leads, and team performance</p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <Card className="p-4 bg-slate-800/60 border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-xs text-slate-300 font-medium">Projects</p>
            <p className="text-2xl font-bold text-white">{projects.length}</p>
          </Card>
          
          <Card className="p-4 bg-slate-800/60 border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xs text-slate-300 font-medium">Total Leads</p>
            <p className="text-2xl font-bold text-white">{totalLeads}</p>
          </Card>

          <Card className="p-4 bg-slate-800/60 border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs text-slate-300 font-medium">New</p>
            <p className="text-2xl font-bold text-white">{newLeads}</p>
          </Card>

          <Card className="p-4 bg-slate-800/60 border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-xs text-slate-300 font-medium">Won</p>
            <p className="text-2xl font-bold text-green-400">{wonLeads}</p>
          </Card>

          <Card className="p-4 bg-slate-800/60 border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-xs text-slate-300 font-medium">Revenue</p>
            <p className="text-2xl font-bold text-white">${(totalRevenue / 1000).toFixed(0)}K</p>
          </Card>

          <Card className="p-4 bg-slate-800/60 border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xs text-slate-300 font-medium">Win Rate</p>
            <p className="text-2xl font-bold text-white">{winRate}%</p>
          </Card>
        </div>

        {/* Pipeline Overview */}
        <Card className="p-6 bg-slate-800/60 border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Lead Pipeline
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">New</p>
              <p className="text-3xl font-bold text-slate-300">{newLeads}</p>
              <p className="text-xs text-slate-500 mt-1">${(leads.filter(l => l.status === 'new').reduce((sum, l) => sum + (l.value || 0), 0) / 1000).toFixed(0)}K</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Qualified</p>
              <p className="text-3xl font-bold text-blue-400">{qualifiedLeads}</p>
              <p className="text-xs text-slate-500 mt-1">${(leads.filter(l => l.status === 'qualified').reduce((sum, l) => sum + (l.value || 0), 0) / 1000).toFixed(0)}K</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Negotiation</p>
              <p className="text-3xl font-bold text-orange-400">{negotiationLeads}</p>
              <p className="text-xs text-slate-500 mt-1">${(leads.filter(l => l.status === 'negotiation').reduce((sum, l) => sum + (l.value || 0), 0) / 1000).toFixed(0)}K</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Won</p>
              <p className="text-3xl font-bold text-green-400">{wonLeads}</p>
              <p className="text-xs text-slate-500 mt-1">${(totalRevenue / 1000).toFixed(0)}K</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">Lost</p>
              <p className="text-3xl font-bold text-red-400">{lostLeads}</p>
              <p className="text-xs text-slate-500 mt-1">${(leads.filter(l => l.status === 'lost').reduce((sum, l) => sum + (l.value || 0), 0) / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </Card>

        {/* Projects & Team Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Projects */}
          <Card className="p-6 bg-slate-800/60 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                Projects
              </h2>
              <Button onClick={() => setShowProjectModal(true)} className="bg-purple-600 hover:bg-purple-700 text-sm">
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>
            {projects.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="p-4 bg-slate-700/40 border-slate-600 hover:bg-slate-700/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm mb-1">{project.name}</h3>
                        <p className="text-xs text-slate-400 mb-2">
                          {project.description || "No description"}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-600/30 text-purple-200 border-purple-500/60 text-xs">
                            {project.status || 'Active'}
                          </Badge>
                          {project.budget && (
                            <span className="text-xs text-slate-400">
                              ${Number(project.budget).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm mb-3">No projects yet</p>
                <Button onClick={() => setShowProjectModal(true)} className="bg-purple-600 hover:bg-purple-700 text-sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Create First Project
                </Button>
              </div>
            )}
          </Card>

          {/* Sales Team */}
          <Card className="p-6 bg-slate-800/60 border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Sales Team
            </h2>
            {salesTeam.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {salesTeam.map((member: any) => {
                  const memberLeads = leads.filter(l => l.assigned_to === member.id);
                  const memberRevenue = memberLeads.filter(l => l.status === 'won').reduce((sum, l) => sum + (l.value || 0), 0);
                  const memberWon = memberLeads.filter(l => l.status === 'won').length;
                  
                  return (
                    <Card
                      key={member.id}
                      className="p-4 bg-slate-700/40 border-slate-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                            {(member.full_name || member.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-sm">
                              {member.full_name || member.email?.split('@')[0] || 'Unknown'}
                            </h3>
                            <p className="text-xs text-slate-400">{member.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Leads: {memberLeads.length}</p>
                          <p className="text-xs text-green-400">Won: {memberWon}</p>
                          <p className="text-xs text-slate-300">${(memberRevenue / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No sales team members yet</p>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Leads */}
        <Card className="p-6 bg-slate-800/60 border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Recent Leads</h2>
          {leads.length > 0 ? (
            <div className="space-y-2">
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-slate-700/40 border border-slate-600 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm">{lead.company_name}</h3>
                    <p className="text-xs text-slate-400">{lead.contact_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={
                      lead.status === 'won' ? 'bg-green-600/30 text-green-200 border-green-500/60' :
                      lead.status === 'lost' ? 'bg-red-600/30 text-red-200 border-red-500/60' :
                      lead.status === 'negotiation' ? 'bg-orange-600/30 text-orange-200 border-orange-500/60' :
                      'bg-blue-600/30 text-blue-200 border-blue-500/60'
                    }>
                      {lead.status}
                    </Badge>
                    <span className="text-sm font-semibold text-white">${((lead.value || 0) / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No leads yet</p>
            </div>
          )}
        </Card>



        <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="proj_name">Project Name</Label>
                <Input
                  id="proj_name"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="Q1 Sales Campaign"
                />
              </div>
              <div>
                <Label htmlFor="proj_desc">Description</Label>
                <Input
                  id="proj_desc"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Project description"
                />
              </div>
              <div>
                <Label htmlFor="proj_budget">Budget (USD)</Label>
                <Input
                  id="proj_budget"
                  type="number"
                  value={projectForm.budget}
                  onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                  placeholder="150000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProjectModal(false)} disabled={creatingProject}>Cancel</Button>
              <Button onClick={handleCreateProject} disabled={creatingProject}>
                {creatingProject ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
};

export default ManagerDashboard;


