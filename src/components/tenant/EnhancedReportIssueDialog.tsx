import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Droplets,
  Zap,
  Thermometer,
  Settings,
  Bug,
  Key,
  Paintbrush,
  Grid3X3,
  DoorOpen,
  TreePine,
  Wrench,
  ChevronRight,
  ChevronLeft,
  Upload,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  Camera,
  X,
  Home,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  bgColor: string;
  subcategories: { id: string; name: string; quickFixes?: string[] }[];
}

const categories: Category[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: Droplets,
    description: 'Leaks, clogs, water issues',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    subcategories: [
      { id: 'leaky-faucet', name: 'Leaky Faucet', quickFixes: ['Check if handle is fully closed', 'Look for visible damage around faucet base', 'Try tightening packing nut gently'] },
      { id: 'clogged-drain', name: 'Clogged Drain', quickFixes: ['Try using a plunger', 'Remove visible debris from drain', 'Pour hot water down the drain'] },
      { id: 'no-hot-water', name: 'No Hot Water', quickFixes: ['Check if pilot light is on (gas heater)', 'Check circuit breaker for electric heater', 'Wait 30 minutes after power restoration'] },
      { id: 'toilet-issues', name: 'Toilet Issues', quickFixes: ['Check if handle is working properly', 'Ensure water valve is open', 'Try plunging if clogged'] }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: Zap,
    description: 'Outlets, lights, circuits',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100',
    subcategories: [
      { id: 'outlet-not-working', name: 'Outlet Not Working', quickFixes: ['Check if circuit breaker is tripped', 'Test GFCI reset button', 'Try a different device in the outlet'] },
      { id: 'light-fixture', name: 'Light Fixture', quickFixes: ['Replace the light bulb', 'Check if light switch works', 'Ensure fixture is properly connected'] },
      { id: 'circuit-breaker', name: 'Circuit Breaker', quickFixes: ['Locate the electrical panel', 'Look for tripped breakers', 'Reset any tripped breakers'] }
    ]
  },
  {
    id: 'hvac',
    name: 'HVAC',
    icon: Thermometer,
    description: 'Heating, cooling, ventilation',
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    subcategories: [
      { id: 'no-heat', name: 'No Heat', quickFixes: ['Check thermostat settings', 'Replace air filter', 'Ensure vents are open'] },
      { id: 'no-cooling', name: 'No Cooling', quickFixes: ['Check thermostat settings', 'Replace air filter', 'Clear debris around outdoor unit'] },
      { id: 'poor-airflow', name: 'Poor Airflow', quickFixes: ['Replace air filter', 'Check all vents are open', 'Remove obstructions from vents'] }
    ]
  },
  {
    id: 'appliances',
    name: 'Appliances',
    icon: Settings,
    description: 'Kitchen, laundry, other appliances',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    subcategories: [
      { id: 'refrigerator', name: 'Refrigerator', quickFixes: ['Check if power cord is plugged in', 'Ensure door seals properly', 'Clean condenser coils'] },
      { id: 'dishwasher', name: 'Dishwasher', quickFixes: ['Check for clogs in drain', 'Ensure door latches properly', 'Clean filter at bottom'] },
      { id: 'washer-dryer', name: 'Washer/Dryer', quickFixes: ['Check if lint filter is clean', 'Ensure door closes completely', 'Check water connections'] }
    ]
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    icon: Bug,
    description: 'Insects, rodents, pests',
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
    subcategories: [
      { id: 'insects', name: 'Insects' },
      { id: 'rodents', name: 'Rodents' },
      { id: 'other-pests', name: 'Other Pests' }
    ]
  },
  {
    id: 'security',
    name: 'Locks/Security',
    icon: Key,
    description: 'Locks, keys, security systems',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    subcategories: [
      { id: 'door-lock', name: 'Door Lock' },
      { id: 'window-lock', name: 'Window Lock' },
      { id: 'security-system', name: 'Security System' }
    ]
  },
  {
    id: 'painting',
    name: 'Painting/Walls',
    icon: Paintbrush,
    description: 'Paint, drywall, wall repairs',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    subcategories: [
      { id: 'paint-touch-up', name: 'Paint Touch-up' },
      { id: 'wall-damage', name: 'Wall Damage' },
      { id: 'wallpaper', name: 'Wallpaper Issues' }
    ]
  },
  {
    id: 'flooring',
    name: 'Flooring',
    icon: Grid3X3,
    description: 'Carpet, hardwood, tile',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    subcategories: [
      { id: 'carpet', name: 'Carpet Issues' },
      { id: 'hardwood', name: 'Hardwood' },
      { id: 'tile', name: 'Tile/Grout' }
    ]
  },
  {
    id: 'windows-doors',
    name: 'Windows/Doors',
    icon: DoorOpen,
    description: 'Windows, doors, frames',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 hover:bg-cyan-100',
    subcategories: [
      { id: 'window-stuck', name: 'Window Stuck' },
      { id: 'door-not-closing', name: 'Door Not Closing' },
      { id: 'drafts', name: 'Drafts/Air Leaks' }
    ]
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    icon: TreePine,
    description: 'Yard, garden, outdoor areas',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    subcategories: [
      { id: 'lawn-care', name: 'Lawn Care' },
      { id: 'irrigation', name: 'Irrigation' },
      { id: 'outdoor-lighting', name: 'Outdoor Lighting' }
    ]
  },
  {
    id: 'other',
    name: 'Other',
    icon: Wrench,
    description: 'Other maintenance issues',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 hover:bg-gray-100',
    subcategories: [
      { id: 'general-repair', name: 'General Repair' },
      { id: 'safety-concern', name: 'Safety Concern' },
      { id: 'other-issue', name: 'Other Issue' }
    ]
  }
];

