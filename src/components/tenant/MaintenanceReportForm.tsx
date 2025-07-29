import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Calendar,
  Clock,
  Upload,
  ChevronDown,
  ChevronRight,
  Save,
  Send,
  AlertCircle,
  Clock3,
  Zap,
  AlertTriangle,
  X,
  Check,
  Home,
  Wrench,
  Droplets,
  Thermometer,
  Lightbulb,
  Refrigerator,
  Bug,
  Shield,
  Paintbrush,
  Grid3x3,
  Wind,
  Flower,
  MoreHorizontal
} from 'lucide-react';

interface MainCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  subCategories: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
  placeholderTitle: string;
  placeholderDescription: string;
}

interface Priority {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  responseTime: string;
  icon: React.ComponentType<any>;
}

const mainCategories: MainCategory[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: Droplets,
    subCategories: [
      { id: 'leak', name: 'Leak', placeholderTitle: 'e.g., Kitchen sink leaking', placeholderDescription: 'Describe where the leak is occurring and how severe it is...' },
      { id: 'clog', name: 'Clog/Blockage', placeholderTitle: 'e.g., Bathroom drain clogged', placeholderDescription: 'What is clogged and have you tried any solutions...' },
      { id: 'no-water', name: 'No Water', placeholderTitle: 'e.g., No hot water in shower', placeholderDescription: 'Describe the water issue - cold, hot, or no water at all...' },
      { id: 'toilet', name: 'Toilet Issues', placeholderTitle: 'e.g., Toilet won\'t flush', placeholderDescription: 'Describe the toilet problem in detail...' }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: Zap,
    subCategories: [
      { id: 'lights', name: 'Lights', placeholderTitle: 'e.g., Bedroom light not working', placeholderDescription: 'Which lights are affected and what exactly is happening...' },
      { id: 'outlets', name: 'Outlets', placeholderTitle: 'e.g., Living room outlet not working', placeholderDescription: 'Describe the outlet issue and what you were trying to plug in...' },
      { id: 'circuit-breaker', name: 'Circuit Breaker', placeholderTitle: 'e.g., Circuit breaker keeps tripping', placeholderDescription: 'What causes the breaker to trip and how often does it happen...' },
      { id: 'wiring', name: 'Wiring Issues', placeholderTitle: 'e.g., Sparking outlet', placeholderDescription: 'Describe any sparking, burning smells, or exposed wires...' }
    ]
  },
  {
    id: 'hvac',
    name: 'HVAC',
    icon: Thermometer,
    subCategories: [
      { id: 'heating', name: 'Heating', placeholderTitle: 'e.g., Heater not working', placeholderDescription: 'Is it not turning on, not heating enough, or making noise...' },
      { id: 'cooling', name: 'Air Conditioning', placeholderTitle: 'e.g., AC not cooling', placeholderDescription: 'Describe the cooling issue and current temperature...' },
      { id: 'ventilation', name: 'Ventilation', placeholderTitle: 'e.g., Bathroom fan not working', placeholderDescription: 'Which vents or fans are affected...' },
      { id: 'thermostat', name: 'Thermostat', placeholderTitle: 'e.g., Thermostat display blank', placeholderDescription: 'What is the thermostat doing or not doing...' }
    ]
  },
  {
    id: 'appliances',
    name: 'Appliances',
    icon: Refrigerator,
    subCategories: [
      { id: 'refrigerator', name: 'Refrigerator', placeholderTitle: 'e.g., Fridge not cooling', placeholderDescription: 'Describe the refrigerator issue...' },
      { id: 'washer-dryer', name: 'Washer/Dryer', placeholderTitle: 'e.g., Washer won\'t drain', placeholderDescription: 'Which appliance and what is it doing...' },
      { id: 'dishwasher', name: 'Dishwasher', placeholderTitle: 'e.g., Dishwasher leaking', placeholderDescription: 'Describe the dishwasher problem...' },
      { id: 'stove-oven', name: 'Stove/Oven', placeholderTitle: 'e.g., Oven not heating', placeholderDescription: 'Which part of the stove/oven has issues...' }
    ]
  },
  {
    id: 'pest',
    name: 'Pest Control',
    icon: Bug,
    subCategories: [
      { id: 'insects', name: 'Insects', placeholderTitle: 'e.g., Ants in kitchen', placeholderDescription: 'What type of insects and where are you seeing them...' },
      { id: 'rodents', name: 'Rodents', placeholderTitle: 'e.g., Mice in apartment', placeholderDescription: 'What evidence of rodents have you noticed...' },
      { id: 'other-pests', name: 'Other Pests', placeholderTitle: 'e.g., Pest issue', placeholderDescription: 'Describe the pest problem...' }
    ]
  },
  {
    id: 'security',
    name: 'Locks/Security',
    icon: Shield,
    subCategories: [
      { id: 'door-locks', name: 'Door Locks', placeholderTitle: 'e.g., Front door lock stuck', placeholderDescription: 'Describe the lock issue...' },
      { id: 'windows', name: 'Window Security', placeholderTitle: 'e.g., Window won\'t lock', placeholderDescription: 'Which windows and what security issue...' },
      { id: 'keys', name: 'Keys', placeholderTitle: 'e.g., Need spare key', placeholderDescription: 'Describe your key situation...' }
    ]
  },
  {
    id: 'painting',
    name: 'Painting/Walls',
    icon: Paintbrush,
    subCategories: [
      { id: 'paint-damage', name: 'Paint Damage', placeholderTitle: 'e.g., Paint peeling in bathroom', placeholderDescription: 'Where is the paint damage and how extensive...' },
      { id: 'holes-cracks', name: 'Holes/Cracks', placeholderTitle: 'e.g., Hole in living room wall', placeholderDescription: 'Describe the wall damage...' },
      { id: 'stains', name: 'Stains', placeholderTitle: 'e.g., Water stain on ceiling', placeholderDescription: 'What type of stain and where...' }
    ]
  },
  {
    id: 'flooring',
    name: 'Flooring',
    icon: Grid3x3,
    subCategories: [
      { id: 'carpet', name: 'Carpet', placeholderTitle: 'e.g., Carpet stain', placeholderDescription: 'Describe the carpet issue...' },
      { id: 'hardwood', name: 'Hardwood', placeholderTitle: 'e.g., Loose floorboard', placeholderDescription: 'Describe the hardwood issue...' },
      { id: 'tile', name: 'Tile', placeholderTitle: 'e.g., Cracked bathroom tile', placeholderDescription: 'Which tiles are affected...' }
    ]
  },
  {
    id: 'doors-windows',
    name: 'Windows/Doors',
    icon: Wind,
    subCategories: [
      { id: 'door-issues', name: 'Door Problems', placeholderTitle: 'e.g., Door won\'t close properly', placeholderDescription: 'Which door and what is the issue...' },
      { id: 'window-issues', name: 'Window Problems', placeholderTitle: 'e.g., Window won\'t open', placeholderDescription: 'Which windows and what is happening...' }
    ]
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    icon: Flower,
    subCategories: [
      { id: 'lawn', name: 'Lawn Care', placeholderTitle: 'e.g., Grass needs cutting', placeholderDescription: 'Describe the landscaping need...' },
      { id: 'plants', name: 'Plants/Trees', placeholderTitle: 'e.g., Dead tree removal', placeholderDescription: 'Describe the plant or tree issue...' }
    ]
  },
  {
    id: 'other',
    name: 'Other',
    icon: MoreHorizontal,
    subCategories: [
      { id: 'general', name: 'General Issue', placeholderTitle: 'e.g., Describe your issue', placeholderDescription: 'Please provide as much detail as possible about the issue...' }
    ]
  }
];

