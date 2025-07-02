import { spawn } from 'child_process';
import path from 'path';
import { storage } from '../storage';
import { uploadReportToSpaces } from './storage-service';

export async function generateExcelReport(orderId: number): Promise<string> {
  try {
    // Get order and inspection data
    const order = await storage.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    const inspections = await storage.getInspectionsByOrder(orderId);
    
    // Prepare data for Python script
    const reportData = {
      order: order,
      inspections: inspections,
      timestamp: new Date().toISOString(),
    };
    
    // Generate unique filename
    const filename = `astora-report-${order.orderNumber}-${Date.now()}.xlsx`;
    const outputPath = path.join(process.cwd(), 'temp', filename);
    
    // Create Python script arguments
    const pythonScript = path.join(process.cwd(), 'scripts', 'generate_excel.py');
    const dataJsonPath = path.join(process.cwd(), 'temp', `data-${Date.now()}.json`);
    
    // Write data to temporary JSON file
    const fs = require('fs');
    if (!fs.existsSync(path.dirname(dataJsonPath))) {
      fs.mkdirSync(path.dirname(dataJsonPath), { recursive: true });
    }
    fs.writeFileSync(dataJsonPath, JSON.stringify(reportData, null, 2));
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [pythonScript, dataJsonPath, outputPath]);
      
      pythonProcess.stdout.on('data', (data) => {
        console.log(`Python stdout: ${data}`);
      });
      
      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
      });
      
      pythonProcess.on('close', async (code) => {
        // Clean up temporary JSON file
        fs.unlinkSync(dataJsonPath);
        
        if (code !== 0) {
          reject(new Error(`Python script exited with code ${code}`));
          return;
        }
        
        try {
          // Upload to DigitalOcean Spaces
          const reportUrl = await uploadReportToSpaces(outputPath, filename);
          resolve(reportUrl);
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Generate Excel report error:', error);
    throw error;
  }
}
