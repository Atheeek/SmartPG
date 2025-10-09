// frontend/src/pages/PropertiesPage.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Calendar, Plus, Home, ArrowRight } from 'lucide-react';

const PropertiesPage = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPropertyName, setNewPropertyName] = useState('');
    const [newPropertyAddress, setNewPropertyAddress] = useState('');

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const response = await API.get('/properties');
            setProperties(response.data);
        } catch (err) {
            setError('Failed to fetch properties.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleAddProperty = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('/properties', {
                name: newPropertyName,
                address: newPropertyAddress
            });
            setProperties([...properties, response.data]);
            setNewPropertyName('');
            setNewPropertyAddress('');
            setIsModalOpen(false);
        } catch (err) {
            setError('Failed to add property.');
            console.error(err);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-gray-800">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-black bg-clip-text text-transparent">
                                Your Properties
                            </h1>
                        </div>
                        <p className="text-muted-foreground ml-14">
                            Manage and monitor all your PG properties
                        </p>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gray-900 shadow-md hover:shadow-lg rounded-2xl p-6 transition-all duration-300">
                                <Plus className="h-5 w-5 mr-2" />
                                Add New Property
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gray-800">
                                        <Building2 className="h-5 w-5 text-white" />
                                    </div>
                                    Add New Property
                                </DialogTitle>
                                <DialogDescription className="text-base">
                                    Fill in the details for your new property to get started.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddProperty}>
                                <div className="grid gap-6 py-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                                            <Home className="h-4 w-4 text-gray-800" />
                                            Property Name
                                        </Label>
                                        <Input 
                                            id="name" 
                                            value={newPropertyName} 
                                            onChange={(e) => setNewPropertyName(e.target.value)} 
                                            placeholder="e.g., Sunrise PG, Downtown Hostel"
                                            className="h-11"
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-sm font-semibold flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-800" />
                                            Address
                                        </Label>
                                        <Input 
                                            id="address" 
                                            value={newPropertyAddress} 
                                            onChange={(e) => setNewPropertyAddress(e.target.value)} 
                                            placeholder="Enter full address"
                                            className="h-11"
                                            required 
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="mr-2"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit"
                                        className="bg-gray-800"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Save Property
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Properties Grid */}
            {properties.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-full bg-slate-200 p-6 mb-4">
                            <Building2 className="h-12 w-12 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Properties Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Get started by adding your first property. Click the button above to begin managing your PG business.
                        </p>
                        <Button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Property
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {properties.map((property) => (
                        <Link to={`/properties/${property._id}`} key={property._id} className="group">
                            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-slate-200 overflow-hidden relative">
                                {/* Gradient accent on hover */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                
                                <CardHeader className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-xl bg-gray-800 shadow-md group-hover:shadow-lg transition-shadow">
                                                <Building2 className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                                    {property.name}
                                                </CardTitle>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <CardDescription className="flex items-start gap-2 text-base">
                                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
                                        <span className="line-clamp-2">{property.address}</span>
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-slate-50 px-3 py-2 rounded-lg">
                                        <Calendar className="h-4 w-4" />
                                        <span>Added {new Date(property.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}</span>
                                    </div>
                                </CardContent>

                                {/* Hover effect gradient background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Summary Footer */}
            {properties.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-white shadow-sm">
                                <Building2 className="h-5 w-5 text-gray-800" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Properties</p>
                                <p className="text-2xl font-bold text-slate-900">{properties.length}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Click on any property card to view details</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertiesPage;