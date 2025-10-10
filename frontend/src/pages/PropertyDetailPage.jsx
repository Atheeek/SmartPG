import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { usePropertyContext } from '../context/PropertyContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BedDouble, Building, Users, CalendarIcon, PlusCircle, Home, Pencil, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
const PropertyDetailPage = () => {
    // --- STATE MANAGEMENT ---
    const { propertyId } = useParams();
    const { triggerRefetch, refetchKey } = usePropertyContext();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [floorPlan, setFloorPlan] = useState({});
    const [tenants, setTenants] = useState([]);
    const [beds, setBeds] = useState([]);

    // State for Bulk Add Wizard
    const [isWizardOpen, setWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [floorSetup, setFloorSetup] = useState([{ floorNumber: '0', roomCount: '' }]);
    const [roomDetails, setRoomDetails] = useState([]);

    // State for single Add Bed Modal
    const [isAddBedModalOpen, setAddBedModalOpen] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [newBedData, setNewBedData] = useState({ bedNumber: '', rentAmount: '' });

    // State for Edit Bed Modal
    const [isEditBedModalOpen, setEditBedModalOpen] = useState(false);
    const [editingBed, setEditingBed] = useState(null);

    // State for Add Tenant Modal
    const [isTenantModalOpen, setTenantModalOpen] = useState(false);
    const [newTenantData, setNewTenantData] = useState({ fullName: '', phone: '', email: '', advancePaid: '' });
    const [newTenantBedId, setNewTenantBedId] = useState('');
    const [joiningDate, setJoiningDate] = useState(null);

    // State for Edit Tenant Modal
    const [isEditTenantModalOpen, setIsEditTenantModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);

    // --- DATA FETCHING ---
    const fetchData = useCallback(async () => {
        try {
            const [detailsRes, tenantsRes] = await Promise.all([
                API.get(`/properties/${propertyId}/details`),
                API.get(`/tenants?propertyId=${propertyId}`)
            ]);

            const { property, rooms, beds } = detailsRes.data;
            setProperty(property);
            setTenants(tenantsRes.data);
            setBeds(beds);

            const groupedByFloor = rooms.reduce((acc, room) => {
                acc[room.floor] = acc[room.floor] || [];
                acc[room.floor].push(room);
                return acc;
            }, {});
            Object.keys(groupedByFloor).forEach(floor => {
                groupedByFloor[floor].forEach(room => {
                    room.beds = beds.filter(bed => bed.room === room._id);
                });
            });
            setFloorPlan(groupedByFloor);
        } catch (err) {
            setError('Failed to fetch property details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [fetchData, refetchKey]);

    // --- MEMOIZED VALUES ---
    const sortedFloors = useMemo(() => Object.keys(floorPlan).sort((a, b) => parseInt(a) - parseInt(b)), [floorPlan]);
    const availableBeds = useMemo(() => beds.filter(bed => bed.status === 'Available'), [beds]);

    const propertyStats = useMemo(() => {
        const totalBeds = beds.length;
        const occupiedBeds = beds.filter(bed => bed.status === 'Occupied').length;
        const available = totalBeds - occupiedBeds;
        const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(0) : 0;
        return { totalBeds, occupiedBeds, available, occupancyRate };
    }, [beds]);

    // --- HANDLER FUNCTIONS ---
    const handleOpenBulkAdd = () => {
        const nextFloor = sortedFloors.length > 0 ? parseInt(sortedFloors[sortedFloors.length - 1]) + 1 : 0;
        setFloorSetup([{ floorNumber: `${nextFloor}`, roomCount: '' }]);
        setWizardStep(1);
        setWizardOpen(true);
    };
    const handleFloorSetupChange = (index, field, value) => { const newSetup = [...floorSetup]; newSetup[index][field] = value; setFloorSetup(newSetup); };
    const addFloor = () => {
        const lastFloorNumber = floorSetup.length > 0 ? parseInt(floorSetup[floorSetup.length - 1].floorNumber) : -1;
        setFloorSetup([...floorSetup, { floorNumber: `${lastFloorNumber + 1}`, roomCount: '' }]);
    };
    const goToStep2 = () => { const details = floorSetup.flatMap(f => Array.from({ length: parseInt(f.roomCount, 10) || 0 }, (_, i) => ({ floorNumber: f.floorNumber, roomNumber: `${f.floorNumber === '0' ? 'G' : f.floorNumber}0${i + 1}`, bedCount: '', rent: '' }))); setRoomDetails(details); setWizardStep(2); };
    const handleRoomDetailChange = (index, field, value) => { const newDetails = [...roomDetails]; newDetails[index][field] = value; setRoomDetails(newDetails); };
    const handleBulkAddSubmit = async () => { const structure = floorSetup.map(f => ({ floorNumber: parseInt(f.floorNumber, 10), rooms: roomDetails.filter(r => r.floorNumber === f.floorNumber).map(r => ({ roomNumber: r.roomNumber, bedCount: parseInt(r.bedCount, 10) || 0, rent: parseInt(r.rent, 10) || 0 })) })); const promise = API.post(`/properties/${propertyId}/bulk-add`, { structure }); toast.promise(promise, { loading: 'Creating structure...', success: () => { setWizardOpen(false); setTimeout(() => { setWizardStep(1); setFloorSetup([{ floorNumber: '0', roomCount: '' }]); }, 300); triggerRefetch(); return 'Property setup complete!'; }, error: 'Failed to set up property.' }); };

    const openAddBedModal = (roomId) => { setSelectedRoomId(roomId); setNewBedData({ bedNumber: '', rentAmount: '' }); setAddBedModalOpen(true); };
    const handleAddBed = async (e) => { e.preventDefault(); const promise = API.post('/beds', { ...newBedData, roomId: selectedRoomId }); toast.promise(promise, { loading: 'Adding bed...', success: () => { setAddBedModalOpen(false); triggerRefetch(); return 'Bed added!'; }, error: 'Failed to add bed.' }); };

    const openEditBedModal = (bed) => { setEditingBed(bed); setEditBedModalOpen(true); };
    const handleUpdateBed = async (e) => { e.preventDefault(); const promise = API.put(`/beds/${editingBed._id}`, { rentAmount: editingBed.rentAmount }); toast.promise(promise, { loading: 'Updating bed...', success: () => { setEditBedModalOpen(false); triggerRefetch(); return 'Bed details updated!'; }, error: 'Failed to update bed.' }); };

    const handleAddTenant = async (e) => { e.preventDefault(); if (!joiningDate || !newTenantBedId) { toast.error("Joining date and bed selection are required."); return; } const promise = API.post('/tenants', { fullName: newTenantData.fullName, phone: newTenantData.phone, email: newTenantData.email, advancePaid: newTenantData.advancePaid, joiningDate, bedId: newTenantBedId }); toast.promise(promise, { loading: 'Adding new tenant...', success: () => { setTenantModalOpen(false); setNewTenantData({ fullName: '', phone: '', email: '', advancePaid: '' }); setNewTenantBedId(''); setJoiningDate(null); triggerRefetch(); return 'Tenant added successfully!'; }, error: (err) => err.response?.data?.message || 'Failed to add tenant.' }); };
    const handleVacateTenant = async (tenantId) => { const promise = API.put(`/tenants/${tenantId}/vacate`); toast.promise(promise, { loading: 'Vacating tenant...', success: () => { triggerRefetch(); return 'Tenant vacated successfully.'; }, error: 'Failed to vacate tenant.' }); };

    const handleOpenEditTenantModal = (tenant) => { setEditingTenant(tenant); setIsEditTenantModalOpen(true); };
    const handleEditTenantInputChange = (e) => { setEditingTenant(prev => ({ ...prev, [e.target.id]: e.target.value })); };
    const handleUpdateTenant = async (e) => { e.preventDefault(); const promise = API.put(`/tenants/${editingTenant._id}`, editingTenant); toast.promise(promise, { loading: 'Saving changes...', success: () => { setIsEditTenantModalOpen(false); triggerRefetch(); return 'Tenant updated!'; }, error: 'Failed to update.' }); };

    const handleDeleteBed = async (bedId) => {
        const promise = API.delete(`/beds/${bedId}`);
        toast.promise(promise, {
            loading: 'Deleting bed...',
            success: () => {
                triggerRefetch();
                return 'Bed deleted successfully!';
            },
            error: (err) => err.response?.data?.message || 'Failed to delete bed.'
        });
    };

    // --- RENDER LOGIC ---
    if (loading) return <LoadingSpinner />;
    if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div><h1 className="text-3xl font-bold tracking-tight">{property?.name}</h1><p className="text-muted-foreground">{property?.address}</p></div>
                <Button onClick={handleOpenBulkAdd}>Bulk Add Rooms/Beds</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Beds</CardTitle><BedDouble className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{propertyStats.totalBeds}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Occupied Beds</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{propertyStats.occupiedBeds}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Available Beds</CardTitle><BedDouble className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{propertyStats.available}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle><Home className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{propertyStats.occupancyRate}%</div></CardContent></Card>
            </div>

            <Card className="lg:col-span-3">
                <CardHeader><CardTitle>Property Layout</CardTitle><CardDescription>View and manage the structure of rooms and beds.</CardDescription></CardHeader>
                <CardContent>
                    {sortedFloors.length > 0 ? (
                        <Accordion type="multiple" className="w-full space-y-2">
                            {sortedFloors.map((floor) => (
                                <AccordionItem value={`floor-${floor}`} key={floor} className="border-b-0">
                                    <AccordionTrigger className="text-lg font-semibold hover:no-underline bg-slate-50 dark:bg-slate-900 px-4 rounded-md">Floor {floor === '0' ? 'G' : floor}<span className="text-sm font-normal text-muted-foreground ml-auto mr-4">{floorPlan[floor].length} Rooms</span></AccordionTrigger>
                                    <AccordionContent className="pt-4 space-y-4">
                                        {floorPlan[floor].map(room => (
                                            <div key={room._id} className="p-4 rounded-lg bg-white dark:bg-background border shadow-sm ml-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-semibold text-md text-primary">Room: {room.roomNumber}</h4>
                                                    <Button variant="ghost" size="sm" onClick={() => openAddBedModal(room._id)}><PlusCircle className="h-4 w-4 mr-2" />Add Bed</Button>
                                                </div>
                                                {room.beds.length > 0 ? (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                                                        {room.beds.map(bed => (
                                                            <div key={bed._id} className={`relative group p-3 rounded-lg border ${bed.status === 'Occupied' ? 'bg-orange-100' : 'bg-green-100'}`}>
                                                                <p className="font-semibold">Bed: {bed.bedNumber}</p>
                                                                <p className="text-sm">Rent: ₹{bed.rentAmount}</p>
                                                                <p className={`text-sm font-medium ${bed.status === 'Occupied' ? 'text-orange-600' : 'text-green-600'}`}>{bed.status}</p>
                                                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditBedModal(bed)}><Pencil className="h-3 w-3" /></Button>

                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-100 hover:text-red-600">
                                                                                <Trash2 className="h-3 w-3" />
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader><AlertDialogTitle>Delete Bed {bed.bedNumber}?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. You can only delete beds that are not occupied.</AlertDialogDescription></AlertDialogHeader>
                                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteBed(bed._id)}>Yes, Delete</AlertDialogAction></AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-sm text-muted-foreground mt-2">No beds in this room.</p>}
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center"><Building className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-xl font-semibold">This property is empty.</h3><p className="text-muted-foreground">Click 'Bulk Add' to get started.</p></div>}
                </CardContent>
            </Card>

            <Card className="lg:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div><CardTitle>Tenants</CardTitle><CardDescription>Manage all active tenants in this property.</CardDescription></div>
                    <Dialog open={isTenantModalOpen} onOpenChange={setTenantModalOpen}><DialogTrigger asChild><Button><Users className="mr-2 h-4 w-4" />Add Tenant</Button></DialogTrigger><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Add New Tenant</DialogTitle></DialogHeader><form onSubmit={handleAddTenant} className="grid gap-4 py-4"><Input id="fullName" placeholder="Full Name" value={newTenantData.fullName} onChange={(e) => setNewTenantData({ ...newTenantData, fullName: e.target.value })} required /><Input id="phone" placeholder="10-Digit Phone Number" value={newTenantData.phone} onChange={(e) => setNewTenantData({ ...newTenantData, phone: e.target.value })} required minLength="10" maxLength="10" pattern="\d{10}" /><Input id="email" type="email" placeholder="Email (Optional)" value={newTenantData.email} onChange={(e) => setNewTenantData({ ...newTenantData, email: e.target.value })} /><Input id="advancePaid" type="number" placeholder="Advance Paid (₹)" value={newTenantData.advancePaid} onChange={(e) => setNewTenantData({ ...newTenantData, advancePaid: e.target.value })} /><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !joiningDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{joiningDate ? new Date(joiningDate).toLocaleDateString() : <span>Pick a joining date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0">
  <Calendar
    mode="single"
    selected={joiningDate}
    onSelect={setJoiningDate}
    initialFocus
    // ADD THIS LINE to disable future dates
    disabled={(date) => date > new Date()}
  />
</PopoverContent></Popover><select value={newTenantBedId} onChange={(e) => setNewTenantBedId(e.target.value)} required className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"><option value="">Select an available bed</option>{availableBeds.map(bed => { const room = floorPlan[Object.keys(floorPlan).find(f => floorPlan[f].some(r => r._id === bed.room))]?.find(r => r._id === bed.room); return <option key={bed._id} value={bed._id}>F-{room?.floor}, R-{room?.roomNumber}, Bed-{bed.bedNumber} (₹{bed.rentAmount})</option> })}</select><DialogFooter><Button type="submit">Save Tenant</Button></DialogFooter></form></DialogContent></Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Bed Details</TableHead><TableHead>Advance</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {tenants.length > 0 ? tenants.map(tenant => (
                                <TableRow key={tenant._id}>
                                    <TableCell className="font-medium">
                                        <Link to={`/tenants/${tenant._id}`} className="hover:underline text-blue-600">
                                            {tenant.fullName}
                                        </Link>
                                        <div className="text-sm text-muted-foreground">{tenant.phone}</div>
                                    </TableCell>
                                    <TableCell>F-{tenant.bed.room.floor}, R-{tenant.bed.room.roomNumber} / B-{tenant.bed.bedNumber}</TableCell>
                                    <TableCell>₹{tenant.advancePaid.toLocaleString('en-IN')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="icon" onClick={() => handleOpenEditTenantModal(tenant)}><Pencil className="h-4 w-4" /></Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Vacate</Button></AlertDialogTrigger>



                                                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will mark {tenant.fullName} as inactive and make their bed available. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleVacateTenant(tenant._id)}>Yes, Vacate</AlertDialogAction>

                                                </AlertDialogFooter></AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan="4" className="text-center h-24">No active tenants in this property.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* --- ALL DIALOGS --- */}
            {/* --- DIALOG for Bulk Add Wizard --- */}
            <Dialog open={isWizardOpen} onOpenChange={setWizardOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Bulk Setup for {property?.name}</DialogTitle>
                        <DialogDescription>
                            Step {wizardStep} of 2: {wizardStep === 1 ? 'Define Floors and Rooms' : 'Set Bed Counts and Rent'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* --- STEP 1: Define Floors --- */}
                    {wizardStep === 1 && (
                        <div>
                            <div className="space-y-4 py-4">
                                {floorSetup.map((floor, index) => (
                                    <div key={index} className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor={`floor-${index}`} className="text-right">
                                            Floor {floor.floorNumber === '0' ? "G" : floor.floorNumber}
                                        </Label>
                                        <Input
                                            id={`floor-${index}`}
                                            type="number"
                                            placeholder="No. of Rooms"
                                            value={floor.roomCount}
                                            onChange={(e) => handleFloorSetupChange(index, 'roomCount', e.target.value)}
                                            className="col-span-2"
                                        />
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" onClick={addFloor} className="mt-2">
                                <PlusCircle className="mr-2 h-4 w-4" />Add Floor
                            </Button>
                            <DialogFooter className="mt-4">
                                <Button onClick={goToStep2}>
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </DialogFooter>
                        </div>
                    )}

                    {/* --- STEP 2: Define Beds and Rent --- */}
                    {wizardStep === 2 && (
                        <div>
                            <div className="max-h-[60vh] overflow-y-auto p-1 space-y-4 py-4">
                                {roomDetails.map((room, index) => (
                                    <div key={index} className="grid grid-cols-5 items-center gap-x-4 gap-y-2">
                                        <Label className="col-span-2 text-right">Room {room.roomNumber}</Label>
                                        <Input
                                            type="number"
                                            placeholder="# Beds"
                                            value={room.bedCount}
                                            onChange={(e) => handleRoomDetailChange(index, 'bedCount', e.target.value)}
                                            className="col-span-1"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Rent (₹)"
                                            value={room.rent}
                                            onChange={(e) => handleRoomDetailChange(index, 'rent', e.target.value)}
                                            className="col-span-2"
                                        />
                                    </div>
                                ))}
                            </div>
                            <DialogFooter className="mt-4">
                                <Button variant="outline" onClick={() => setWizardStep(1)}>Back</Button>
                                <Button onClick={handleBulkAddSubmit}>Confirm & Create</Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>


            <Dialog open={isAddBedModalOpen} onOpenChange={setAddBedModalOpen}><DialogContent><DialogHeader><DialogTitle>Add New Bed</DialogTitle></DialogHeader><form onSubmit={handleAddBed}><div className="grid gap-4 py-4"><Label htmlFor="bedNumber">Bed Number</Label><Input id="bedNumber" value={newBedData.bedNumber} onChange={(e) => setNewBedData({ ...newBedData, bedNumber: e.target.value })} required /><Label htmlFor="rentAmount">Monthly Rent (₹)</Label><Input id="rentAmount" type="number" value={newBedData.rentAmount} onChange={(e) => setNewBedData({ ...newBedData, rentAmount: e.target.value })} required /></div><DialogFooter><Button type="submit">Save Bed</Button></DialogFooter></form></DialogContent></Dialog>
            <Dialog open={isEditBedModalOpen} onOpenChange={setEditBedModalOpen}><DialogContent><DialogHeader><DialogTitle>Edit Bed {editingBed?.bedNumber}</DialogTitle></DialogHeader><form onSubmit={handleUpdateBed}><div className="grid gap-4 py-4"><Label htmlFor="rentAmount">Monthly Rent (₹)</Label><Input id="rentAmount" type="number" value={editingBed?.rentAmount || ''} onChange={(e) => setEditingBed({ ...editingBed, rentAmount: e.target.value })} required /></div><DialogFooter><Button type="submit">Save Changes</Button></DialogFooter></form></DialogContent></Dialog>
            <Dialog open={isEditTenantModalOpen} onOpenChange={setIsEditTenantModalOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Edit Tenant Details</DialogTitle><DialogDescription>Update the information for {editingTenant?.fullName}.</DialogDescription></DialogHeader><form onSubmit={handleUpdateTenant} className="grid gap-4 py-4"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" value={editingTenant?.fullName || ''} onChange={handleEditTenantInputChange} required /><Label htmlFor="phone">Phone Number</Label><Input id="phone" value={editingTenant?.phone || ''} onChange={handleEditTenantInputChange} required minLength="10" maxLength="10" pattern="\d{10}" /><Label htmlFor="email">Email (Optional)</Label><Input id="email" type="email" value={editingTenant?.email || ''} onChange={handleEditTenantInputChange} /><Label htmlFor="advancePaid">Advance Paid (₹)</Label><Input id="advancePaid" type="number" value={editingTenant?.advancePaid || ''} onChange={handleEditTenantInputChange} /><DialogFooter><Button type="button" variant="outline" onClick={() => setIsEditTenantModalOpen(false)}>Cancel</Button><Button type="submit">Save Changes</Button></DialogFooter></form></DialogContent></Dialog>
        </div>
    );
};

export default PropertyDetailPage;