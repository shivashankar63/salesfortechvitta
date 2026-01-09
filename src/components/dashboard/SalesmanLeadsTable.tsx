import { Search, Filter, ChevronDown, Phone, MessageSquare, MoreHorizontal, Loader, X, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLeads, getCurrentUser, supabase, subscribeToLeads, createActivity } from "@/lib/supabase";

interface Lead {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  status: "new" | "qualified" | "proposal" | "closed_won" | "not_interested";
  value: number;
  assigned_to?: string;
  projects?: { name: string; deadline?: string };
  project_id?: string;
  last_contacted_at?: string;
}

const SalesmanLeadsTable = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [groupByProject, setGroupByProject] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState("");
  const [noteText, setNoteText] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const fetchLeads = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const { data } = await getLeads();
          const userLeads = (data || []).filter((l: any) => l.assigned_to === user.id);
          setLeads(userLeads);
          // Realtime subscribe to this user's assigned leads
          const sub = subscribeToLeads(async (payload: any) => {
            const et = payload?.eventType || payload?.type;
            const newRow = payload?.new;
            const oldRow = payload?.old;
            if (et === 'INSERT') {
              if (newRow && newRow.assigned_to === user.id) {
                setLeads(prev => {
                  const exists = prev.some(l => l.id === newRow.id);
                  return exists ? prev.map(l => l.id === newRow.id ? newRow : l) : [...prev, newRow];
                });
              }
            } else if (et === 'UPDATE') {
              if (newRow?.assigned_to === user.id) {
                setLeads(prev => prev.some(l => l.id === newRow.id)
                  ? prev.map(l => l.id === newRow.id ? newRow : l)
                  : [...prev, newRow]
                );
              } else if (oldRow?.assigned_to === user.id) {
                // Lead moved away from this user
                setLeads(prev => prev.filter(l => l.id !== oldRow.id));
              }
            } else if (et === 'DELETE') {
              if (oldRow) {
                setLeads(prev => prev.filter(l => l.id !== oldRow.id));
              }
            }
          });
          cleanup = () => { try { sub.unsubscribe?.(); } catch {} };
        } else {
          const { data } = await getLeads();
          setLeads(data || []);
        }
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();

    return () => {
      try { cleanup?.(); } catch {}
    };
  }, []);

  // Calculate leads needing attention (not contacted in 7+ days)
  const getNeedsAttention = (lead: Lead) => {
    if (!lead.last_contacted_at) return true;
    const lastContact = new Date(lead.last_contacted_at);
    const daysSince = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 7;
  };

  // Get unique projects
  const uniqueProjects = Array.from(new Set(leads.map(l => l.projects?.name).filter(Boolean)));

  // Calculate project stats
  const projectStats = uniqueProjects.map(projectName => {
    const projectLeads = leads.filter(l => l.projects?.name === projectName);
    return {
      name: projectName,
      count: projectLeads.length,
      value: projectLeads.reduce((sum, l) => sum + l.value, 0),
      needsAttention: projectLeads.filter(getNeedsAttention).length,
    };
  });

  // Leads needing attention today
  const focusLeads = leads.filter(lead => {
    const needsAttention = getNeedsAttention(lead);
    const isActive = lead.status !== 'closed_won' && lead.status !== 'not_interested';
    return needsAttention && isActive;
  }).slice(0, 5);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.contact_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesProject = projectFilter === "all" || lead.projects?.name === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  // Sort leads by project if grouping is enabled
  const sortedLeads = groupByProject
    ? [...filteredLeads].sort((a, b) => {
        const projectA = a.projects?.name || 'zzz_no_project';
        const projectB = b.projects?.name || 'zzz_no_project';
        return projectA.localeCompare(projectB);
      })
    : filteredLeads;

  const statusLabel: Record<string, string> = {
    all: "All Status",
    new: "New",
    qualified: "Qualified",
    proposal: "Proposal",
    closed_won: "Closed Won",
    not_interested: "Not Interested",
  };

  const getStatusBadge = (status: Lead["status"]) => {
    const styles = {
      new: "bg-blue-50 text-blue-700 border-blue-200",
      qualified: "bg-indigo-50 text-indigo-700 border-indigo-200",
      proposal: "bg-amber-50 text-amber-700 border-amber-200",
      closed_won: "bg-emerald-50 text-emerald-700 border-emerald-200",
      not_interested: "bg-rose-50 text-rose-700 border-rose-200",
    } as const;

    const labels = {
      new: "New",
      qualified: "Qualified",
      proposal: "Proposal",
      closed_won: "Closed Won",
      not_interested: "Not Interested",
    } as const;

    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const handleCallLead = (lead: Lead) => {
    const phone = (lead as any).contact_phone || (lead as any).phone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      alert("No phone number available for this lead");
    }
  };

  const handleMessageLead = (lead: Lead) => {
    const email = (lead as any).contact_email || (lead as any).email;
    const phone = (lead as any).contact_phone || (lead as any).phone;
    if (email) {
      window.location.href = `mailto:${email}`;
    } else if (phone) {
      window.location.href = `sms:${phone}`;
    } else {
      alert("No contact information available for this lead");
    }
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);
    setEditingStatus(lead.status);
    setUpdateMessage(null);
    setShowEditModal(true);
  };

  const handleAddNote = (lead: Lead) => {
    setSelectedLead(lead);
    setNoteText("");
    setUpdateMessage(null);
    setShowNoteModal(true);
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;
    
    setUpdateLoading(true);
    setUpdateMessage(null);

    try {
      const { error } = await supabase
        .from("leads")
        .update({
          status: editingStatus,
        })
        .eq("id", selectedLead.id);

      if (error) {
        setUpdateMessage({ type: "error", text: error.message });
      } else {
        setUpdateMessage({ type: "success", text: "Lead updated successfully!" });
        
        // Update local state
        setLeads(leads.map(lead => 
          lead.id === selectedLead.id 
            ? { ...lead, status: editingStatus as any }
            : lead
        ));

        setTimeout(() => {
          setShowEditModal(false);
          setSelectedLead(null);
        }, 1500);
      }
    } catch (error: any) {
      setUpdateMessage({ type: "error", text: error.message });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAddNoteSubmit = async () => {
    if (!selectedLead || !noteText.trim()) {
      alert("Please enter a note");
      return;
    }
    
    setUpdateLoading(true);
    setUpdateMessage(null);

    try {
      const user = await getCurrentUser();
      const title = `Note - ${selectedLead.company_name}`;

      // Use helper that matches table schema and includes required title
      const { error } = await createActivity({
        user_id: user?.id as string,
        type: "note",
        title,
        description: noteText,
        lead_id: selectedLead.id,
      });

      if (error) {
        setUpdateMessage({ type: "error", text: error.message });
      } else {
        setUpdateMessage({ type: "success", text: "Note added successfully!" });
        
        setTimeout(() => {
          setShowNoteModal(false);
          setSelectedLead(null);
          setNoteText("");
        }, 1500);
      }
    } catch (error: any) {
      setUpdateMessage({ type: "error", text: error.message });
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Project Stats Cards */}
      {projectStats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projectStats.map(stat => (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-900 truncate">{stat.name}</h3>
                {stat.needsAttention > 0 && (
                  <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs px-1.5 py-0.5">
                    {stat.needsAttention} urgent
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-xs">{stat.count} leads</span>
                </div>
                <span className="text-sm font-bold text-slate-900">${(stat.value / 1000).toFixed(0)}K</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Today's Focus Section */}
      {focusLeads.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm font-semibold text-amber-900">Today's Focus - Needs Attention</h3>
          </div>
          <div className="space-y-2">
            {focusLeads.map(lead => (
              <div key={lead.id} className="flex items-center justify-between bg-white rounded p-2 border border-amber-100">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarFallback className="bg-amber-100 text-amber-900 text-xs">
                      {lead.company_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{lead.company_name}</p>
                    {lead.projects?.name && (
                      <p className="text-xs text-slate-500 truncate">{lead.projects.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {lead.last_contacted_at && (
                    <div className="flex items-center gap-1 text-xs text-amber-700">
                      <Clock className="w-3 h-3" />
                      {Math.floor((Date.now() - new Date(lead.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))}d
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="h-6 text-xs px-2 bg-amber-600 hover:bg-amber-700"
                    onClick={() => handleViewDetails(lead)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl shadow-soft p-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900">My Leads</h2>
          <Button
            variant={groupByProject ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setGroupByProject(!groupByProject)}
          >
            {groupByProject ? "Grouped" : "Group by Project"}
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-full sm:w-56 text-sm"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-8 text-sm px-3">
                <Filter className="w-3.5 h-3.5" />
                {projectFilter === "all" ? "All Projects" : projectFilter}
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setProjectFilter("all")}>
                All Projects
              </DropdownMenuItem>
              {uniqueProjects.map(project => (
                <DropdownMenuItem key={project} onClick={() => setProjectFilter(project)}>
                  {project}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-8 text-sm px-3">
                <Filter className="w-3.5 h-3.5" />
                {statusLabel[statusFilter] || "All Status"}
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("new")}>
                New
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("qualified")}>
                Qualified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("proposal")}>
                Proposal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("closed_won")}>
                Closed Won
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("not_interested")}>
                Not Interested
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-5 h-5 animate-spin text-slate-900 mr-2" />
          <span className="text-sm text-slate-600">Loading...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 font-medium text-xs text-slate-700">Lead</th>
                <th className="text-left py-2 px-3 font-medium text-xs text-slate-700">Project</th>
                <th className="text-left py-2 px-3 font-medium text-xs text-slate-700">Contact</th>
                <th className="text-left py-2 px-3 font-medium text-xs text-slate-700">Status</th>
                <th className="text-right py-2 px-3 font-medium text-xs text-slate-700">Value</th>
                <th className="text-center py-2 px-3 font-medium text-xs text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeads.length > 0 ? (
                sortedLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleViewDetails(lead)}>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="bg-slate-100 text-slate-900 text-xs font-medium">
                            {lead.company_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-slate-900">{lead.company_name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      {lead.projects?.name ? (
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs px-2 py-0.5">
                            {lead.projects.name}
                          </Badge>
                          {lead.projects.deadline && new Date(lead.projects.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs px-1.5 py-0.5">
                              Due Soon
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No project</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-900">{lead.contact_name}</div>
                          {(lead as any).contact_email || (lead as any).email ? (
                            <div className="text-xs text-slate-500 mt-0.5 truncate">{(lead as any).contact_email || (lead as any).email}</div>
                          ) : null}
                        </div>
                        {lead.last_contacted_at && getNeedsAttention(lead) && (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs px-1.5 py-0.5 flex-shrink-0">
                            <Clock className="w-3 h-3 inline mr-0.5" />
                            {Math.floor((Date.now() - new Date(lead.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))}d
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">{getStatusBadge(lead.status)}</td>
                    <td className="py-2 px-3 text-right text-xs font-semibold text-slate-900">
                      ${(lead.value / 1000).toFixed(0)}K
                    </td>
                    <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 hover:bg-slate-100" 
                          title="Call"
                          onClick={() => handleCallLead(lead)}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 hover:bg-slate-100" 
                          title="Message"
                          onClick={() => handleMessageLead(lead)}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(lead)}>Edit Lead</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDetails(lead)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(lead)}>Change Status</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddNote(lead)}>Add Note</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Company Name</Label>
                <p className="text-sm font-medium text-foreground mt-1">{selectedLead.company_name}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Project</Label>
                <p className="text-sm font-medium text-foreground mt-1">
                  {selectedLead.projects?.name ? (
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                      {selectedLead.projects.name}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">No project assigned</span>
                  )}
                </p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Contact Name</Label>
                <p className="text-sm font-medium text-foreground mt-1">{selectedLead.contact_name}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
                <p className="text-sm font-medium text-foreground mt-1">{selectedLead.contact_email || "N/A"}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Phone</Label>
                <p className="text-sm font-medium text-foreground mt-1">{selectedLead.contact_phone || "N/A"}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Status</Label>
                <p className="text-sm font-medium text-foreground mt-1">{statusLabel[selectedLead.status] || selectedLead.status}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Value</Label>
                <p className="text-sm font-medium text-foreground mt-1">${(selectedLead.value / 1000).toFixed(0)}K</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Lead - {selectedLead?.company_name}</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              {updateMessage && (
                <Alert className={updateMessage.type === "success" ? "bg-success/10 border-success/20" : "bg-destructive/10 border-destructive/20"}>
                  <AlertDescription className={updateMessage.type === "success" ? "text-success" : "text-destructive"}>
                    {updateMessage.text}
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground"
                >
                  <option value="new">New</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="closed_won">Closed Won</option>
                  <option value="not_interested">Not Interested</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEditModal(false)}
              disabled={updateLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateLead}
              disabled={updateLoading}
            >
              {updateLoading ? "Updating..." : "Update Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note - {selectedLead?.company_name}</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              {updateMessage && (
                <Alert className={updateMessage.type === "success" ? "bg-success/10 border-success/20" : "bg-destructive/10 border-destructive/20"}>
                  <AlertDescription className={updateMessage.type === "success" ? "text-success" : "text-destructive"}>
                    {updateMessage.text}
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  placeholder="Enter your note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground"
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowNoteModal(false)}
              disabled={updateLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddNoteSubmit}
              disabled={updateLoading}
            >
              {updateLoading ? "Adding..." : "Add Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default SalesmanLeadsTable;

