import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { insertOrderSchema } from "@shared/schema";

export default function NewOrder() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    description: "",
    expectedQuantity: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createOrder = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Order Created",
        description: "New order has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setLocation("/past-orders");
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an order description",
        variant: "destructive",
      });
      return;
    }

    if (!formData.expectedQuantity || parseInt(formData.expectedQuantity) <= 0) {
      toast({
        title: "Validation Error", 
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      description: formData.description,
      expectedQuantity: parseInt(formData.expectedQuantity),
    };

    createOrder.mutate(orderData);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-astora-black">Start New Order</h2>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-astora-red text-astora-red hover:bg-astora-red hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Description
                </Label>
                <Input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full focus:ring-astora-red focus:border-transparent"
                  placeholder="Enter order description..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="expectedQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Quantity
                </Label>
                <Input
                  id="expectedQuantity"
                  type="number"
                  min="1"
                  value={formData.expectedQuantity}
                  onChange={(e) => setFormData({ ...formData, expectedQuantity: e.target.value })}
                  className="w-full focus:ring-astora-red focus:border-transparent"
                  placeholder="Number of phones expected..."
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-astora-red hover:bg-astora-dark-red text-white"
                disabled={createOrder.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                {createOrder.isPending ? "Creating Order..." : "Create Order"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}