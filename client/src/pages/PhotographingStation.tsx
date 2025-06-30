import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Search, ArrowLeft, CloudUpload, Save, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function PhotographingStation() {
  const [, setLocation] = useLocation();
  const [imei, setImei] = useState("");
  const [inspectionData, setInspectionData] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock order data
  const currentOrder = { id: 1, orderNumber: "ORD-2024-001", expectedQuantity: 20 };
  const completedInspections = 5;

  const loadInspection = useMutation({
    mutationFn: async (imeiNumber: string) => {
      const response = await apiRequest("GET", `/api/inspections/imei/${imeiNumber}/order/${currentOrder.id}`);
      return response.json();
    },
    onSuccess: (data) => {
      setInspectionData(data);
      toast({
        title: "Inspection Loaded",
        description: `Found inspection data for ${data.phoneSpecs?.brand} ${data.phoneSpecs?.model}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Inspection Not Found",
        description: "No inspection data found for this IMEI. Please scan at scanning station first.",
        variant: "destructive",
      });
    },
  });

  const uploadImages = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });
      
      const response = await apiRequest("POST", `/api/inspections/${inspectionData.id}/images`, formData);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Upload Complete",
        description: `${result.imageUrls.length} images uploaded successfully!`,
      });
      setSelectedFiles([]);
      setUploadProgress(0);
      setUploading(false);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
      setUploading(false);
    },
  });

  const completeInspection = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/inspections/${inspectionData.id}/status`, {
        status: "completed"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inspection Complete",
        description: "Inspection has been marked as completed!",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete inspection",
        variant: "destructive",
      });
    },
  });

  const handleLoadInspection = () => {
    if (imei.length < 15) {
      toast({
        title: "Invalid IMEI",
        description: "Please enter a valid 15-digit IMEI number",
        variant: "destructive",
      });
      return;
    }
    loadInspection.mutate(imei);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      displayImagePreviews(files);
    }
  };

  const displayImagePreviews = (files: File[]) => {
    // This would create image previews in a real implementation
    toast({
      title: "Images Selected",
      description: `${files.length} images ready for upload`,
    });
  };

  const handleUploadImages = () => {
    if (!inspectionData) {
      toast({
        title: "No Inspection Data",
        description: "Please load inspection data first",
        variant: "destructive",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select images to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    uploadImages.mutate(selectedFiles);
  };

  const handleCompleteInspection = () => {
    if (!inspectionData) {
      toast({
        title: "No Inspection Data",
        description: "Please load inspection data first",
        variant: "destructive",
      });
      return;
    }

    completeInspection.mutate();
  };

  const resetForm = () => {
    setImei("");
    setInspectionData(null);
    setSelectedFiles([]);
    setUploadProgress(0);
    setUploading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Station Header */}
        <Card className="bg-astora-red text-white mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Camera className="text-2xl mr-3" />
                <h2 className="text-xl font-bold">Photographing Station</h2>
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
          {/* IMEI Lookup */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-astora-black mb-4">
                <Search className="inline mr-2 text-astora-red" />
                Phone Lookup
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
                      placeholder="Scan IMEI to load inspection data"
                      maxLength={15}
                    />
                    <Button
                      onClick={handleLoadInspection}
                      className="bg-astora-red hover:bg-astora-dark-red"
                      disabled={loadInspection.isPending}
                    >
                      {loadInspection.isPending ? "..." : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                {/* Loaded Phone Data */}
                {inspectionData && (
                  <Card className="bg-blue-50 border border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Loaded Inspection Data
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Brand:</span>
                          <span className="font-medium ml-2">{inspectionData.phoneSpecs?.brand || "-"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Model:</span>
                          <span className="font-medium ml-2">{inspectionData.phoneSpecs?.model || "-"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Grade:</span>
                          <span className="font-medium ml-2">Grade {inspectionData.grade || "-"}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Defects:</span>
                          <span className="font-medium ml-2 text-red-600">
                            {inspectionData.defects?.length > 0 ? inspectionData.defects.join(", ") : "None"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-astora-black mb-4">
                <Camera className="inline mr-2 text-astora-red" />
                Image Capture
              </h3>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <CloudUpload className="text-4xl text-gray-400 mb-4 mx-auto" />
                  <p className="text-gray-600 mb-4">Drop images here or click to upload</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="bg-astora-red hover:bg-astora-dark-red text-white"
                  >
                    <CloudUpload className="w-4 h-4 mr-2" />
                    Add Images
                  </Button>
                </div>
                
                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Selected Images</h4>
                    <div className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="text-sm text-gray-600 flex justify-between">
                          <span>{file.name}</span>
                          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Upload Progress */}
                {uploading && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Uploading to DigitalOcean Spaces...</span>
                        <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-astora-red h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          <Button
            onClick={handleCompleteInspection}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-semibold"
            disabled={completeInspection.isPending || !inspectionData}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {completeInspection.isPending ? "Completing..." : "Complete Inspection"}
          </Button>
          <Button
            onClick={handleUploadImages}
            className="bg-astora-red hover:bg-astora-dark-red text-white px-8 py-3 font-semibold"
            disabled={uploadImages.isPending || selectedFiles.length === 0 || !inspectionData}
          >
            <Save className="w-4 h-4 mr-2" />
            {uploadImages.isPending ? "Uploading..." : "Save Photos"}
          </Button>
        </div>
      </div>
    </div>
  );
}
