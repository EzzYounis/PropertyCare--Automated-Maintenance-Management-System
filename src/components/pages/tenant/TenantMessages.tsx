import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Phone, 
  Mail, 
  Clock,
  CheckCheck,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockConversations = [
  {
    id: 1,
    subject: 'Kitchen Faucet Repair Update',
    participant: 'John Smith (Maintenance)',
    lastMessage: 'The repair has been completed. Please test the faucet and let me know if everything is working properly.',
    timestamp: '2024-01-16 14:30',
    unread: false,
    priority: 'normal',
    status: 'active'
  },
  {
    id: 2,
    subject: 'Monthly Rent Payment Confirmation',
    participant: 'Property Management',
    lastMessage: 'Your payment for February 2024 has been received. Thank you!',
    timestamp: '2024-01-15 09:15',
    unread: true,
    priority: 'normal',
    status: 'active'
  },
  {
    id: 3,
    subject: 'Lease Renewal Discussion',
    participant: 'Sarah Johnson (Property Manager)',
    lastMessage: 'Hi Furkan, I wanted to discuss your lease renewal options for next year. Are you available for a call this week?',
    timestamp: '2024-01-14 16:45',
    unread: true,
    priority: 'high',
    status: 'active'
  },
  {
    id: 4,
    subject: 'Building Maintenance Notice',
    participant: 'Property Management',
    lastMessage: 'The building maintenance has been completed. Normal operations have resumed.',
    timestamp: '2024-01-10 08:00',
    unread: false,
    priority: 'normal',
    status: 'closed'
  }
];

const contacts = [
  {
    name: 'Sarah Johnson',
    role: 'Property Manager',
    phone: '(555) 123-4567',
    email: 'sarah.johnson@propertycare.com',
    availability: 'Mon-Fri 9AM-5PM'
  },
  {
    name: 'Emergency Line',
    role: 'Emergency Contact',
    phone: '(555) 911-HELP',
    email: 'emergency@propertycare.com',
    availability: '24/7'
  },
  {
    name: 'Maintenance Team',
    role: 'Maintenance Support',
    phone: '(555) 123-4568',
    email: 'maintenance@propertycare.com',
    availability: 'Mon-Fri 8AM-6PM'
  }
];

export const TenantMessages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [newMessageForm, setNewMessageForm] = useState({
    to: '',
    subject: '',
    message: '',
    priority: 'normal'
  });

  const filteredConversations = mockConversations.filter(conv =>
    conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = mockConversations.filter(conv => conv.unread).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      setNewMessage('');
    }
  };

  const handleNewMessage = () => {
    if (newMessageForm.to && newMessageForm.subject && newMessageForm.message) {
      // Handle new message
      setNewMessageForm({ to: '', subject: '', message: '', priority: 'normal' });
      setIsNewMessageOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with property management and maintenance team
            {unreadCount > 0 && (
              <span className="ml-2 text-tenant font-semibold">
                ({unreadCount} unread)
              </span>
            )}
          </p>
        </div>
        
        <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
          <DialogTrigger asChild>
            <Button variant="tenant" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
              <DialogDescription>
                Send a message to property management or maintenance team
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Select value={newMessageForm.to} onValueChange={(value) => setNewMessageForm({...newMessageForm, to: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property-manager">Property Manager</SelectItem>
                      <SelectItem value="maintenance">Maintenance Team</SelectItem>
                      <SelectItem value="emergency">Emergency Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newMessageForm.priority} onValueChange={(value) => setNewMessageForm({...newMessageForm, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Message subject"
                  value={newMessageForm.subject}
                  onChange={(e) => setNewMessageForm({...newMessageForm, subject: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={newMessageForm.message}
                  onChange={(e) => setNewMessageForm({...newMessageForm, message: e.target.value})}
                  rows={5}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsNewMessageOpen(false)}>
                  Cancel
                </Button>
                <Button variant="tenant" onClick={handleNewMessage}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <div className="space-y-3">
            {filteredConversations.map((conversation) => (
              <Card 
                key={conversation.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedConversation === conversation.id ? 'ring-2 ring-tenant' : ''
                } ${conversation.unread ? 'border-l-4 border-tenant' : ''}`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${conversation.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {conversation.subject}
                        </h3>
                        {conversation.unread && (
                          <div className="w-2 h-2 bg-tenant rounded-full"></div>
                        )}
                        {conversation.priority === 'high' && (
                          <AlertCircle className="w-4 h-4 text-error" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {conversation.participant}
                      </p>
                      <p className={`text-sm line-clamp-2 ${conversation.unread ? 'font-medium' : 'text-muted-foreground'}`}>
                        {conversation.lastMessage}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.timestamp).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1">
                        {conversation.unread ? (
                          <MessageSquare className="w-4 h-4 text-tenant" />
                        ) : (
                          <CheckCheck className="w-4 h-4 text-success" />
                        )}
                        <Badge variant={conversation.status === 'active' ? 'secondary' : 'outline'}>
                          {conversation.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredConversations.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No conversations found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search criteria' : 'Start a conversation by sending a message'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-tenant" />
                Quick Contacts
              </CardTitle>
              <CardDescription>
                Important contacts for your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contacts.map((contact, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.role}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3 h-3 text-tenant" />
                      <span>{contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3 h-3 text-tenant" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-3 h-3 text-tenant" />
                      <span>{contact.availability}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Message Conversation */}
          {selectedConversation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {/* Sample messages */}
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">Hi John, the kitchen faucet repair looks great. Thank you for the quick response!</p>
                    <span className="text-xs text-muted-foreground">You • 10:30 AM</span>
                  </div>
                  <div className="p-3 bg-tenant/10 rounded-lg">
                    <p className="text-sm">You're welcome! Please don't hesitate to reach out if you notice any other issues.</p>
                    <span className="text-xs text-muted-foreground">John Smith • 2:30 PM</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your reply..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button variant="tenant" onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};