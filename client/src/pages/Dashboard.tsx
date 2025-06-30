import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, BarChart3, CheckCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import OrderEntryModal from "@/components/OrderEntryModal";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [showOrderEntry, setShowOrderEntry] = useState(false);

  const { data: recentOrders, isLoading } = useQuery({
    queryKey: ["/api/orders/recent"],
  });

  const handleNewOrder = () => {
    setShowOrderEntry(true);
  };

  const handleContinueOrder = () => {
    setLocation("/reports");
  };

  const handleViewReports = () => {
    setLocation("/reports");
  };

  const handleOrderCreated = () => {
    setShowOrderEntry(false);
    setLocation("/station-selection");
  };

  return (
    <div className="container mx-auto p-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-astora-red">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Start New Order</h3>
                <p className="text-gray-600 text-sm">Begin inspection process</p>
              </div>
              <Plus className="text-astora-red text-2xl" />
            </div>
            <Button 
              onClick={handleNewOrder}
              className="w-full bg-astora-red hover:bg-astora-dark-red text-white"
            >
              New Order
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-gray-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Continue Order</h3>
                <p className="text-gray-600 text-sm">Resume existing order</p>
              </div>
              <Play className="text-gray-500 text-2xl" />
            </div>
            <Button 
              onClick={handleContinueOrder}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">View Reports</h3>
                <p className="text-gray-600 text-sm">Previous inspections</p>
              </div>
              <BarChart3 className="text-blue-500 text-2xl" />
            </div>
            <Button 
              onClick={handleViewReports}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
          
          {isLoading ? (
            <div className="text-center py-4">Loading recent orders...</div>
          ) : !recentOrders || recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent orders found. Start by creating a new order.
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className={`flex items-center justify-between p-3 border-l-4 ${
                    order.status === "completed" 
                      ? "border-green-500 bg-green-50" 
                      : "border-yellow-500 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {order.status === "completed" ? (
                      <CheckCircle className="text-green-500 w-5 h-5" />
                    ) : (
                      <Clock className="text-yellow-500 w-5 h-5" />
                    )}
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {order.status === "completed" 
                          ? `Completed - ${order.expectedQuantity} phones expected`
                          : `In Progress - ${order.expectedQuantity} phones expected`
                        }
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <OrderEntryModal 
        isOpen={showOrderEntry}
        onClose={() => setShowOrderEntry(false)}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
}
