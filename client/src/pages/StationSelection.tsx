import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Camera, Check, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function StationSelection() {
  const [, setLocation] = useLocation();
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  // Check for existing order from localStorage
  useEffect(() => {
    const orderNumber = localStorage.getItem("currentOrderNumber");
    if (orderNumber) {
      // Fetch order details to show current context
      fetch(`/api/orders/${orderNumber}`, {
        credentials: 'include'
      })
      .then(res => res.json())
      .then(order => setCurrentOrder(order))
      .catch(err => {
        console.error("Failed to load order:", err);
        localStorage.removeItem("currentOrderNumber");
      });
    }
  }, []);

  const selectStation = (station: "scanning" | "photographing") => {
    // Store the selected station for context
    if (currentOrder) {
      localStorage.setItem("currentOrderId", currentOrder.id.toString());
    }
    setLocation(`/${station}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-astora-black mb-2">Select Inspection Station</h2>
          <p className="text-gray-600">Choose your current workstation to begin inspection</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Scanning Station */}
          <Card 
            className="border-2 hover:border-astora-red transition-colors cursor-pointer transform hover:scale-105 transition-transform"
            onClick={() => selectStation("scanning")}
          >
            <CardContent className="p-8 text-center">
              <QrCode className="text-astora-red text-6xl mb-4 mx-auto" />
              <h3 className="text-2xl font-bold text-astora-black mb-4">Scanning Station</h3>
              <p className="text-gray-600 mb-6">Scan IMEI numbers and document defects</p>
              
              <ul className="text-left text-gray-600 space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="text-green-500 mr-2 w-4 h-4" />
                  IMEI scanning
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-2 w-4 h-4" />
                  Phone specification lookup
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-2 w-4 h-4" />
                  Defect documentation
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-2 w-4 h-4" />
                  Initial inspection data
                </li>
              </ul>
              
              <Button className="w-full bg-astora-red hover:bg-astora-dark-red text-white font-semibold">
                Select Scanning Station
              </Button>
            </CardContent>
          </Card>
          
          {/* Photographing Station */}
          <Card 
            className="border-2 hover:border-astora-red transition-colors cursor-pointer transform hover:scale-105 transition-transform"
            onClick={() => selectStation("photographing")}
          >
            <CardContent className="p-8 text-center">
              <Camera className="text-astora-red text-6xl mb-4 mx-auto" />
              <h3 className="text-2xl font-bold text-astora-black mb-4">Photographing Station</h3>
              <p className="text-gray-600 mb-6">Capture high-quality images of inspected phones</p>
              
              <ul className="text-left text-gray-600 space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="text-green-500 mr-2 w-4 h-4" />
                  IMEI re-scanning
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-2 w-4 h-4" />
                  Image capture
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-2 w-4 h-4" />
                  Cloud storage upload
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-2 w-4 h-4" />
                  Final inspection completion
                </li>
              </ul>
              
              <Button className="w-full bg-astora-red hover:bg-astora-dark-red text-white font-semibold">
                Select Photo Station
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
