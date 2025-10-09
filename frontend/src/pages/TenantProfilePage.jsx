// frontend/src/pages/TenantProfilePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, Calendar, IndianRupee, Building, BedDouble, UserCheck, UserX, Pencil, FileWarning, Move } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { usePropertyContext } from '../context/PropertyContext';
import { differenceInDays, format } from 'date-fns';

const TenantProfilePage = () => {
    const { tenantId } = useParams();
    const { triggerRefetch, refetchKey } = usePropertyContext();
    const [tenant, setTenant] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditTenantModalOpen, setIsEditTenantModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [availableBeds, setAvailableBeds] = useState([]);
    const [selectedNewBedId, setSelectedNewBedId] = useState('');

    useEffect(() => {
        const fetchTenantDetails = async () => {
            try {
                setLoading(true);
                const response = await API.get(`/tenants/${tenantId}/details`);
                setTenant(response.data.tenant);
                setPayments(response.data.payments);
            } catch (err) {
                setError('Failed to fetch tenant details.');
            } finally {
                setLoading(false);
            }
        };
        fetchTenantDetails();
    }, [tenantId, refetchKey]);
const getMonthYear = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMMM yyyy');
}
    const profileStats = useMemo(() => {
        if (!tenant) return { totalPaid: 0, totalDue: 0, stayDuration: 'N/A' };

        const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
        const totalDue = payments.filter(p => p.status === 'Due').reduce((sum, p) => sum + p.amount, 0);
        
        const startDate = new Date(tenant.joiningDate);
        const endDate = tenant.vacatedDate ? new Date(tenant.vacatedDate) : new Date();
        const diffDays = differenceInDays(endDate, startDate);
        const months = Math.floor(diffDays / 30);
        const days = diffDays % 30;
        const stayDuration = tenant.isActive ? `${months} months, ${days} days` : `Stayed for ${months} months, ${days} days`;

        return { totalPaid, totalDue, stayDuration };
    }, [tenant, payments]);

    // --- All handler functions ---
    const handleOpenEditTenantModal = (tenantToEdit) => { setEditingTenant({ ...tenantToEdit }); setIsEditTenantModalOpen(true); };
    const handleEditTenantInputChange = (e) => { setEditingTenant(prev => ({ ...prev, [e.target.id]: e.target.value })); };
    const handleUpdateTenant = async (e) => { e.preventDefault(); const promise = API.put(`/tenants/${editingTenant._id}`, editingTenant); toast.promise(promise, { loading: 'Saving changes...', success: () => { setIsEditTenantModalOpen(false); triggerRefetch(); return 'Tenant updated!'; }, error: (err) => err.response?.data?.message || 'Failed to update tenant.' }); };
    const handleOpenTransferModal = async () => { if (!tenant) return; try { const response = await API.get(`/beds/available?propertyId=${tenant.bed.room.property._id}`); setAvailableBeds(response.data); setIsTransferModalOpen(true); } catch (err) { toast.error("Could not fetch available beds."); }};
    const handleTransferSubmit = async (e) => { e.preventDefault(); if (!selectedNewBedId) { toast.error("Please select a new bed."); return; } const promise = API.put(`/tenants/${tenantId}/transfer`, { newBedId: selectedNewBedId }); toast.promise(promise, { loading: 'Transferring tenant...', success: () => { setIsTransferModalOpen(false); triggerRefetch(); return 'Tenant transferred successfully!'; }, error: (err) => err.response?.data?.message || 'Tenant transfer failed.' }); };


    if (loading) return <LoadingSpinner />;
    if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
    if (!tenant) return <div>Tenant not found.</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className={`rounded-full p-3 ${tenant.isActive ? 'bg-blue-100' : 'bg-gray-200'}`}>
                        <User className={`h-8 w-8 ${tenant.isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold">{tenant.fullName}</h1>
                            <Badge variant={tenant.isActive ? 'default' : 'secondary'} className={tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}>
                                {tenant.isActive ? <UserCheck className="mr-1 h-3 w-3" /> : <UserX className="mr-1 h-3 w-3" />}
                                {tenant.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">Tenant Profile & Payment History</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {tenant.isActive && <Button variant="outline" onClick={handleOpenTransferModal}><Move className="mr-2 h-4 w-4" /> Transfer</Button>}
                    <Button variant="outline" size="icon" onClick={() => handleOpenEditTenantModal(tenant)}><Pencil className="h-4 w-4" /></Button>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Paid</CardTitle><IndianRupee className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">₹{profileStats.totalPaid.toLocaleString('en-IN')}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Outstanding Dues</CardTitle><IndianRupee className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold">₹{profileStats.totalDue.toLocaleString('en-IN')}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Duration of Stay</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{profileStats.stayDuration}</div></CardContent></Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader><CardTitle>Details</CardTitle><CardDescription>Contact & Stay Information</CardDescription></CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <ul className="space-y-3">
                            <li className="flex items-start"><Phone className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" /><span className="font-medium">{tenant.phone}</span></li>
                            <li className="flex items-start"><Mail className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" /><span className="font-medium">{tenant.email || 'N/A'}</span></li>
                            <li className="flex items-start"><Calendar className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" /><span className="font-medium">{new Date(tenant.joiningDate).toLocaleDateString()} (Joining Date)</span></li>
                            
                            {/* --- THIS IS THE FIX --- */}
                            {!tenant.isActive && tenant.vacatedDate && (
                                <li className="flex items-start"><Calendar className="h-4 w-4 mr-3 mt-0.5 text-red-500 flex-shrink-0" /><span className="font-medium text-red-600">{new Date(tenant.vacatedDate).toLocaleDateString()} (Vacated Date)</span></li>
                            )}
                            
                            <li className="flex items-start"><IndianRupee className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" /><span className="font-medium">₹{tenant.advancePaid.toLocaleString('en-IN')} (Advance Paid)</span></li>
                        </ul>
                        <hr/>
                        <ul className="space-y-3">
                            <li className="flex items-start"><Building className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" /><Link to={`/properties/${tenant.bed.room.property._id}`} className="font-medium text-primary hover:underline">{tenant.bed.room.property.name}</Link></li>
                            <li className="flex items-start"><BedDouble className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" /><span className="font-medium">Floor-{tenant.bed.room.floor === 0 ? 'G' : tenant.bed.room.floor}, Room-{tenant.bed.room.roomNumber}, Bed-{tenant.bed.bedNumber}</span></li>
                            <li className="flex items-start"><IndianRupee className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" /><span className="font-medium">₹{tenant.bed.rentAmount.toLocaleString('en-IN')} (Current Rent)</span></li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader><CardTitle>Payment History</CardTitle><CardDescription>Record of all monthly rent payments.</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rent For</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length > 0 ? payments.map(p => (
                  <TableRow key={p._id}>
                    <TableCell className="font-medium">{getMonthYear(p.dueDate)}</TableCell>
                    <TableCell>₹{p.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      {p.status === 'Due' ? (
                        <Badge variant="destructive">{p.status}</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">Paid</Badge>
                      )}
                    </TableCell>
                    <TableCell>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'N/A'}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan="4" className="text-center h-48">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <FileWarning className="h-10 w-10 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">No Payment History</h3>
                        <p className="text-sm text-muted-foreground">There are no payment records for this tenant yet.</p>
                    </div>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer {tenant?.fullName}</DialogTitle>
            <DialogDescription>Select a new available bed for this tenant. The old bed will become available automatically.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransferSubmit}>
            <div className="py-4">
              <Label htmlFor="newBed">New Bed</Label>
              <select 
                id="newBed"
                value={selectedNewBedId} 
                onChange={(e) => setSelectedNewBedId(e.target.value)} 
                required 
                className="mt-2 flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2"
              >
                <option value="">Select an available bed...</option>
                {availableBeds.map(bed => (
                  <option key={bed._id} value={bed._id}>
                    F-{bed.room.floor === 0 ? 'G' : bed.room.floor}, R-{bed.room.roomNumber}, Bed-{bed.bedNumber} (₹{bed.rentAmount})
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTransferModalOpen(false)}>Cancel</Button>
              <Button type="submit">Confirm Transfer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
        
      </Dialog>
                  <Dialog open={isEditTenantModalOpen} onOpenChange={setIsEditTenantModalOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Edit Tenant Details</DialogTitle><DialogDescription>Update the information for {editingTenant?.fullName}.</DialogDescription></DialogHeader><form onSubmit={handleUpdateTenant} className="grid gap-4 py-4"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" value={editingTenant?.fullName || ''} onChange={handleEditTenantInputChange} required /><Label htmlFor="phone">Phone Number</Label><Input id="phone" value={editingTenant?.phone || ''} onChange={handleEditTenantInputChange} required minLength="10" maxLength="10" pattern="\d{10}" /><Label htmlFor="email">Email (Optional)</Label><Input id="email" type="email" value={editingTenant?.email || ''} onChange={handleEditTenantInputChange} /><Label htmlFor="advancePaid">Advance Paid (₹)</Label><Input id="advancePaid" type="number" value={editingTenant?.advancePaid || ''} onChange={handleEditTenantInputChange} /><DialogFooter><Button type="button" variant="outline" onClick={() => setIsEditTenantModalOpen(false)}>Cancel</Button><Button type="submit">Save Changes</Button></DialogFooter></form></DialogContent></Dialog>
      
    </div>
  );
};

export default TenantProfilePage;