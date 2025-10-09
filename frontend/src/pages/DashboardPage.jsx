import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePropertyContext } from '../context/PropertyContext';
import PropertySelector from '../components/PropertySelector';
import MonthYearPicker from '../components/MonthYearPicker';
import { Users, TrendingUp, Bed, Building2, IndianRupee, AlertCircle, Calendar, UserPlus, UserMinus } from 'lucide-react';

const StatCard = ({ title, value, description, icon: Icon, gradient }) => (
  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`}></div>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {Icon && (
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      )}
    </CardHeader>
    <CardContent>
      <div className="text-xl sm:text-2xl font-bold tracking-tight break-words">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { selectedProperty, refetchKey, triggerRefetch } = usePropertyContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGeneratingDues, setIsGeneratingDues] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      console.log(`Fetching data for: ${month}/${year}`);
      const response = await API.get(`/properties/stats/historical?year=${year}&month=${month}&propertyId=${selectedProperty}`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data.', err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [selectedProperty, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refetchKey]); 

  const handleGenerateDues = async () => {
    setIsGeneratingDues(true);
    const requestBody = selectedProperty !== 'all' ? { propertyId: selectedProperty } : {};
    const promise = API.post('/payments/generate-dues', requestBody);
    toast.promise(promise, {
      loading: 'Generating dues for today...',
      success: (response) => {
        triggerRefetch();
        setIsGeneratingDues(false);
        return response.data.message || 'Dues generated successfully!';
      },
      error: (err) => {
        setIsGeneratingDues(false);
        return err.response?.data?.message || 'Failed to generate dues.';
      },
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  const occupancyPercentage = (stats && stats.totalBeds > 0) ? ((stats.occupiedBeds / stats.totalBeds) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Analytics for {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <MonthYearPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <PropertySelector />
        </div>
      </div>
      
      {stats ? (
        <div className="space-y-8">
          {/* Financial Overview Section */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-3">Financial Overview</h2>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Collected This Month" 
                value={`₹${stats.amountCollectedInMonth.toLocaleString('en-IN')}`} 
                description="Total rent paid" 
                icon={IndianRupee} 
                gradient="from-green-500 to-emerald-600" 
              />
              <StatCard 
                title="Due This Month" 
                value={`₹${stats.amountDueInMonth.toLocaleString('en-IN')}`} 
                description="Pending collection" 
                icon={AlertCircle} 
                gradient="from-red-500 to-red-600" 
              />
              <StatCard 
                title="Expected from Tenants" 
                value={`₹${stats.expectedIncomeFromTenants.toLocaleString('en-IN')}`} 
                description="Based on active tenants" 
                icon={TrendingUp} 
                gradient="from-blue-500 to-blue-600" 
              />
              <StatCard 
                title="Potential from Beds" 
                value={`₹${stats.totalPotentialRevenue.toLocaleString('en-IN')}`} 
                description="If all beds were full" 
                icon={Bed} 
                gradient="from-purple-500 to-purple-600" 
              />
            </div>
          </div>

          {/* Tenant Activity Section */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-3">Tenant Activity</h2>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard 
                title="New Tenants This Month" 
                value={stats.newTenantsInMonth} 
                description="New joiners" 
                icon={UserPlus} 
                gradient="from-cyan-500 to-cyan-600" 
              />
              <StatCard 
                title="Vacated This Month" 
                value={stats.vacatedTenantsInMonth} 
                description="Tenants who left" 
                icon={UserMinus} 
                gradient="from-amber-500 to-amber-600" 
              />
              <StatCard 
                title="Advance Collected" 
                value={`₹${stats.totalAdvanceCollected.toLocaleString('en-IN')}`} 
                description="From new tenants this month" 
                icon={Users} 
                gradient="from-indigo-500 to-indigo-600" 
              />
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full h-11 sm:h-12 text-sm sm:text-base" 
                    onClick={handleGenerateDues} 
                    disabled={isGeneratingDues}
                  >
                    <Calendar className="mr-2 h-4 w-4" /> 
                    {isGeneratingDues ? 'Generating...' : 'Generate Today\'s Dues'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-11 sm:h-12 text-sm sm:text-base" 
                    asChild
                  >
                    <Link to="/properties">
                      <Building2 className="mr-2 h-4 w-4" /> 
                      Manage Properties
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-8 sm:py-12 text-center mx-4 sm:mx-0">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">No Data Available</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              There is no data to display for the selected month and property.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;