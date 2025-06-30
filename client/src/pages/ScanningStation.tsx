import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { QrCode, Smartphone, AlertTriangle, Save, RotateCcw, ArrowLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function ScanningStation() {
  const [, setLocation] = useLocation();
  const [imei, setImei] = useState("");
  const [phoneSpecs, setPhoneSpecs] = useState<any>(null);
  const [grade, setGrade] = useState("");
  const [selectedDefects, setSelectedDefects] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock order data - in real app, this would come from global state
  const currentOrder = { id: 1, orderNumber: "ORD-2024-001", expectedQuantity: 20 };
  const completedInspections = 5; // This would come from API

  const lookupIMEI = useMutation({
    mutationFn: async (imeiNumber: string) => {
      const response = await apiRequest("GET", `/api/imei/${imeiNumber}`);
      return response.json();
    },
    onSuccess: (specs) => {
      setPhoneSpecs(specs);
      toast({
        title: "Phone Found",
        description: `${specs.brand} ${specs.model} detected`,
      });
    },
    onError: (error) => {
      toast({
        title: "IMEI Lookup Failed",
        description: error.message || "Could not retrieve phone specifications",
        variant: "destructive",
      });
    },
  });

  const saveInspection = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/inspections", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inspection data saved successfully!",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save inspection data",
        variant: "destructive",
      });
    },
  });

  const handleScanIMEI = () => {
    if (imei.length < 15) {
      toast({
        title: "Invalid IMEI",
        description: "Please enter a valid 15-digit IMEI number",
        variant: "destructive",
      });
      return;
    }
    lookupIMEI.mutate(imei);
  };

  const handleDefectChange = (defect: string, checked: boolean) => {
    if (checked) {
      setSelectedDefects([...selectedDefects, defect]);
    } else {
      setSelectedDefects(selectedDefects.filter(d => d !== defect));
    }
  };

  const handleSaveInspection = () => {
    if (!imei || !grade) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    saveInspection.mutate({
      imei,
      orderId: currentOrder.id,
      phoneSpecs,
      grade,
      defects: selectedDefects,
      notes: notes || undefined,
    });
  };

  const resetForm = () => {
    setImei("");
    setPhoneSpecs(null);
    setGrade("");
    setSelectedDefects([]);
    setNotes("");
  };

  const defectOptions = [
    { value: "screen-crack", label: "Screen Crack" },
    { value: "back-damage", label: "Back Damage" },
    { value: "battery-issue", label: "Battery Issue" },
    { value: "camera-malfunction", label: "Camera Issue" },
    { value: "button-stuck", label: "Button Problems" },
    { value: "water-damage", label: "Water Damage" },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Station Header */}
        <Card className="bg-astora-red text-white mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <QrCode className="text-2xl mr-3" />
                <h2 className="text-xl font-bold">Scanning Station</h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm">
                  Progress: {completedInspections}/{currentOrder.expectedQuantity}
                </span>
                <Button
                  onClick={() => setLocation("/station-selection")}
                  variant="secondary"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Switch Station
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* IMEI Scanner */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-astora-black mb-4">
                <Smartphone className="inline mr-2 text-astora-red" />
                IMEI Scanner
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imei" className="block text-sm font-medium text-gray-700 mb-2">
                    IMEI Number
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="imei"
                      type="text"
                      value={imei}
                      onChange={(e) => setImei(e.target.value)}
                      className="flex-1 focus:ring-astora-red focus:border-transparent"
                      placeholder="Scan or enter IMEI"
                      maxLength={15}
                    />
                    <Button
                      onClick={handleScanIMEI}
                      className="bg-astora-red hover:bg-astora-dark-red"
                      disabled={lookupIMEI.isPending}
                    >
                      {lookupIMEI.isPending ? "..." : <QrCode className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                {/* Phone Info Display */}
                {phoneSpecs && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Phone Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Brand:</span>
                          <span className="font-medium ml-2">{phoneSpecs.brand}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Model:</span>
                          <span className="font-medium ml-2">{phoneSpecs.model}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Storage:</span>
                          <span className="font-medium ml-2">{phoneSpecs.storage || "Unknown"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Color:</span>
                          <span className="font-medium ml-2">{phoneSpecs.color || "Unknown"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Defect Documentation */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-astora-black mb-4">
                <AlertTriangle className="inline mr-2 text-yellow-500" />
                Defect Documentation
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                    Condition Grade
                  </Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger className="w-full focus:ring-astora-red">
                      <SelectValue placeholder="Select grade..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Grade A - Excellent</SelectItem>
                      <SelectItem value="B">Grade B - Good</SelectItem>
                      <SelectItem value="C">Grade C - Fair</SelectItem>
                      <SelectItem value="D">Grade D - Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Common Issues
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {defectOptions.map((defect) => (
                      <div key={defect.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={defect.value}
                          checked={selectedDefects.includes(defect.value)}
                          onCheckedChange={(checked) => handleDefectChange(defect.value, checked as boolean)}
                        />
                        <Label htmlFor={defect.value} className="text-sm">
                          {defect.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full focus:ring-astora-red focus:border-transparent"
                    rows={3}
                    placeholder="Detailed description of any issues or observations"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          <Button
            onClick={handleSaveInspection}
            className="bg-astora-red hover:bg-astora-dark-red text-white px-8 py-3 font-semibold"
            disabled={saveInspection.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {saveInspection.isPending ? "Saving..." : "Save & Continue"}
          </Button>
          <Button
            onClick={resetForm}
            variant="outline"
            className="px-8 py-3 font-semibold"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Form
          </Button>
        </div>
      </div>
    </div>
  );
}
