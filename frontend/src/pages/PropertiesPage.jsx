import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePropertyContext } from '../context/PropertyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, MapPin, Calendar, Plus, Home, ArrowRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const PropertiesPage = () => {
    // We get the properties and loading state directly from the global context
    const { properties, loading, triggerRefetch } = usePropertyContext();

    // --- NEW: State for the smart Add/Edit modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProperty, setCurrentProperty] = useState({ name: '', address: '' });

    // --- NEW: Function to open the modal for either adding a new property or editing an existing one ---
    const handleOpenModal = (property = null) => {
        if (property) {
            setIsEditing(true);
            setCurrentProperty(property);
        } else {
            setIsEditing(false);
            setCurrentProperty({ name: '', address: '' });
        }
        setIsModalOpen(true);
    };

    // --- NEW: Single function to handle both creating and updating a property ---
    const handleSaveProperty = async (e) => {
        e.preventDefault();
        const promise = isEditing 
            ? API.put(`/properties/${currentProperty._id}`, { name: currentProperty.name, address: currentProperty.address })
            : API.post('/properties', { name: currentProperty.name, address: currentProperty.address });

        toast.promise(promise, {
            loading: isEditing ? 'Updating property...' : 'Adding property...',
            success: () => {
                setIsModalOpen(false);
                triggerRefetch(); // Refresh the global property list
                return `Property ${isEditing ? 'updated' : 'added'} successfully!`;
            },
            error: (err) => err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} property.`
        });
    };

    // --- NEW: Function to handle deleting a property ---
    const handleDeleteProperty = (propertyId, propertyName) => {
        const promise = API.delete(`/properties/${propertyId}`);
        toast.promise(promise, {
            loading: `Deleting ${propertyName}...`,
            success: () => {
                triggerRefetch();
                return 'Property deleted successfully.';
            },
            error: (err) => err.response?.data?.message || 'Failed to delete property.'
        });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-8">
            {/* Your Header Section - Now uses the smart handleOpenModal function */}
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
                        <p className="text-muted-foreground md:ml-14">
                            Manage and monitor all your PG properties
                        </p>
                    </div>
                    <Button onClick={() => handleOpenModal()} className="bg-gray-900 shadow-md hover:shadow-lg rounded-xl p-6 transition-all duration-300">
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Property
                    </Button>
                </div>
            </div>

            {/* Your Properties Grid - Updated with Actions Menu */}
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
                        <Button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Property
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {properties.map((property) => (
                        <Card key={property._id} className="flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-slate-200 overflow-hidden group relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-10"></div>
                            
                            {/* --- ACTIONS MENU ADDED HERE --- */}
                            <div className="absolute top-4 right-4 z-20">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleOpenModal(property)}><Pencil className="mr-2 h-4 w-4" />Edit Details</DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{property.name}" and all its rooms, beds, tenants, and financial records. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteProperty(property._id, property.name)} className="bg-red-600 hover:bg-red-700">Yes, Delete Permanently</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <Link to={`/properties/${property._id}`} className="flex flex-col h-full">
                                <CardHeader className="space-y-3 flex-grow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-xl bg-gray-800 shadow-md">
                                                <Building2 className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{property.name}</CardTitle>
                                            </div>
                                        </div>
                                    </div>
                                    <CardDescription className="flex items-start gap-2 text-base">
                                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
                                        <span className="line-clamp-2">{property.address}</span>
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent className="mt-auto">
                                    <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground bg-slate-50 px-3 py-2 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Added {new Date(property.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </CardContent>

                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}

            {/* Your Smart Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gray-800"><Building2 className="h-5 w-5 text-white" /></div>
                            {isEditing ? 'Edit Property Details' : 'Add New Property'}
                        </DialogTitle>
                        <DialogDescription className="text-base pt-2">
                            {isEditing ? `Update the details for ${currentProperty.name}.` : 'Fill in the details for your new property to get started.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveProperty}>
                        <div className="grid gap-6 py-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2"><Home className="h-4 w-4 text-gray-800" />Property Name</Label>
                                <Input id="name" value={currentProperty.name} onChange={(e) => setCurrentProperty({...currentProperty, name: e.target.value})} required placeholder="e.g., Sunrise PG, Downtown Hostel" className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-800" />Address</Label>
                                <Input id="address" value={currentProperty.address} onChange={(e) => setCurrentProperty({...currentProperty, address: e.target.value})} required placeholder="Enter full address" className="h-11" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-gray-800">
                                <Plus className="h-4 w-4 mr-2" />
                                {isEditing ? 'Save Changes' : 'Save Property'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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