const priorities: Priority[] = [
  {
    id: 'low',
    label: 'Low',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    responseTime: '3-5 business days',
    icon: Clock3
  },
  {
    id: 'medium',
    label: 'Medium',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    responseTime: '1-2 business days',
    icon: AlertCircle
  },
  {
    id: 'high',
    label: 'High',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    responseTime: 'Within 24 hours',
    icon: AlertTriangle
  },
  {
    id: 'emergency',
    label: 'Emergency',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    responseTime: 'Immediate response',
    icon: Zap
  }
];

const locations = [
  'Living Room', 'Kitchen', 'Master Bedroom', 'Bedroom 2', 'Bedroom 3',
  'Master Bathroom', 'Guest Bathroom', 'Hallway', 'Dining Room',
  'Laundry Room', 'Basement', 'Attic', 'Garage', 'Balcony/Patio',
  'Exterior', 'Common Area', 'Other'
];

const timeSlots = [
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
  'Flexible'
];

export const MaintenanceReportForm = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('medium');
  const [schedulingExpanded, setSchedulingExpanded] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    const formData = {
      selectedCategory,
      selectedSubCategory,
      title,
      description,
      location,
      priority,
      preferredDate,
      timeSlot
    };
    localStorage.setItem('maintenanceFormDraft', JSON.stringify(formData));
  }, [selectedCategory, selectedSubCategory, title, description, location, priority, preferredDate, timeSlot]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('maintenanceFormDraft');
    if (savedDraft) {
      const data = JSON.parse(savedDraft);
      setSelectedCategory(data.selectedCategory || '');
      setSelectedSubCategory(data.selectedSubCategory || '');
      setTitle(data.title || '');
      setDescription(data.description || '');
      setLocation(data.location || '');
      setPriority(data.priority || 'medium');
      setPreferredDate(data.preferredDate || '');
      setTimeSlot(data.timeSlot || '');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Enter to submit
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleSubmit(false);
      }
      // Ctrl+S to save draft
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSubmit(true);
      }
      // Escape to collapse scheduling section
      if (event.key === 'Escape' && schedulingExpanded) {
        setSchedulingExpanded(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [schedulingExpanded]);

  const selectedCategoryData = mainCategories.find(cat => cat.id === selectedCategory);
  const selectedSubCategoryData = selectedCategoryData?.subCategories.find(sub => sub.id === selectedSubCategory);
  const selectedPriority = priorities.find(p => p.id === priority);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory('');
    setTitle('');
    setDescription('');
  };

  const handleSubCategorySelect = (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId);
    setTitle('');
    setDescription('');
  };

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 5 - photos.length);
    // Validate file types and sizes
    const validFiles = newFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isImage && isValidSize;
    });
    
    if (validFiles.length !== newFiles.length) {
      toast({
        title: "Invalid Files",
        description: "Only image files under 10MB are allowed.",
        variant: "destructive",
      });
    }
    
    setPhotos(prev => [...prev, ...validFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Real-time validation
  useEffect(() => {
    const errors: string[] = [];
    if (selectedCategory && !selectedSubCategory) {
      errors.push('Please select a specific issue type');
    }
    if (selectedSubCategory && !title.trim()) {
      errors.push('Please provide an issue title');
    }
    if (title.trim() && !description.trim()) {
      errors.push('Please provide a detailed description');
    }
    if (description.trim() && !location) {
      errors.push('Please select a location');
    }
    setValidationErrors(errors);
  }, [selectedCategory, selectedSubCategory, title, description, location]);

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (asDraft = false) => {
    if (asDraft) {
      setIsDraft(true);
      toast({
        title: "Draft Saved",
        description: "Your maintenance request has been saved as a draft.",
      });
      return;
    }

    if (!selectedCategory || !selectedSubCategory || !title || !description || !location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create maintenance request
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert({
          tenant_id: profile?.id,
          title,
          description,
          category: selectedCategory,
          subcategory: selectedSubCategory,
          location,
          priority,
          preferred_date: preferredDate || null,
          preferred_time_slot: timeSlot || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Upload photos if any
      if (photos.length > 0) {
        for (const photo of photos) {
          const fileName = `${data.id}/${Date.now()}-${photo.name}`;
          const { error: uploadError } = await supabase.storage
            .from('maintenance-photos')
            .upload(fileName, photo);

          if (uploadError) {
            console.error('Photo upload error:', uploadError);
          }
        }
      }

      // Clear form
      setSelectedCategory('');
      setSelectedSubCategory('');
      setTitle('');
      setDescription('');
      setLocation('');
      setPriority('medium');
      setPreferredDate('');
      setTimeSlot('');
      setPhotos([]);
      setSchedulingExpanded(false);
      localStorage.removeItem('maintenanceFormDraft');

      toast({
        title: "Request Submitted",
        description: "Your maintenance request has been submitted successfully.",
      });

    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentPlaceholder = () => {
    if (selectedSubCategoryData) {
      return {
        title: selectedSubCategoryData.placeholderTitle,
        description: selectedSubCategoryData.placeholderDescription
      };
    }
    return {
      title: 'e.g., Describe your issue briefly',
      description: 'Please provide detailed information about the maintenance issue...'
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Maintenance Issue</h1>
            <p className="text-gray-600">Select category, describe the issue, and we'll get it fixed</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Breadcrumb */}
        {(selectedCategory || selectedSubCategory) && (
          <div className="sticky top-24 z-30 bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm">
              <Home className="w-4 h-4 text-gray-400" />
              {selectedCategoryData && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-blue-600 font-medium">{selectedCategoryData.name}</span>
                </>
              )}
              {selectedSubCategoryData && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-blue-600 font-medium">{selectedSubCategoryData.name}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Select Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mainCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                      selectedCategory === category.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-medium text-center">{category.name}</div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sub-Category Selection */}
        {selectedCategoryData && (
          <Card className="animate-in slide-in-from-top-4 duration-300">
            <CardHeader>
              <CardTitle className="text-lg">Select Specific Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedCategoryData.subCategories.map((subCategory) => (
                  <button
                    key={subCategory.id}
                    onClick={() => handleSubCategorySelect(subCategory.id)}
                    className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                      selectedSubCategory === subCategory.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{subCategory.name}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issue Details */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={getCurrentPlaceholder().title}
                className="w-full"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={getCurrentPlaceholder().description}
                rows={4}
                className="w-full resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room/Location *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Priority Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priority Level
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {priorities.map((priorityOption) => {
                  const IconComponent = priorityOption.icon;
                  return (
                    <button
                      key={priorityOption.id}
                      onClick={() => setPriority(priorityOption.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        priority === priorityOption.id
                          ? `${priorityOption.borderColor} ${priorityOption.bgColor}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className={`w-6 h-6 mx-auto mb-2 ${
                        priority === priorityOption.id ? priorityOption.color : 'text-gray-400'
                      }`} />
                      <div className={`text-sm font-medium text-center ${
                        priority === priorityOption.id ? priorityOption.color : 'text-gray-700'
                      }`}>
                        {priorityOption.label}
                      </div>
                      {priority === priorityOption.id && (
                        <div className="text-xs text-gray-600 text-center mt-1">
                          {priorityOption.responseTime}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduling & Photos */}
        <Card>
          <CardHeader>
            <button
              onClick={() => setSchedulingExpanded(!schedulingExpanded)}
              className="w-full flex items-center justify-between text-left"
            >
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Appointment & Add Photos
                <Badge variant="secondary" className="ml-2">Optional</Badge>
              </CardTitle>
              {schedulingExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </CardHeader>
          
          {schedulingExpanded && (
            <CardContent className="space-y-6 animate-in slide-in-from-top-4 duration-300">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <Input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Time
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setTimeSlot(slot)}
                      className={`p-3 rounded-lg border transition-all duration-200 text-sm ${
                        timeSlot === slot
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Photos (Up to 5)
                </label>
                
                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {dragActive ? 'Drop photos here' : 'Drop photos here or click to upload'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    JPG, PNG up to 10MB each ({5 - photos.length} remaining)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files);
                    }
                  }}
                  className="hidden"
                />

                {/* Photo Previews */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Sticky Submit Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Please complete:</span>
              </div>
              <ul className="mt-1 text-sm text-red-700 ml-6">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>S
              </kbd>
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || validationErrors.length > 0}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request
                  <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-white/20 px-1.5 font-mono text-[10px] font-medium opacity-100">
                    <span className="text-xs">⌘</span>↵
                  </kbd>
                </>
              )}
            </Button>
          </div>
          
          {selectedPriority && validationErrors.length === 0 && (
            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">
                Expected response time: <span className="font-medium text-blue-600">{selectedPriority.responseTime}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
