#!/usr/bin/env python3
import sys
import json
import pandas as pd
from datetime import datetime
import os

def generate_excel_report(data_json_path, output_path):
    """Generate Excel report from inspection data"""
    
    # Read the JSON data
    with open(data_json_path, 'r') as f:
        data = json.load(f)
    
    order = data['order']
    inspections = data['inspections']
    timestamp = data['timestamp']
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Create Excel writer object
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        
        # Order Summary Sheet
        order_summary = pd.DataFrame([{
            'Order Number': order['orderNumber'],
            'Expected Quantity': order['expectedQuantity'],
            'Status': order['status'],
            'Created Date': order['createdAt'],
            'Report Generated': timestamp,
            'Total Inspections': len(inspections)
        }])
        order_summary.to_excel(writer, sheet_name='Order Summary', index=False)
        
        # Inspections Detail Sheet
        if inspections:
            inspection_details = []
            for inspection in inspections:
                specs = inspection.get('phoneSpecs') or {}
                inspection_details.append({
                    'IMEI': inspection['imei'],
                    'Brand': specs.get('brand', 'Unknown'),
                    'Model': specs.get('model', 'Unknown'),
                    'Storage': specs.get('storage', 'Unknown'),
                    'Grade': inspection.get('grade', 'Not Graded'),
                    'Defects': ', '.join(inspection.get('defects', [])),
                    'Status': inspection['status'],
                    'Notes': inspection.get('notes', ''),
                    'Images Count': len(inspection.get('images', [])),
                    'Scanned At': inspection.get('scannedAt', ''),
                    'Photographed At': inspection.get('photographedAt', ''),
                    'Completed At': inspection.get('completedAt', '')
                })
            
            inspections_df = pd.DataFrame(inspection_details)
            inspections_df.to_excel(writer, sheet_name='Inspections', index=False)
            
            # Grade Distribution Sheet
            if 'grade' in inspections_df.columns:
                grade_dist = inspections_df['grade'].value_counts().reset_index()
                grade_dist.columns = ['Grade', 'Count']
                grade_dist.to_excel(writer, sheet_name='Grade Distribution', index=False)
        
        print(f"Excel report generated successfully: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python generate_excel.py <data_json_path> <output_path>")
        sys.exit(1)
    
    data_json_path = sys.argv[1]
    output_path = sys.argv[2]
    
    try:
        generate_excel_report(data_json_path, output_path)
    except Exception as e:
        print(f"Error generating Excel report: {e}")
        sys.exit(1)