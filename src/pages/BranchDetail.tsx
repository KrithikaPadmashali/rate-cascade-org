
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Account, BranchWithChildrenAndAccounts } from "@/models/types";
import { mockGetBranchDetails, mockUpdateBranchRate } from "@/services/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BranchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const branchId = parseInt(id || "0");
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [branchData, setBranchData] = useState<BranchWithChildrenAndAccounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [newRate, setNewRate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchBranchData = async () => {
      if (!branchId) return;
      
      try {
        const data = await mockGetBranchDetails(branchId);
        setBranchData(data);
      } catch (err) {
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
  }, [branchId, toast]);

  // Check if the current user has access to this branch
  useEffect(() => {
    if (!loading && user && user.role === 'BRANCH_MANAGER' && user.branchId !== branchId) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this branch",
        variant: "destructive",
      });
      navigate(`/branch/${user.branchId}`);
    }
  }, [loading, user, branchId, navigate, toast]);

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
      
      // Update our local state to reflect the cascading changes
      setBranchData(prev => {
        if (!prev) return null;
        
        // Create updated copies of children and accounts with the new rate
        const updatedChildren = prev.children.map(child => ({
          ...child,
          rate: rate
        }));
        
        const updatedAccounts = prev.accounts.map(account => ({
          ...account,
          rate: rate
        }));
        
        return {
          ...prev,
          branch: {
            ...prev.branch,
            rate: updatedBranch.rate
          },
          children: updatedChildren,
          accounts: updatedAccounts
        };
      });
      
      toast({
        title: "Rate Updated",
        description: `Rate has been updated to ${rate}% for all sub-branches and accounts.`,
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

  const navigateToBranch = (id: number) => {
    navigate(`/branch/${id}`);
  };

  const navigateBack = () => {
    // If user is admin, go to dashboard, otherwise stay at current branch
    if (user?.role === 'ADMIN') {
      navigate('/dashboard');
    }
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
        <div className="mb-6 flex justify-between items-center">
          <div>
            {user?.role === 'ADMIN' && (
              <Button 
                variant="outline" 
                className="mb-4"
                onClick={navigateBack}
              >
                Back to Dashboard
              </Button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">{branchData?.branch.name}</h2>
            <p className="text-gray-500">Branch Code: {branchData?.branch.code}</p>
          </div>
        </div>

        {/* Branch Stats */}
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
              <CardTitle className="text-sm font-medium">Accounts</CardTitle>
              <CardDescription>Direct accounts under this branch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {branchData?.accounts.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Update Rate</CardTitle>
              <CardDescription>Changes will cascade to all sub-branches</CardDescription>
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

        {/* Child Branches */}
        {branchData?.children && branchData.children.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Child Branches</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branchData.children.map((branch) => (
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
            </div>
          </div>
        )}

        {/* Accounts */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Accounts</h3>
          
          {branchData?.accounts && branchData.accounts.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {branchData.accounts.map((account: Account) => (
                    <tr key={account.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.accountNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${account.balance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No accounts found for this branch.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BranchDetail;
