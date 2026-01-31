import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Edit2, Trash2, Star, Check } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const dummyPlans = [
  { id: 1, name: "Basic Premium", price: 5000, duration: 30, features: ["2x Earnings", "Priority Support"], active: true },
  { id: 2, name: "Gold Premium", price: 15000, duration: 90, features: ["3x Earnings", "Priority Support", "Exclusive Ads"], active: true },
  { id: 3, name: "Diamond Premium", price: 45000, duration: 365, features: ["5x Earnings", "VIP Support", "Exclusive Ads", "Bonus Rewards"], active: true },
];

export default function PremiumPlansPage() {
  const [plans, setPlans] = useState(dummyPlans);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Premium Plans</h1>
            <p className="text-sm text-muted-foreground">Manage premium subscription plans</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600" data-testid="button-add-plan">
                <Plus className="h-4 w-4 mr-2" />
                Add New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle>Add Premium Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input placeholder="e.g. Gold Premium" className="bg-zinc-800 border-zinc-700" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (LKR)</Label>
                    <Input type="number" placeholder="15000" className="bg-zinc-800 border-zinc-700" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (Days)</Label>
                    <Input type="number" placeholder="30" className="bg-zinc-800 border-zinc-700" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <textarea 
                    className="w-full h-24 rounded-md bg-zinc-800 border border-zinc-700 p-3 text-sm"
                    placeholder="2x Earnings&#10;Priority Support&#10;Exclusive Ads"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="active" defaultChecked />
                  <Label htmlFor="active">Active</Label>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => setDialogOpen(false)}>
                  Create Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="bg-zinc-900 border-zinc-800" data-testid={`card-plan-${plan.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${plan.active ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'}`}>
                    {plan.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-orange-500">LKR {plan.price.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{plan.duration} days</p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" data-testid={`button-edit-${plan.id}`}>
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300" data-testid={`button-delete-${plan.id}`}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
