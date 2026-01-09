import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import SalesmanLeadsTable from "@/components/dashboard/SalesmanLeadsTable";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import QuotaProgress from "@/components/dashboard/QuotaProgress";
import { getCurrentUser } from "@/lib/supabase";

const SalesmanDashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        await getCurrentUser();
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardSidebar role="salesman" />
      
      <main className="flex-1 p-4 lg:p-8 pt-20 sm:pt-16 lg:pt-8 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-700">Loading your dashboard...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">My Sales Dashboard</h1>
              <p className="text-slate-400">Live view of your pipeline, quota, and activity</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 space-y-6">
                <SalesmanLeadsTable />
              </div>
              <div className="space-y-6">
                <QuotaProgress />
                <ActivityTimeline />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SalesmanDashboard;


