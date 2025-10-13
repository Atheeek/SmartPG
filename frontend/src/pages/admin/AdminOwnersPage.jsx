import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext'; // Import useAuth to know who is logged in

const AdminOwnersPage = () => {
    const { user } = useAuth(); // Get the currently logged-in user (you)
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOwners = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/admin/owners');
            setOwners(data);
        } catch (error) {
            toast.error("Failed to fetch owners");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOwners();
    }, [fetchOwners]);

    const handleStatusChange = (ownerId, status) => {
        const promise = API.put(`/admin/owners/${ownerId}/status`, { status });
        toast.promise(promise, {
            loading: 'Updating status...',
            success: () => {
                fetchOwners();
                return `Owner status updated to ${status}`;
            },
            error: 'Failed to update status.'
        });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Owner Management</h1>
                <p className="text-muted-foreground">Manage all registered PG owners on the platform.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Owners ({owners.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Registered On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {owners.map(owner => (
                                <TableRow key={owner._id}>
                                    <TableCell className="font-medium">{owner.name} {owner._id === user._id && "(You)"}</TableCell>
                                    <TableCell>{owner.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={owner.role === 'SuperAdmin' ? 'default' : 'secondary'}>{owner.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={owner.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{owner.status}</Badge>
                                    </TableCell>
                                    <TableCell>{new Date(owner.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        {/* --- THIS IS THE FIX --- */}
                                        {/* Only show the menu if the owner is NOT a SuperAdmin */}
                                        {owner.role !== 'SuperAdmin' ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {owner.status === 'Active' ? (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(owner._id, 'Inactive')} className="text-red-600 focus:bg-red-50 focus:text-red-600">
                                                            Deactivate Account
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(owner._id, 'Active')}>
                                                            Activate Account
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : null /* Or show a disabled icon, or nothing at all */ }
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminOwnersPage;