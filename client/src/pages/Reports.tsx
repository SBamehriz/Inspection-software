import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileSpreadsheet, Download, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Reports() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch orders from API
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const generateExcelReport = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest("POST", "/api/reports/excel", { orderId });
      return response;
    },
    onSuccess: (result) => {
      toast({
        title: "Report Generated",
        description: "Report data generated successfully.",
      });
      
      // Create downloadable file with the report data
      const blob = new Blob([JSON.stringify(result.reportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inspection-report-${orderId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        In Progress
      </Badge>
    );
  };

  const getGradeBadges = (distribution: any) => {
    return Object.entries(distribution).map(([grade, count]) => {
      if (count === 0) return null;
      
      const colorMap: any = {
        A: "bg-green-100 text-green-800",
        B: "bg-yellow-100 text-yellow-800",
        C: "bg-orange-100 text-orange-800",
        D: "bg-red-100 text-red-800",
      };
      
      return (
        <Badge key={grade} className={colorMap[grade]}>
          {grade}: {count}
        </Badge>
      );
    }).filter(Boolean);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-astora-black">Inspection Reports</h2>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-astora-red text-astora-red hover:bg-astora-red hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-astora-black">{orders.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-astora-red" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {orders.filter((order: any) => order.status === 'active').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter((order: any) => order.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Phones</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {orders.reduce((sum: number, order: any) => sum + (order.expectedQuantity || 0), 0)}
                  </p>
                </div>
                <FileSpreadsheet className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Reports Table */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Completed Orders</h3>
                <Button
                  onClick={handleGenerateExcel}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={generateExcelReport.isPending}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  {generateExcelReport.isPending ? "Generating..." : "Export Excel"}
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Details</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No orders found. Create your first order to see reports here.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{order.orderNumber}</div>
                            <div className="text-sm text-gray-500">{order.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => generateExcelReport.mutate(order.id)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            disabled={generateExcelReport.isPending}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Generate Report
                          </Button>
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
