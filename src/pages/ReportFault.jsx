import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/state/AuthContext';
import { 
  AlertTriangle, 
  MapPin, 
  Building, 
  FileText, 
  Save,
  Monitor,
  Snowflake,
  Lightbulb,
  Box,
  Cpu,
  Wifi,
  Droplets,
  Zap,
  Wrench
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_BASE = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

export default function ReportFault() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    building: '',
    room_number: '',
    category: '',
    severity: 'medium',
    location_type: '',
  });

  const categories = [
    { value: 'projector', label: 'Projector / Display', icon: Monitor },
    { value: 'ac', label: 'Air Conditioning', icon: Snowflake },
    { value: 'lighting', label: 'Lighting', icon: Lightbulb },
    { value: 'furniture', label: 'Furniture', icon: Box },
    { value: 'computer', label: 'Computer / Hardware', icon: Cpu },
    { value: 'network', label: 'Network / WiFi', icon: Wifi },
    { value: 'plumbing', label: 'Plumbing', icon: Droplets },
    { value: 'electrical', label: 'Electrical', icon: Zap },
    { value: 'other', label: 'Other', icon: Wrench },
  ];

  const locationTypes = [
    { value: 'classroom', label: 'Classroom' },
    { value: 'lab', label: 'Computer Lab' },
    { value: 'library', label: 'Library' },
    { value: 'common_area', label: 'Common Area' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySelect = (categoryValue) => {
    setFormData(prev => ({
      ...prev,
      category: categoryValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title for the fault report');
      setLoading(false);
      return;
    }

    if (!formData.building.trim()) {
      toast.error('Please enter the building name');
      setLoading(false);
      return;
    }

    if (!formData.room_number.trim()) {
      toast.error('Please enter the room number');
      setLoading(false);
      return;
    }

    if (!formData.location_type) {
      toast.error('Please select a location type');
      setLoading(false);
      return;
    }

    if (!formData.category) {
      toast.error('Please select an issue category');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE || ''}/api/faults/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category: formData.category || 'other',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Fault report submitted successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          building: '',
          room_number: '',
          category: '',
          severity: 'medium',
          location_type: '',
        });
        // Navigate to reports page immediately to see the new report
        navigate('/reports');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit fault report');
      }
    } catch (error) {
      console.error('Error submitting fault report:', error);
      toast.error('Failed to submit fault report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Report a Fault</h1>
        <p className="text-slate-600">Help us maintain campus facilities by reporting issues.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Location</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location Type <span className="text-red-500">*</span>
              </label>
              <select
                name="location_type"
                value={formData.location_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                {locationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Building <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  placeholder="e.g., Science Building"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  placeholder="e.g., 301"
                  required
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Issue Category Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Issue Category <span className="text-red-500">*</span>
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = formData.category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategorySelect(cat.value)}
                  className={`
                    p-4 border-2 rounded-lg transition-all
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className={`w-8 h-8 ${isSelected ? 'text-blue-600' : 'text-slate-600'}`} />
                    <span className={`text-sm font-medium text-center ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                      {cat.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Details Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief description of the issue"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide more details about the issue..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
