
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { BranchWithChildrenAndAccounts } from "@/models/types";
import { mockGetBranchDetails, mockUpdateBranchRate } from "@/services/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [branchData, setBranchData] = useState<BranchWithChildrenAndAccounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRate, setNewRate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        // For the admin, we'll always get the root branch (id: 1)
        const data = await mockGetBranchDetails(1);
        setBranchData(data);
      } catch (err) {
        setError("Failed to load branch data");
        toast({
          title: "Error",
          description: "Failed to load branch data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBranchData();
  }, [toast]);

  const handleRateUpdate = async () => {
    if (!branchData) return;

    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0) {
      toast({
        title: "Invalid Rate",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updatedBranch = await mockUpdateBranchRate(branchData.branch.id, { rate });
      
      // Update our local state
      setBranchData(prev => prev ? {
        ...prev,
        branch: {
          ...prev.branch,
          rate: updatedBranch.rate
        }
      } : null);
      
      toast({
        title: "Rate Updated",
        description: `Rate has been updated to ${rate}% for all branches and accounts.`,
      });
      
      setNewRate("");
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "Failed to update rate",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const navigateToBranch = (branchId: number) => {
    navigate(`/branch/${branchId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-brand-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h1 className="text-xl font-bold text-gray-900">Branch Rate Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Logged in as <span className="font-semibold">{user?.username}</span>
            </span>
            <Button variant="ghost" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Branch Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Headquarters Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Rate</CardTitle>
                <CardDescription>Applied to all sub-branches and accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-brand-600">
                  {branchData?.branch.rate || 0}%
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Child Branches</CardTitle>
                <CardDescription>Direct sub-branches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {branchData?.children.length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Update Rate</CardTitle>
                <CardDescription>Changes will cascade to all branches</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="New rate"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="w-24"
                  step="0.01"
                  min="0"
                />
                <Button onClick={handleRateUpdate} disabled={isUpdating || !newRate}>
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Child Branches */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Child Branches</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branchData?.children.map((branch) => (
              <Card key={branch.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{branch.name}</CardTitle>
                  <CardDescription>Code: {branch.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Rate:</span>
                      <span className="font-medium">{branch.rate}%</span>
                    </div>
                    <Separator />
                  </div>
                </CardContent>
                <div className="px-6 py-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigateToBranch(branch.id)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
            
            {branchData?.children.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No child branches found.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
