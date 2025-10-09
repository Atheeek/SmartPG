import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePropertyContext } from '../context/PropertyContext';
import PropertySelector from '../components/PropertySelector';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Building, Search, UserCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StatCard = ({ title, value, icon: Icon }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const AllTenantsPage = () => {
    const [tenants, setTenants] = useState([]); // Will hold either active or inactive tenants
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { selectedProperty, refetchKey } = usePropertyContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('active'); // State for controlling the tabs

    // This useEffect now re-fetches data when the tab changes or a global refresh happens
    useEffect(() => {
        const fetchTenants = async () => {
            try {
                setLoading(true);
                const response = await API.get(`/tenants/all?status=${activeTab}`);
                setTenants(response.data);
            } catch (err) {
                setError('Failed to fetch tenants.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTenants();
    }, [activeTab, refetchKey]);

    const filteredTenants = useMemo(() => {
        let currentTenants = tenants;
        if (selectedProperty !== 'all') {
            currentTenants = currentTenants.filter(tenant => tenant.property._id === selectedProperty);
        }
        if (searchQuery) {
            currentTenants = currentTenants.filter(tenant =>
                tenant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tenant.phone.includes(searchQuery)
            );
        }
        return currentTenants;
    }, [tenants, selectedProperty, searchQuery]);

    const tenantStats = useMemo(() => {
        const totalProperties = [...new Set(tenants.map(t => t.property._id))].length;
        return {
            totalTenantsInView: tenants.length,
            propertiesInView: totalProperties,
        };
    }, [tenants]);

    const getInitials = (name) => {
        if (!name) return "";
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + (parts[parts.length - 1].charAt(0) || '')).toUpperCase();
    };

    if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tenant Directory</h1>
                <p className="text-muted-foreground">Search and manage all tenants across your properties.</p>
            </div>

            {/* The Tabs component now controls the data */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
                    <TabsTrigger value="active">Active Tenants</TabsTrigger>
                    <TabsTrigger value="inactive">Vacated Tenants</TabsTrigger>
                </TabsList>
                
                {/* The rest of your UI will now dynamically update based on the selected tab */}
                <div className="space-y-4 mt-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Title of this card is now dynamic */}
                        <StatCard title={`Total ${activeTab === 'active' ? 'Active' : 'Vacated'} Tenants`} value={tenantStats.totalTenantsInView} icon={Users} />
                        <StatCard title="Properties in View" value={tenantStats.propertiesInView} icon={Building} />
                        <StatCard title="Showing Results" value={filteredTenants.length} icon={UserCheck} />
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="relative w-full sm:w-auto flex-grow">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by name or phone..."
                                        className="pl-8 sm:w-[300px] w-full"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="w-full sm:w-auto">
                                    <PropertySelector />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? <LoadingSpinner /> : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Property</TableHead>
                                            <TableHead>Last Location</TableHead>
                                            {/* This table header is now dynamic */}
                                            <TableHead>{activeTab === 'active' ? 'Joining Date' : 'Vacated Date'}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTenants.length > 0 ? (
                                            filteredTenants.map(tenant => (
                                                <TableRow key={tenant._id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarFallback className={activeTab === 'active' ? '' : 'bg-gray-200 text-gray-500'}>{getInitials(tenant.fullName)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <Link to={`/tenants/${tenant._id}`} className="font-semibold hover:underline">
                                                                    {tenant.fullName}
                                                                </Link>
                                                                <div className="text-xs text-muted-foreground">{tenant.phone}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{tenant.property.name}</TableCell>
                                                    <TableCell>F-{tenant.bed.room.floor === 0 ? 'G' : tenant.bed.room.floor}, R-{tenant.bed.room.roomNumber}, B-{tenant.bed.bedNumber}</TableCell>
                                                    {/* This table cell now shows the correct date */}
                                                    <TableCell>{new Date(activeTab === 'active' ? tenant.joiningDate : tenant.vacatedDate).toLocaleDateString()}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan="4" className="text-center h-24">No {activeTab} tenants found matching your criteria.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Tabs>
        </div>
    );
};

export default AllTenantsPage;