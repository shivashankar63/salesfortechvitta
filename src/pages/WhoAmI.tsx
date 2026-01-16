import { useEffect, useState } from "react";
import { getCurrentUser, getUserById } from "@/lib/supabase";

const WhoAmI = () => {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          const { data, error } = await getUserById(currentUser.id);
          if (error) setError(error.message);
          setUserData(data);
        }
      } catch (err) {
        setError("Error fetching user info");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <div style={{padding:'2rem'}}>Loading...</div>;
  if (error) return <div style={{color:'red',padding:'2rem'}}>{error}</div>;
  if (!user) return <div style={{padding:'2rem'}}>No user logged in.</div>;

  return (
    <div style={{padding:'2rem',background:'#fffbe6',border:'2px solid #ffe58f',borderRadius:'8px',fontSize:'1.1rem'}}>
      <h2>Current User Info</h2>
      <pre style={{background:'#fff',padding:'1rem',borderRadius:'6px'}}>{JSON.stringify(userData, null, 2)}</pre>
      <div><strong>Role:</strong> {String(userData?.role || '')}</div>
      <div><strong>Email:</strong> {userData?.email}</div>
      <div><strong>Name:</strong> {userData?.full_name}</div>
    </div>
  );
};

export default WhoAmI;
