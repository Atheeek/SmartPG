import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePropertyContext } from '../context/PropertyContext';
import PropertySelector from '../components/PropertySelector';
import MonthYearPicker from '../components/MonthYearPicker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const ExpensesPage = () => {
  const { properties, selectedProperty, refetchKey, triggerRefetch } = usePropertyContext();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: '', date: format(new Date(), 'yyyy-MM-dd'), propertyId: '' });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Correctly defined here
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const response = await API.get(`/expenses?year=${year}&month=${month}&propertyId=${selectedProperty}`);
      setExpenses(response.data);
    } catch (err) {
      toast.error('Failed to fetch expenses.');
    } finally {
      setLoading(false);
    }
  }, [selectedProperty, selectedDate, refetchKey]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleInputChange = (e, isEditing = false) => {
    const { id, value } = e.target;
    const setter = isEditing ? setEditingExpense : setNewExpense;
    setter(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id, value, isEditing = false) => {
    const setter = isEditing ? setEditingExpense : setNewExpense;
    setter(prev => ({...prev, [id]: value}));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const promise = API.post('/expenses', newExpense);
    toast.promise(promise, {
      loading: 'Adding expense...',
      success: () => {
        setAddModalOpen(false);
        setNewExpense({ description: '', amount: '', category: '', date: format(new Date(), 'yyyy-MM-dd'), propertyId: '' });
        triggerRefetch();
        return 'Expense added successfully!';
      },
      error: 'Failed to add expense.'
    });
  };

  const handleOpenEditModal = (expense) => {
    setEditingExpense({ ...expense, date: format(new Date(expense.date), 'yyyy-MM-dd'), propertyId: expense.property._id });
    setIsEditModalOpen(true); // CORRECTED: Was setEditModalOpen
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    const promise = API.put(`/expenses/${editingExpense._id}`, {
        description: editingExpense.description,
        amount: editingExpense.amount,
        category: editingExpense.category,
        date: editingExpense.date,
        propertyId: editingExpense.propertyId,
    });

    toast.promise(promise, {
      loading: 'Updating expense...',
      success: () => {
        setIsEditModalOpen(false); // CORRECTED: Was setEditModalOpen
        triggerRefetch();
        return 'Expense updated successfully!';
      },
      error: 'Failed to update expense.'
    });
  };

  const handleDeleteExpense = (expenseId) => {
    const promise = API.delete(`/expenses/${expenseId}`);
    toast.promise(promise, {
      loading: 'Deleting expense...',
      success: () => {
        triggerRefetch();
        return 'Expense deleted successfully!';
      },
      error: 'Failed to delete expense.'
    });
  };
  
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
          <p className="text-muted-foreground">Log and monitor all your business expenses.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <MonthYearPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <PropertySelector />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Expenses for {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</CardTitle>
            <CardDescription>Total expenses this period: ₹{totalExpenses.toLocaleString('en-IN')}</CardDescription>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild><Button>Add Expense</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log a New Expense</DialogTitle></DialogHeader>
              <form onSubmit={handleAddExpense} className="space-y-4 pt-4">
                <div><Label htmlFor="description">Description</Label><Input id="description" value={newExpense.description} onChange={(e) => handleInputChange(e, false)} required /></div>
                <div><Label htmlFor="amount">Amount (₹)</Label><Input id="amount" type="number" value={newExpense.amount} onChange={(e) => handleInputChange(e, false)} required /></div>
                <div><Label htmlFor="date">Date</Label><Input id="date" type="date" value={newExpense.date} onChange={(e) => handleInputChange(e, false)} required /></div>
                <div><Label>Category</Label><Select onValueChange={(value) => handleSelectChange('category', value, false)} required><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent><SelectItem value="Utilities">Utilities</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Salaries">Salaries</SelectItem><SelectItem value="Supplies">Supplies</SelectItem><SelectItem value="Rent">Rent</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                <div><Label>Property</Label><Select onValueChange={(value) => handleSelectChange('propertyId', value, false)} required><SelectTrigger><SelectValue placeholder="Select a property" /></SelectTrigger><SelectContent>{properties.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                <DialogFooter><Button type="submit">Save Expense</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead>Property</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan="6" className="h-24 text-center"><LoadingSpinner /></TableCell></TableRow> : expenses.length > 0 ? expenses.map(exp => (
                <TableRow key={exp._id}>
                  <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{exp.description}</TableCell>
                  <TableCell>{exp.category}</TableCell>
                  <TableCell>{exp.property.name}</TableCell>
                  <TableCell className="text-right">₹{exp.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(exp)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the expense record for "{exp.description}".</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteExpense(exp._id)} className="bg-red-600 hover:bg-red-700">Yes, Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan="6" className="text-center h-24">No expenses logged for this period.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}> {/* CORRECTED: Was setEditModalOpen */}
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Expense</DialogTitle></DialogHeader>
          {editingExpense && (
            <form onSubmit={handleUpdateExpense} className="space-y-4 pt-4">
              <div><Label htmlFor="description">Description</Label><Input id="description" value={editingExpense.description} onChange={(e) => handleInputChange(e, true)} required /></div>
              <div><Label htmlFor="amount">Amount (₹)</Label><Input id="amount" type="number" value={editingExpense.amount} onChange={(e) => handleInputChange(e, true)} required /></div>
              <div><Label htmlFor="date">Date</Label><Input id="date" type="date" value={editingExpense.date} onChange={(e) => handleInputChange(e, true)} required /></div>
              <div><Label>Category</Label><Select onValueChange={(value) => handleSelectChange('category', value, true)} value={editingExpense.category} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Utilities">Utilities</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="Salaries">Salaries</SelectItem><SelectItem value="Supplies">Supplies</SelectItem><SelectItem value="Rent">Rent</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
              <div><Label>Property</Label><Select onValueChange={(value) => handleSelectChange('propertyId', value, true)} value={editingExpense.propertyId} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{properties.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
              <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpensesPage;