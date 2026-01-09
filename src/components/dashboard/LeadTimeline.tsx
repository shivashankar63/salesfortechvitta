import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Phone,
  Mail,
  StickyNote,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getActivitiesForLead, createLeadActivity, getCurrentUser } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

type ActivityType = "call" | "email" | "note" | "meeting" | "status_change" | "assignment";
type ActivityTag = "next_step" | "blocker" | "competitor" | "follow_up" | "question";

interface TimelineProps {
  leadId: string;
  leadName: string;
  lastContactedAt?: string;
}

const activityIcons: Record<ActivityType, any> = {
  call: Phone,
  email: Mail,
  note: StickyNote,
  meeting: Calendar,
  status_change: AlertCircle,
  assignment: User,
};

const activityColors: Record<ActivityType, string> = {
  call: "text-blue-600 bg-blue-50",
  email: "text-indigo-600 bg-indigo-50",
  note: "text-slate-600 bg-slate-50",
  meeting: "text-purple-600 bg-purple-50",
  status_change: "text-amber-600 bg-amber-50",
  assignment: "text-emerald-600 bg-emerald-50",
};

const tagColors: Record<ActivityTag, string> = {
  next_step: "bg-blue-100 text-blue-700 border-blue-200",
  blocker: "bg-rose-100 text-rose-700 border-rose-200",
  competitor: "bg-amber-100 text-amber-700 border-amber-200",
  follow_up: "bg-indigo-100 text-indigo-700 border-indigo-200",
  question: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function LeadTimeline({ leadId, leadName, lastContactedAt }: TimelineProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState<ActivityType>("note");
  const [noteTag, setNoteTag] = useState<ActivityTag | "">("");
  const [expanded, setExpanded] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [leadId]);

  const loadActivities = async () => {
    try {
      const { data } = await getActivitiesForLead(leadId);
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading timeline", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      const user = await getCurrentUser();
      const description = noteTag ? `[${noteTag}] ${noteText}` : noteText;
      await createLeadActivity({
        lead_id: leadId,
        type: noteType,
        description,
        user_id: user?.id,
      });
      setNoteText("");
      setNoteTag("");
      setShowAddNote(false);
      await loadActivities();
    } catch (error) {
      console.error("Failed to add activity", error);
    } finally {
      setSubmitting(false);
    }
  };

  const needsAttention = (): boolean => {
    if (!lastContactedAt) return true;
    const lastTouch = new Date(lastContactedAt);
    const daysSince = (Date.now() - lastTouch.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 7;
  };

  const lastTouchLabel = (): string => {
    if (!lastContactedAt) return "Never";
    try {
      return formatDistanceToNow(new Date(lastContactedAt), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  return (
    <Card className="border border-slate-200 shadow-sm bg-white">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-slate-600 hover:text-slate-900"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Activity Timeline</h3>
              <p className="text-sm text-slate-600">Recent engagement and notes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-slate-200 text-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last touch: {lastTouchLabel()}
            </Badge>
            {needsAttention() && (
              <Badge className="bg-rose-100 text-rose-700 border-rose-200 border flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Needs attention
              </Badge>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4">
          {/* Quick actions */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNoteType("call");
                setShowAddNote(true);
              }}
              className="border-slate-200"
            >
              <Phone className="w-4 h-4 mr-1" /> Log call
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNoteType("email");
                setShowAddNote(true);
              }}
              className="border-slate-200"
            >
              <Mail className="w-4 h-4 mr-1" /> Log email
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNoteType("note");
                setShowAddNote(true);
              }}
              className="border-slate-200"
            >
              <StickyNote className="w-4 h-4 mr-1" /> Add note
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNoteType("meeting");
                setShowAddNote(true);
              }}
              className="border-slate-200"
            >
              <Calendar className="w-4 h-4 mr-1" /> Log meeting
            </Button>
          </div>

          {/* Inline add form */}
          {showAddNote && (
            <Card className="mb-4 p-4 border border-slate-200 bg-slate-50">
              <div className="mb-3">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {noteType === "call"
                    ? "Call notes"
                    : noteType === "email"
                    ? "Email summary"
                    : noteType === "meeting"
                    ? "Meeting notes"
                    : "Add a note"}
                </label>
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="What happened?"
                  className="min-h-[80px] bg-white"
                />
              </div>
              <div className="mb-3">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Tag (optional)</label>
                <Select value={noteTag} onValueChange={(v) => setNoteTag(v as ActivityTag | "")}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="No tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No tag</SelectItem>
                    <SelectItem value="next_step">Next step</SelectItem>
                    <SelectItem value="blocker">Blocker</SelectItem>
                    <SelectItem value="competitor">Competitor</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddActivity} disabled={submitting} size="sm">
                  {submitting ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddNote(false);
                    setNoteText("");
                    setNoteTag("");
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Timeline */}
          {loading ? (
            <div className="text-sm text-slate-500">Loading timeline...</div>
          ) : activities.length === 0 ? (
            <div className="text-sm text-slate-500 py-4">
              No activity yet. Start by logging a call or adding a note.
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const type = (activity.type || activity.activity_type || "note") as ActivityType;
                const Icon = activityIcons[type] || StickyNote;
                const color = activityColors[type] || activityColors.note;
                const description = activity.description || "";
                const tagMatch = description.match(/^\[(\w+)\]/);
                const tag = tagMatch ? (tagMatch[1] as ActivityTag) : null;
                const cleanDesc = tag ? description.replace(/^\[\w+\]\s*/, "") : description;

                return (
                  <div key={activity.id} className="flex gap-3 items-start">
                    <div className={`p-2 rounded-full ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-900 capitalize">{type.replace("_", " ")}</span>
                        {tag && (
                          <Badge variant="outline" className={`text-xs border ${tagColors[tag]}`}>
                            {tag.replace("_", " ")}
                          </Badge>
                        )}
                        <span className="text-xs text-slate-500">
                          {activity.created_at
                            ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })
                            : "recently"}
                        </span>
                      </div>
                      {cleanDesc && <div className="text-sm text-slate-700 mt-1">{cleanDesc}</div>}
                      {activity.changed_from && activity.changed_to && (
                        <div className="text-xs text-slate-500 mt-1">
                          {activity.changed_from} → {activity.changed_to}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
