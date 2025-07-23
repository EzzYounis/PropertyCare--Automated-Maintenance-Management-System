import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Download, 
  Search,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const mockPayments = [
  {
    id: 1,
    amount: 1850,
    dueDate: '2024-02-01',
    paidDate: '2024-01-28',
    status: 'paid',
    description: 'Monthly Rent - February 2024',
    method: 'Bank Transfer',
    confirmationNumber: 'PAY-001234'
  },
  {
    id: 2,
    amount: 1850,
    dueDate: '2024-01-01',
    paidDate: '2023-12-30',
    status: 'paid',
    description: 'Monthly Rent - January 2024',
    method: 'Credit Card',
    confirmationNumber: 'PAY-001233'
  },
  {
    id: 3,
    amount: 1850,
    dueDate: '2024-03-01',
    paidDate: null,
    status: 'upcoming',
    description: 'Monthly Rent - March 2024',
    method: null,
    confirmationNumber: null
  },
  {
    id: 4,
    amount: 150,
    dueDate: '2024-01-15',
    paidDate: '2024-01-15',
    status: 'paid',
    description: 'Pet Fee - Monthly',
    method: 'Auto Pay',
    confirmationNumber: 'PAY-001235'
  }
];

const upcomingPayments = mockPayments.filter(p => p.status === 'upcoming');
const paidPayments = mockPayments.filter(p => p.status === 'paid');

export const TenantPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'upcoming':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-error" />;
      default:
        return <Calendar className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success text-white">Paid</Badge>;
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayments = mockPayments.filter(payment =>
    payment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPaid = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalUpcoming = upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Manage your rent payments and payment history</p>
        </div>
        <Button variant="tenant" size="lg">
          <CreditCard className="w-4 h-4 mr-2" />
          Make Payment
        </Button>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid (2024)</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across 3 payments</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">${totalUpcoming.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Due March 1st</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-tenant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <Clock className="h-4 w-4 text-tenant" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tenant">$1,850</div>
            <p className="text-xs text-muted-foreground">Due in 15 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Lease Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-tenant" />
            Current Lease Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Lease Progress</span>
                <span className="font-medium">14 of 24 months</span>
              </div>
              <Progress value={58} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                Lease ends December 31, 2024
              </p>
            </div>
            <div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Rent</span>
                  <span className="font-semibold">$1,850</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Security Deposit</span>
                  <span className="font-semibold">$1,850</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pet Fee</span>
                  <span className="font-semibold">$150/month</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payment history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Complete record of all your payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-tenant/10 rounded-lg flex items-center justify-center">
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                      {payment.paidDate && (
                        <span>• Paid: {new Date(payment.paidDate).toLocaleDateString()}</span>
                      )}
                      {payment.method && <span>• {payment.method}</span>}
                    </div>
                    {payment.confirmationNumber && (
                      <p className="text-xs text-muted-foreground">
                        Confirmation: {payment.confirmationNumber}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-lg">${payment.amount.toLocaleString()}</p>
                    {getStatusBadge(payment.status)}
                  </div>
                  {payment.status === 'paid' && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Receipt
                    </Button>
                  )}
                  {payment.status === 'upcoming' && (
                    <Button variant="tenant" size="sm">
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-tenant" />
            Payment Methods
          </CardTitle>
          <CardDescription>Manage your payment methods and auto-pay settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-sm text-muted-foreground">Primary method</p>
                </div>
              </div>
              <Badge className="bg-success text-white">Auto Pay Enabled</Badge>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">**** **** **** 4532</p>
                  <p className="text-sm text-muted-foreground">Backup method</p>
                </div>
              </div>
              <Badge variant="outline">Backup</Badge>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline">
              Add Payment Method
            </Button>
            <Button variant="outline">
              Manage Auto Pay
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};