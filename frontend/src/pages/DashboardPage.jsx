import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import { usePropertyContext } from '../context/PropertyContext';
import PropertySelector from '../components/PropertySelector';
import MonthYearPicker from '../components/MonthYearPicker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, TrendingUp, Bed, Building2, IndianRupee, AlertCircle, ArrowRight, Calendar, UserPlus, UserMinus, CheckCircle } from 'lucide-react';

const StatCard = ({ title, value, description, icon: Icon, gradient, onClick }) => (
  <Card 
    className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
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
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { selectedProperty, refetchKey, triggerRefetch } = usePropertyContext();
  const [stats, setStats] = useState(null);
  const [duePayments, setDuePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGeneratingDues, setIsGeneratingDues] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [drilldownTitle, setDrilldownTitle] = useState('');
  const [drilldownData, setDrilldownData] = useState([]);
  const [isDrilldownLoading, setIsDrilldownLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      
      const [statsRes, duesRes] = await Promise.all([
        API.get(`/properties/stats/historical?year=${year}&month=${month}&propertyId=${selectedProperty}`),
        API.get(`/payments/outstanding?propertyId=${selectedProperty}`)
      ]);
      setStats(statsRes.data);
      setDuePayments(duesRes.data);
    } catch (err) {
      setError('Failed to fetch dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedProperty, selectedDate, refetchKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatCardClick = async (type) => {
    if (!stats || (type === 'new' && stats.newTenantsInMonth === 0) || (type === 'vacated' && stats.vacatedTenantsInMonth === 0)) {
        return;
    }
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    let endpoint = '';
    
    if (type === 'new') {
        setDrilldownTitle(`New Tenants in ${selectedDate.toLocaleString('default', { month: 'long' })}`);
        endpoint = `/tenants/joined-in-month?year=${year}&month=${month}&propertyId=${selectedProperty}`;
    } else if (type === 'vacated') {
        setDrilldownTitle(`Vacated Tenants in ${selectedDate.toLocaleString('default', { month: 'long' })}`);
        endpoint = `/tenants/vacated-in-month?year=${year}&month=${month}&propertyId=${selectedProperty}`;
    }

    setIsDrilldownLoading(true);
    setIsDrilldownOpen(true);
    try {
        const response = await API.get(endpoint);
        setDrilldownData(response.data);
    } catch (error) {
        console.error(`Failed to fetch ${type} tenants`, error);
        setDrilldownData([]);
    } finally {
        setIsDrilldownLoading(false);
    }
  };

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Analytics for {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            <MonthYearPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
            <PropertySelector />
        </div>
      </div>
      
      {stats ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-3">Financial Overview</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Collected This Month" value={`₹${(stats.amountCollectedInMonth ?? 0).toLocaleString('en-IN')}`} description="Total rent paid" icon={IndianRupee} gradient="from-green-500 to-emerald-600" />
                <StatCard title="Expected This Month" value={`₹${(stats.expectedIncomeFromTenants ?? 0).toLocaleString('en-IN')}`} description="Based on active tenants" icon={TrendingUp} gradient="from-blue-500 to-blue-600" />
                <StatCard title="Potential Revenue" value={`₹${(stats.totalPotentialRevenue ?? 0).toLocaleString('en-IN')}`} description="If all beds were full" icon={Bed} gradient="from-purple-500 to-purple-600" />
                <StatCard title="Advance Collected" value={`₹${(stats.totalAdvanceCollected ?? 0).toLocaleString('en-IN')}`} description="From new tenants this month" icon={Users} gradient="from-indigo-500 to-indigo-600" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3">Tenant Activity</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="New Tenants" value={stats.newTenantsInMonth ?? 0} description="New joiners this month (Click to view)" icon={UserPlus} gradient="from-cyan-500 to-cyan-600" onClick={() => handleStatCardClick('new')} />
                <StatCard title="Vacated Tenants" value={stats.vacatedTenantsInMonth ?? 0} description="Tenants who left this month (Click to view)" icon={UserMinus} gradient="from-amber-500 to-amber-600" onClick={() => handleStatCardClick('vacated')} />
                <StatCard title="Occupancy" value={`${occupancyPercentage}%`} description={`${stats.occupiedBeds}/${stats.totalBeds} beds filled`} icon={Bed} gradient="from-pink-500 to-rose-500" />
                <StatCard title="Properties" value={stats.totalProperties} description="Managed locations" icon={Building2} gradient="from-orange-500 to-orange-600" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Currently Outstanding Payments</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">All dues that require attention right now</p>
                  </div>
                  <Link to="/payments" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group">
                    View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </CardHeader>
                <CardContent className="pt-6">
                  {duePayments.length > 0 ? (
                    <Table>
                      <TableHeader><TableRow><TableHead>Tenant</TableHead><TableHead>Rent Amount</TableHead><TableHead className="text-right">Advance Paid</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {duePayments.slice(0, 5).map(p => (
                          p.tenant && (
                            <TableRow key={p._id}>
                              <TableCell className="font-medium">{p.tenant.fullName}</TableCell>
                              <TableCell className="font-semibold text-red-600">₹{p.amount.toLocaleString('en-IN')}</TableCell>
                              <TableCell className="text-right">₹{(p.tenant.advancePaid ?? 0).toLocaleString('en-IN')}</TableCell>
                            </TableRow>
                          )
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-green-100 p-3 mb-4"><CheckCircle className="h-8 w-8 text-green-600" /></div>
                      <p className="text-lg font-medium">All Clear!</p>
                      <p className="text-sm text-muted-foreground mt-1">No outstanding payments at the moment</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-1">
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-xl">Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {/* <Button className="w-full h-12" onClick={handleGenerateDues} disabled={isGeneratingDues}>
                    <Calendar className="mr-2 h-4 w-4" /> {isGeneratingDues ? 'Generating...' : 'Generate Today\'s Dues'}
                  </Button> */}
                  <Button variant="outline" className="w-full h-12" asChild>
                    <Link to="/properties"><Building2 className="mr-2 h-4 w-4" /> Manage Properties</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <CardHeader><CardTitle className="text-xl">No Data Available</CardTitle><CardDescription>There is no data to display for the selected month and property.</CardDescription></CardHeader>
        </Card>
      )}

      {/* --- THIS IS THE UPDATED DETAILS MODAL --- */}
      <Dialog open={isDrilldownOpen} onOpenChange={setIsDrilldownOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>{drilldownTitle}</DialogTitle></DialogHeader>
          {isDrilldownLoading ? <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div> : (
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Rent Amount</TableHead>
                    <TableHead className="text-right">Advance Paid</TableHead>
                    <TableHead className="text-right">{drilldownTitle.includes('New') ? 'Joining Date' : 'Vacated Date'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drilldownData.length > 0 ? drilldownData.map(tenant => (
                    <TableRow key={tenant._id}>
                      <TableCell className="font-medium">{tenant.fullName}</TableCell>
                      <TableCell>{tenant.phone}</TableCell>
                      <TableCell>{tenant.property.name}</TableCell>
                      <TableCell>₹{(tenant.bed?.rentAmount ?? 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">₹{(tenant.advancePaid ?? 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">{new Date(tenant.joiningDate || tenant.vacatedDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan="6" className="text-center h-24">No tenants found for this period.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;