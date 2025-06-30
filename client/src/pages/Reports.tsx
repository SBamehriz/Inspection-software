import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, FileSpreadsheet, Eye, Download, CheckCircle, Clock } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Reports() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const { toast } = useToast();

  // Mock data for demonstration - in real app, this would come from API
  const mockReports = [
    {
      id: 1,
      orderNumber: "ORD-2024-001",
      createdAt: "2024-01-15",
      status: "completed",
      totalPhones: 15,
      gradeDistribution: { A: 8, B: 5, C: 2, D: 0 },
      inspector: "John Doe",
    },
    {
      id: 2,
      orderNumber: "ORD-2024-002",
      createdAt: "2024-01-14",
      status: "active",
      totalPhones: 8,
      expectedTotal: 20,
      gradeDistribution: { A: 3, B: 4, C: 1, D: 0 },
      inspector: "Jane Smith",
    },
  ];

  const generateExcelReport = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest("POST", "/api/reports/excel", { orderId });
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Report Generated",
        description: "Excel report has been generated and uploaded to cloud storage.",
      });
      // In a real app, you might open the report URL
      window.open(result.reportUrl, '_blank');
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate Excel report",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    // TODO: Implement search functionality with API
    toast({
      title: "Search",
      description: "Search functionality will be implemented with backend integration.",
    });
  };

  const handleGenerateExcel = () => {
    // Generate report for the first completed order as example
    const completedOrder = mockReports.find(r => r.status === "completed");
    if (completedOrder) {
      generateExcelReport.mutate(completedOrder.id);
    }
  };

  const handleViewOrder = (orderNumber: string) => {
    toast({
      title: "View Order",
      description: `Viewing details for ${orderNumber}`,
    });
  };

  const handleContinueOrder = (orderNumber: string) => {
    toast({
      title: "Continue Order",
      description: `Continuing inspection for ${orderNumber}`,
    });
    setLocation("/station-selection");
  };

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
        
        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Orders
                </Label>
                <Input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full focus:ring-astora-red focus:border-transparent"
                  placeholder="Order number or IMEI"
                />
              </div>
              
              <div>
                <Label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full focus:ring-astora-red focus:border-transparent"
                />
              </div>
              
              <div>
                <Label htmlFor="gradeFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Filter
                </Label>
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger className="w-full focus:ring-astora-red">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Grades</SelectItem>
                    <SelectItem value="A">Grade A</SelectItem>
                    <SelectItem value="B">Grade B</SelectItem>
                    <SelectItem value="C">Grade C</SelectItem>
                    <SelectItem value="D">Grade D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full bg-astora-red hover:bg-astora-dark-red text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
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
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Phones</TableHead>
                    <TableHead>Grade Distribution</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{report.orderNumber}</div>
                          <div className="text-sm text-gray-500">Inspector: {report.inspector}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {report.status === "completed" 
                          ? `${report.totalPhones} phones`
                          : `${report.totalPhones}/${report.expectedTotal} phones`
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getGradeBadges(report.gradeDistribution)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {report.status === "completed" ? (
                            <>
                              <Button
                                onClick={() => handleViewOrder(report.orderNumber)}
                                variant="ghost"
                                size="sm"
                                className="text-astora-red hover:text-astora-dark-red hover:bg-red-50"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                onClick={() => generateExcelReport.mutate(report.id)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                disabled={generateExcelReport.isPending}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Export
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => handleContinueOrder(report.orderNumber)}
                              variant="ghost"
                              size="sm"
                              className="text-astora-red hover:text-astora-dark-red hover:bg-red-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Continue
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
