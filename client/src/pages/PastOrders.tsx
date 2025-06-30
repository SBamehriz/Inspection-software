import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Eye, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function PastOrders() {
  const [, setLocation] = useLocation();
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    description: "",
    expectedQuantity: "",
    orderNumber: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/orders/${id}`, data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "Order has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setEditingOrder(null);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order",
        variant: "destructive",
      });
    },
  });

  const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    setEditFormData({
      description: order.description,
      expectedQuantity: order.expectedQuantity.toString(),
      orderNumber: order.orderNumber,
    });
  };

  const handleUpdateOrder = () => {
    if (!editFormData.orderNumber.match(/^\d{12}$/)) {
      toast({
        title: "Invalid Order Number",
        description: "Order number must be exactly 12 digits",
        variant: "destructive",
      });
      return;
    }

    if (!editFormData.description.trim() || !editFormData.expectedQuantity) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    updateOrder.mutate({
      id: editingOrder.id,
      data: {
        description: editFormData.description,
        expectedQuantity: parseInt(editFormData.expectedQuantity),
        orderNumber: editFormData.orderNumber,
      },
    });
  };

  const handleContinueOrder = (orderNumber: string) => {
    localStorage.setItem("currentOrderNumber", orderNumber);
    setLocation("/station-selection");
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-astora-black">Past Orders</h2>
          <div className="flex gap-4">
            <Button
              onClick={() => setLocation("/new-order")}
              className="bg-astora-red hover:bg-astora-dark-red text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="border-astora-red text-astora-red hover:bg-astora-red hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">All Orders</h3>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Expected Quantity</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No orders found. Create your first order to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>{order.description}</TableCell>
                        <TableCell>{order.expectedQuantity} phones</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  onClick={() => handleEditOrder(order)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-astora-red hover:text-astora-dark-red hover:bg-red-50"
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit Order</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="editOrderNumber">Order Number (12 digits)</Label>
                                    <Input
                                      id="editOrderNumber"
                                      value={editFormData.orderNumber}
                                      onChange={(e) => setEditFormData({ ...editFormData, orderNumber: e.target.value })}
                                      placeholder="Enter 12 digit order number"
                                      pattern="[0-9]{12}"
                                      maxLength={12}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="editDescription">Description</Label>
                                    <Input
                                      id="editDescription"
                                      value={editFormData.description}
                                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                      placeholder="Order description"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="editQuantity">Expected Quantity</Label>
                                    <Input
                                      id="editQuantity"
                                      type="number"
                                      min="1"
                                      value={editFormData.expectedQuantity}
                                      onChange={(e) => setEditFormData({ ...editFormData, expectedQuantity: e.target.value })}
                                      placeholder="Number of phones"
                                    />
                                  </div>
                                  <Button
                                    onClick={handleUpdateOrder}
                                    className="w-full bg-astora-red hover:bg-astora-dark-red text-white"
                                    disabled={updateOrder.isPending}
                                  >
                                    {updateOrder.isPending ? "Updating..." : "Update Order"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              onClick={() => handleContinueOrder(order.orderNumber)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Continue
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}