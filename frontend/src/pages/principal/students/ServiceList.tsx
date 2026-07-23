import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useServiceStore, ServiceForm } from '@/store/useServiceStore';
import Heading from '@/components/common/Heading';
import { Textarea } from '@/components/ui/textarea';
import ServiceCardDescription from '@/components/common/ServiceCardDescription'

const ServiceList = () => {
  const { authUser } = useAuthStore();
  const { createService, getServices, deleteService, updateService } = useServiceStore();
  const [services, setServices] = useState<ServiceForm[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<ServiceForm>({
    school_id: Number(authUser.school_id),
    service_name: '',
    charge: 0,
    status: 'active',
    description: '',
  });

  // Fetch services from backend
  const fetchServices = async () => {
    const schoolId = Number(authUser.school_id);
    if (!schoolId) return;
    const data = await getServices(schoolId);
    if (data) setServices(data);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service_name.trim()) return;

    if (editingIndex !== null) {
      const serviceId = (services[editingIndex] as ServiceForm & { id: string }).id;
      const success = await updateService(serviceId, formData);
      if (!success) return;

      const updated = [...services];
      updated[editingIndex] = { ...formData, id: serviceId };
      setServices(updated);
    } else {
      const success = await createService(formData);
      if (success) fetchServices();
    }

    // Reset form
    setFormData({
      school_id: Number(authUser.school_id),
      service_name: '',
      charge: 0,
      status: 'active',
      description: '',
    });
    setEditingIndex(null);
    setOpen(false);
  };

  const handleEdit = (serviceId: string, index: number) => {
    const svc = services[index];
    setFormData({ ...svc, school_id: Number(authUser.school_id) });
    setEditingIndex(index);
    setOpen(true);
  };

  const handleDelete = async (serviceId: string, index: number) => {
    const success = await deleteService(serviceId);
    if (success) {
      setServices((prev) => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:justify-between md:items-center mb-8">
        <Heading title="Service Management" description="Manage services and their fees" />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className='w-fit'>
              <Plus className="h-4 w-4" /> New Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-lg text-center">
                {editingIndex !== null ? 'Edit Service' : 'New Service'}
              </DialogTitle>
            </DialogHeader>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service_name">Service Name</Label>
                <Input
                  id="service_name"
                  value={formData.service_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, service_name: e.target.value }))
                  }
                  placeholder="e.g., Transport"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="charge">Charge</Label>
                <Input
                  id="charge"
                  type="number"
                  value={formData.charge}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      charge: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                    }))
                  }
                  placeholder="e.g., 700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                 <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                  required
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Enter service description"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingIndex !== null ? 'Update' : 'Create'} Service
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

            {/* Service Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
              {services.map((svc, index) => {
                const serviceWithId = svc as ServiceForm & { id: string };
                return (
                  <Card key={serviceWithId.id} className="h-fit ">
                    <CardHeader>
                  <div className="flex justify-between items-start ">
                    {/* Service Name on the left */}
                    <CardTitle className="text-lg">{svc.service_name}</CardTitle>

                    {/* Charge on the right */}
                    <h3 className="text-md font-semibold">₹{svc.charge}</h3>
                  </div>
                  
              {/* Description below */}
              {svc.description && <ServiceCardDescription description={svc.description} />}

            </CardHeader>

              <CardContent>
                <div className="flex justify-end space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(serviceWithId.id, index)}>
                    <Edit className="h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(serviceWithId.id, index)}>
                    <Trash2 className="h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
};

export default ServiceList;