const priorityLevels = [
  {
    id: 'emergency',
    name: 'Emergency',
    description: 'Safety hazard, flooding, electrical danger',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    badge: 'destructive'
  },
  {
    id: 'urgent',
    name: 'Urgent',
    description: 'No heat/AC, major appliance failure',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    badge: 'warning'
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'General repairs, minor issues',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    badge: 'default'
  },
  {
    id: 'low',
    name: 'Low Priority',
    description: 'Cosmetic, convenience items',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    badge: 'secondary'
  }
];

const rooms = [
  'Living Room', 'Kitchen', 'Bedroom 1', 'Bedroom 2', 'Bedroom 3', 
  'Bathroom 1', 'Bathroom 2', 'Dining Room', 'Office/Study', 
  'Basement', 'Attic', 'Garage', 'Outdoor/Patio', 'Hallway', 'Other'
];

const timeSlots = [
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
  'Evening (6:00 PM - 8:00 PM)'
];

interface EnhancedReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnhancedReportIssueDialog: React.FC<EnhancedReportIssueDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [quickFixesCompleted, setQuickFixesCompleted] = useState<string[]>([]);
  const [showQuickFixes, setShowQuickFixes] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState('standard');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [preferredDate, setPreferredDate] = useState<Date>();
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    urgentDetails: ''
  });

  const { toast } = useToast();

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setSelectedSubcategory('');
    setQuickFixesCompleted([]);
    setShowQuickFixes(true);
    setSelectedPriority('standard');
    setSelectedRoom('');
    setPreferredDate(undefined);
    setSelectedTimeSlots([]);
    setUploadedPhotos([]);
    setFormData({
      title: '',
      description: '',
      location: '',
      urgentDetails: ''
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
    setQuickFixesCompleted([]);
    setShowQuickFixes(true);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setQuickFixesCompleted([]);
  };

  const handleQuickFixToggle = (quickFix: string) => {
    setQuickFixesCompleted(prev => 
      prev.includes(quickFix) 
        ? prev.filter(fix => fix !== quickFix)
        : [...prev, quickFix]
    );
  };

  const handleTimeSlotToggle = (timeSlot: string) => {
    setSelectedTimeSlots(prev => 
      prev.includes(timeSlot)
        ? prev.filter(slot => slot !== timeSlot)
        : [...prev, timeSlot]
    );
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const issueData = {
      category: selectedCategory?.name,
      subcategory: selectedSubcategory,
      priority: selectedPriority,
      title: formData.title,
      description: formData.description,
      room: selectedRoom,
      preferredDate,
      timeSlots: selectedTimeSlots,
      photos: uploadedPhotos,
      quickFixesAttempted: quickFixesCompleted
    };

    toast({
      title: "Issue Reported Successfully!",
      description: "Your maintenance request has been submitted and assigned a tracking number.",
    });

    resetForm();
    onOpenChange(false);
  };

  const getProgressPercentage = () => {
    return (currentStep / 3) * 100;
  };

  const canProceedFromStep1 = selectedCategory && selectedSubcategory;
  const canProceedFromStep2 = formData.title && formData.description && selectedPriority;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-tenant" />
            Report Maintenance Issue
          </DialogTitle>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of 3</span>
              <span>{Math.round(getProgressPercentage())}% Complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-tenant h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className={currentStep >= 1 ? 'text-tenant font-medium' : ''}>Category</span>
              <span className={currentStep >= 2 ? 'text-tenant font-medium' : ''}>Details</span>
              <span className={currentStep >= 3 ? 'text-tenant font-medium' : ''}>Schedule</span>
            </div>
          </div>
        </DialogHeader>

        {/* Step 1: Category Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What type of issue are you experiencing?</h3>
              <p className="text-muted-foreground mb-4">Select the category that best describes your maintenance issue</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory?.id === category.id;
                
                return (
                  <Card
                    key={category.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      category.bgColor,
                      isSelected && "ring-2 ring-tenant border-tenant"
                    )}
                    onClick={() => handleCategorySelect(category)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={cn("w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center", 
                        isSelected ? 'bg-tenant/10' : 'bg-white/50')}>
                        <Icon className={cn("w-6 h-6", category.color)} />
                      </div>
                      <h4 className="font-medium mb-1">{category.name}</h4>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Subcategories */}
            {selectedCategory && (
              <div className="space-y-4 border-t pt-6">
                <h4 className="font-medium">Select specific issue:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCategory.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm",
                        selectedSubcategory === subcategory.id 
                          ? 'border-tenant bg-tenant/5' 
                          : 'border-border hover:border-tenant/50'
                      )}
                      onClick={() => handleSubcategorySelect(subcategory.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{subcategory.name}</span>
                        {selectedSubcategory === subcategory.id && (
                          <CheckCircle className="w-4 h-4 text-tenant" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Fixes */}
            {selectedCategory && selectedSubcategory && showQuickFixes && (
              (() => {
                const subcategory = selectedCategory.subcategories.find(sub => sub.id === selectedSubcategory);
                if (!subcategory?.quickFixes) return null;
                
                return (
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <h4 className="font-medium">Try These Quick Fixes First</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      These simple steps might resolve your issue without needing a service call:
                    </p>
                    
                    <div className="space-y-3">
                      {subcategory.quickFixes.map((quickFix, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                          <Checkbox
                            id={`quickfix-${index}`}
                            checked={quickFixesCompleted.includes(quickFix)}
                            onCheckedChange={() => handleQuickFixToggle(quickFix)}
                          />
                          <label 
                            htmlFor={`quickfix-${index}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {quickFix}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowQuickFixes(false)}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        Still Need Help
                      </Button>
                      {quickFixesCompleted.length === subcategory.quickFixes.length && (
                        <Button variant="default" onClick={() => onOpenChange(false)} className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Issue Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* Step 2: Issue Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Issue Details</h3>
              <p className="text-muted-foreground">Provide specific information about your maintenance issue</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issue-title">Issue Title *</Label>
                <Input
                  id="issue-title"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="room-location">Room/Location</Label>
                <select
                  id="room-location"
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  <option value="">Select room</option>
                  {rooms.map((room) => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail, including when it started, how often it occurs, and any other relevant information..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.description.length}/500 characters
              </div>
            </div>

            {/* Priority Selection */}
            <div className="space-y-4">
              <Label>Priority Level *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {priorityLevels.map((priority) => (
                  <div
                    key={priority.id}
                    className={cn(
                      "p-4 border-2 rounded-lg cursor-pointer transition-all duration-200",
                      priority.bgColor,
                      selectedPriority === priority.id 
                        ? 'border-tenant ring-2 ring-tenant/20' 
                        : 'hover:border-tenant/50'
                    )}
                    onClick={() => setSelectedPriority(priority.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={cn("font-medium", priority.color)}>{priority.name}</h4>
                      {selectedPriority === priority.id && (
                        <CheckCircle className="w-4 h-4 text-tenant" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{priority.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedPriority === 'emergency' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Emergency Issue Details</h4>
                    <Textarea
                      placeholder="Please provide immediate safety concerns and any actions you've taken..."
                      value={formData.urgentDetails}
                      onChange={(e) => setFormData({...formData, urgentDetails: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Scheduling & Media */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Schedule & Additional Information</h3>
              <p className="text-muted-foreground">When would you prefer the repair to be completed?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div className="space-y-4">
                <Label>Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !preferredDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {preferredDate ? format(preferredDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={preferredDate}
                      onSelect={setPreferredDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Slots */}
              <div className="space-y-4">
                <Label>Preferred Time Slots</Label>
                <div className="space-y-2">
                  {timeSlots.map((timeSlot) => (
                    <div
                      key={timeSlot}
                      className={cn(
                        "p-2 border rounded cursor-pointer transition-all duration-200",
                        selectedTimeSlots.includes(timeSlot)
                          ? 'border-tenant bg-tenant/5'
                          : 'border-border hover:border-tenant/50'
                      )}
                      onClick={() => handleTimeSlotToggle(timeSlot)}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{timeSlot}</span>
                        {selectedTimeSlots.includes(timeSlot) && (
                          <CheckCircle className="w-4 h-4 text-tenant ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-4">
              <Label>Upload Photos</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Drag photos here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Support: JPG, PNG, GIF (Max 5MB each)
                    </p>
                  </div>
                </label>
              </div>

              {/* Photo Previews */}
              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            
            {currentStep < 3 ? (
              <Button 
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedFromStep1) ||
                  (currentStep === 2 && !canProceedFromStep2)
                }
                variant="tenant"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} variant="tenant">
                Submit Request
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};