import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import SalesmanLeadsTable from "@/components/dashboard/SalesmanLeadsTable";
// import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
// import QuotaProgress from "@/components/dashboard/QuotaProgress";
import { getCurrentUser, getUserById } from "@/lib/supabase";

const SalesmanDashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate('/login', { replace: true });
          return;
        }

        const { data: userData } = await getUserById(currentUser.id);
        if (!userData) {
          navigate('/login', { replace: true });
          return;
        }
        const role = String(userData.role || '').toLowerCase().trim();
        
        // Only allow salesman role to access this dashboard
        if (role !== 'salesman') {
          const roleRoutes: Record<string, string> = { 
            owner: '/owner',
            manager: '/manager'
          };
          navigate(roleRoutes[role] || '/login', { replace: true });
          return;
        }
      } catch (error) {
        console.error("Error loading user:", error);
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <DashboardSidebar role="salesman" />
      
      <main className="flex-1 p-4 lg:p-8 pt-20 sm:pt-16 lg:pt-8 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-slate-900 mx-auto mb-4" />
              <p className="text-slate-700">Loading your dashboard...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
              <p className="text-sm text-slate-600">Track your pipeline and quota performance</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 col-span-1 sm:col-span-2 lg:col-span-3">
                <SalesmanLeadsTable />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* <QuotaProgress /> */}
              {/* <ActivityTimeline /> */}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SalesmanDashboard;


