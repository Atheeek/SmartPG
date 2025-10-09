// frontend/src/pages/PaymentsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { usePropertyContext } from '../context/PropertyContext';
import PropertySelector from '../components/PropertySelector';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IndianRupee, CheckCircle, Clock, FileWarning } from 'lucide-react';
import MonthYearPicker from '../components/MonthYearPicker'; // <-- Import new component


const PaymentsPage = () => {
  // --- STATE AND CONTEXT ---
  const { selectedProperty, refetchKey,triggerRefetch  } = usePropertyContext();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date()); // <-- State for the filter

  // --- DATA FETCHING ---
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      // Call the new endpoint with the selected year, month, and property
      const response = await API.get(`/payments/by-month?year=${year}&month=${month}&propertyId=${selectedProperty}`);
      setPayments(response.data);
    } catch (err) {
      setError('Failed to fetch payments for the selected month.');
    } finally {
      setLoading(false);
    }
  }, [selectedProperty, refetchKey, selectedDate]);
    useEffect(() => { fetchPayments(); }, [fetchPayments]);

  // --- HANDLER FUNCTIONS ---
  const handleMarkAsPaid = async (paymentId) => {
    const promise = API.put(`/payments/${paymentId}/mark-paid`);
    toast.promise(promise, {
      loading: 'Updating status...',
      success: (response) => {
        const updatedPayment = response.data.payment;
        setPayments(prevPayments =>
          prevPayments.map(p =>
            p._id === paymentId ? { ...p, status: updatedPayment.status, paymentDate: updatedPayment.paymentDate } : p
          )
        );
                triggerRefetch(); 

        return 'Payment marked as paid!';
      },
      error: 'Failed to update payment status.',
    });
  };

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  // --- MEMOIZED VALUES FOR STATS ---
  const paymentStats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const paid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const due = total - paid;
    return {
      total: total.toLocaleString('en-IN'),
      paid: paid.toLocaleString('en-IN'),
      due: due.toLocaleString('en-IN'),
    };
  }, [payments]);

  // --- RENDER LOGIC ---
if (loading) return <LoadingSpinner />;
  if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Track and manage payments for the selected month.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <MonthYearPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <PropertySelector />
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total for Month</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{paymentStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{paymentStats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{paymentStats.due}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>A detailed list of all payments for the selected month.</CardDescription>
        </CardHeader>
        <CardContent>
         <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Rent Amount</TableHead>
                <TableHead>Advance Paid</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? (
                payments.map(payment => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-medium">{payment.tenant.fullName}<div className="text-sm text-muted-foreground">{payment.tenant.phone}</div></TableCell>
                    <TableCell>₹{payment.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{payment.tenant.advancePaid ? payment.tenant.advancePaid.toLocaleString('en-IN') : 'N/A'}</TableCell>
                    <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {payment.status === 'Due' ? (
                        <Badge variant="destructive" className="py-1 px-4">{payment.status}</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-600 py-1 px-4 hover:bg-green-700">Paid</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'Due' && (
                        <Button size="sm" onClick={() => handleMarkAsPaid(payment._id)}>
                          Mark as Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="6" className="text-center h-48">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileWarning className="h-10 w-10 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">No Payments Found</h3>
                      <p className="text-sm text-muted-foreground">There are no payment records for the selected month and property.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentsPage;