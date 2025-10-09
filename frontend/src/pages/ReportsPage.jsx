// frontend/src/pages/ReportsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePropertyContext } from '../context/PropertyContext';
import PropertySelector from '../components/PropertySelector';
import MonthYearPicker from '../components/MonthYearPicker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const ReportStatCard = ({ title, value, isProfit, icon: Icon, colorClass }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${colorClass}`} />
        </CardHeader>
        <CardContent>
            <div className={`text-3xl font-bold ${isProfit === true ? 'text-green-600' : isProfit === false ? 'text-red-600' : ''}`}>
                {value}
            </div>
        </CardContent>
    </Card>
);

const ReportsPage = () => {
    const { selectedProperty, refetchKey } = usePropertyContext();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            try {
                const year = selectedDate.getFullYear();
                const month = selectedDate.getMonth() + 1;
                const response = await API.get(`/reports/profit-loss?year=${year}&month=${month}&propertyId=${selectedProperty}`);
                setReportData(response.data);
            } catch (err) {
                console.error('Failed to fetch report data.', err);
                setReportData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [selectedProperty, refetchKey, selectedDate]);
    
    if (loading) return <LoadingSpinner />;

    const incomeVsExpenseData = [
        { name: 'Total Income', amount: reportData?.totalIncome || 0 },
        { name: 'Total Expenses', amount: reportData?.totalExpenses || 0 },
    ];
    
    const PIE_COLORS = ['#3b82f6', '#ef4444', '#f97316', '#8b5cf6', '#14b8a6']; // Blue, Red, Orange, Purple, Teal

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        if (percent * 100 < 5) return null; // Don't render label if slice is too small
        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profit & Loss Report</h1>
                    <p className="text-muted-foreground">Financial performance for {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <MonthYearPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
                    <PropertySelector />
                </div>
            </div>
            
            {reportData ? (
                <div className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-3">
                        <ReportStatCard title="Total Income" value={`₹${reportData.totalIncome.toLocaleString('en-IN')}`} icon={TrendingUp} colorClass="text-green-500" />
                        <ReportStatCard title="Total Expenses" value={`₹${reportData.totalExpenses.toLocaleString('en-IN')}`} icon={TrendingDown} colorClass="text-red-500" />
                        <ReportStatCard title="Net Profit / Loss" value={`₹${reportData.netProfit.toLocaleString('en-IN')}`} isProfit={reportData.netProfit >= 0} icon={IndianRupee} colorClass={reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}/>
                    </div>
                    
                    <div className="grid gap-6 lg:grid-cols-5">
                        <Card className="lg:col-span-2">
                            <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    {reportData.expenseBreakdown && reportData.expenseBreakdown.length > 0 ? (
                                        <PieChart>
                                            <Pie
                                                data={reportData.expenseBreakdown}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={renderCustomizedLabel}
                                                outerRadius={80}
                                                dataKey="value"
                                                nameKey="name"
                                            >
                                                {reportData.expenseBreakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                                            <Legend />
                                        </PieChart>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">No expense data for this period.</div>
                                    )}
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-3">
                            <CardHeader><CardTitle>Income vs. Expenses</CardTitle></CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={incomeVsExpenseData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                                        <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                                        <Bar dataKey="amount" barSize={60}>
                                            <Cell fill="#16a34a" />
                                            <Cell fill="#dc2626" />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>Expense Details for {selectedDate.toLocaleString('default', { month: 'long' })}</CardTitle><CardDescription>A list of all expenses logged in the selected month.</CardDescription></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead>Property</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {reportData.expenseDetails.length > 0 ? reportData.expenseDetails.map(e => (
                                        <TableRow key={e._id}>
                                            <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{e.description}</TableCell>
                                            <TableCell><Badge variant="outline">{e.category}</Badge></TableCell>
                                            <TableCell>{e.property.name}</TableCell>
                                            <TableCell className="text-right">₹{e.amount.toLocaleString('en-IN')}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan="5" className="text-center h-24">No expenses found for this period.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            ) : <p className="text-center text-muted-foreground py-10">No data available for the selected period.</p>}
        </div>
    );
};

export default ReportsPage;