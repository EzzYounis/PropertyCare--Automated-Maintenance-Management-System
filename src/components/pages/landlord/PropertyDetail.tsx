import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wrench,
  FileText,
  Home
} from 'lucide-react';

// Sample property data - in a real app, this would come from an API
const propertyData = {
  1: {
    id: 1,
    address: "123 Oak Street",
    type: "House",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=400&fit=crop",
    tenant: {
      name: "Sarah Johnson",
      phone: "(555) 123-4567",
      email: "sarah.johnson@email.com"
    },
    lastMaintenance: "1/15/2024",
    daysAgo: 13,
    openTickets: 0,
    status: "Active",
    statusColor: "green",
    stats: {
      totalSpent: 1250,
      completedRepairs: 3,
      ongoingRepairs: 0,
      mostFrequentIssue: "Plumbing",
      mostRepairedDevice: "Faucet"
    }
  },
  2: {
    id: 2,
    address: "456 Pine Avenue",
    type: "Apartment", 
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=400&fit=crop",
    tenant: {
      name: "Michael Chen",
      phone: "(555) 123-4567",
      email: "michael.chen@email.com"
    },
    lastMaintenance: "1/10/2024",
    daysAgo: 565,
    openTickets: 1,
    status: "In Progress",
    statusColor: "blue",
    stats: {
      totalSpent: 875,
      completedRepairs: 0,
      ongoingRepairs: 0,
      mostFrequentIssue: "HVAC",
      mostRepairedDevice: "Hvac"
    }
  },
  3: {
    id: 3,
    address: "789 Elm Drive",
    type: "Condo",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=400&fit=crop",
    tenant: {
      name: "Emily Rodriguez",
      phone: "(555) 987-6543", 
      email: "emily.rodriguez@email.com"
    },
    lastMaintenance: "1/14/2024",
    daysAgo: 14,
    openTickets: 2,
    status: "Issue Reported",
    statusColor: "red",
    stats: {
      totalSpent: 2100,
      completedRepairs: 5,
      ongoingRepairs: 2,
      mostFrequentIssue: "Electrical",
      mostRepairedDevice: "Outlets"
    }
  },
  4: {
    id: 4,
    address: "321 Maple Lane",
    type: "House",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=400&fit=crop",
    tenant: {
      name: "David Wilson",
      phone: "(555) 456-7890",
      email: "david.wilson@email.com"
    },
    lastMaintenance: "1/12/2024",
    daysAgo: 16,
    openTickets: 0,
    status: "Active",
    statusColor: "green",
    stats: {
      totalSpent: 680,
      completedRepairs: 2,
      ongoingRepairs: 0,
      mostFrequentIssue: "Plumbing",
      mostRepairedDevice: "Toilet"
    }
  },
  5: {
    id: 5,
    address: "654 Cedar Court",
    type: "Apartment",
    image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=400&fit=crop",
    tenant: {
      name: "Lisa Thompson",
      phone: "(555) 234-5678",
      email: "lisa.thompson@email.com"
    },
    lastMaintenance: "1/08/2024",
    daysAgo: 20,
    openTickets: 1,
    status: "In Progress",
    statusColor: "blue",
    stats: {
      totalSpent: 1450,
      completedRepairs: 4,
      ongoingRepairs: 1,
      mostFrequentIssue: "HVAC",
      mostRepairedDevice: "Air Conditioner"
    }
  },
  6: {
    id: 6,
    address: "987 Birch Road",
    type: "Condo",
    image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=400&fit=crop",
    tenant: {
      name: "Robert Kim",
      phone: "(555) 345-6789",
      email: "robert.kim@email.com"
    },
    lastMaintenance: "1/16/2024",
    daysAgo: 12,
    openTickets: 0,
    status: "Active",
    statusColor: "green",
    stats: {
      totalSpent: 920,
      completedRepairs: 3,
      ongoingRepairs: 0,
      mostFrequentIssue: "Electrical",
      mostRepairedDevice: "Light Fixtures"
    }
  }
};

const maintenanceHistory = [
  {
    id: 1,
    date: "2024-01-15",
    type: "Plumbing",
    description: "Fixed kitchen sink leak",
    cost: 250,
    worker: "John's Plumbing",
    status: "Completed"
  },
  {
    id: 2,
    date: "2024-01-10", 
    type: "HVAC",
    description: "Annual HVAC maintenance",
    cost: 300,
    worker: "Cool Air Services",
    status: "Completed"
  },
  {
    id: 3,
    date: "2024-01-05",
    type: "Electrical",
    description: "Replaced bathroom outlet",
    cost: 150,
    worker: "Spark Electric",
    status: "Completed"
  }
];

export const PropertyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('maintenance');
  
  const property = propertyData[Number(id) as keyof typeof propertyData];
  
  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <Button onClick={() => navigate('/properties')}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Button>
      </div>

      {/* Property Title and Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{property.address}</h1>
          <p className="text-muted-foreground">Property Type: {property.type}</p>
        </div>
        <Badge 
          className={
            property.statusColor === 'green' ? 'bg-green-500 hover:bg-green-600' :
            property.statusColor === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
            property.statusColor === 'red' ? 'bg-red-500 hover:bg-red-600' :
            'bg-gray-500 hover:bg-gray-600'
          }
        >
          {property.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Image */}
          <Card className="overflow-hidden">
            <div className="h-64 bg-muted">
              <img 
                src={property.image} 
                alt={property.address}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold">${property.stats.totalSpent}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-muted-foreground">Completed Repairs</p>
                <p className="text-xl font-bold">{property.stats.completedRepairs}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-sm text-muted-foreground">Ongoing Repairs</p>
                <p className="text-xl font-bold">{property.stats.ongoingRepairs}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-muted-foreground">Most Frequent Issue</p>
                <p className="text-xl font-bold">{property.stats.mostFrequentIssue}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Wrench className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-sm text-muted-foreground">Most Repaired Device</p>
                <p className="text-xl font-bold">{property.stats.mostRepairedDevice}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
              <TabsTrigger value="details">Property Details</TabsTrigger>
            </TabsList>

            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceHistory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Wrench className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.description}</h4>
                            <p className="text-sm text-muted-foreground">{item.type} • {item.worker}</p>
                            <p className="text-sm text-muted-foreground">{item.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${item.cost}</p>
                          <Badge variant="secondary">{item.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Property Type</p>
                      <p className="font-semibold">{property.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p className="font-semibold">{property.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                      <p className="font-semibold">{property.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
                      <p className="font-semibold">{property.openTickets}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Tenant & Maintenance Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Tenant */}
              <div>
                <h4 className="font-medium mb-2">Current Tenant</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{property.tenant.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.tenant.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{property.tenant.email}</span>
                  </div>
                </div>
              </div>

              {/* Last Maintenance */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Last Maintenance</span>
                </div>
                <p className="text-sm">{property.lastMaintenance}</p>
                <p className="text-xs text-muted-foreground">{property.daysAgo} days ago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
