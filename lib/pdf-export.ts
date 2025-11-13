// PDF Export utilities for GridPulse reports
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DashboardDataResponse, TransformerRealtimeMetrics } from '@/types/dashboard';

/**
 * Generate Meralco Grid Health Report PDF
 */
export function generateGridHealthReport(data: DashboardDataResponse) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFillColor(249, 115, 22); // Orange-500
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('GridPulse', 14, 15);
  
  doc.setFontSize(16);
  doc.text('Grid Health Report', 14, 25);
  
  // Report metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`City: ${data.city}`, pageWidth - 14, 15, { align: 'right' });
  doc.text(`Generated: ${new Date(data.updatedAt).toLocaleString()}`, pageWidth - 14, 20, { align: 'right' });
  doc.text(`Report Period: Last 24 Hours`, pageWidth - 14, 25, { align: 'right' });
  
  let yPos = 45;
  
  // Executive Summary Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', 14, yPos);
  yPos += 8;
  
  // Summary boxes
  const summaryData = [
    ['BGHI Score', data.summary.bghiScore.toFixed(1), data.summary.status],
    ['Total Transformers', data.summary.totalTransformers.toString(), 'Active'],
    ['Average Load', `${data.summary.averageLoadPct.toFixed(1)}%`, 'Capacity'],
    ['Weather', `${data.weather.temperature.toFixed(1)}°C`, data.weather.condition],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value', 'Status']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Critical Status Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('GRID STATUS OVERVIEW', 14, yPos);
  yPos += 8;
  
  const statusData = [
    ['Critical Transformers', data.summary.criticalTransformers.toString(), 'Requires immediate attention'],
    ['Warning Transformers', data.summary.warningTransformers.toString(), 'Monitor closely'],
    ['Anomalies (24h)', data.summary.anomalyCount24h.toString(), 'Events detected'],
    ['Active Alerts', data.summary.alertsCount.toString(), 'Overload predictions'],
  ];
  
  autoTable(doc, {
    startY: yPos,
    body: statusData,
    theme: 'striped',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { halign: 'center', cellWidth: 30 },
      2: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Check if we need a new page
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  // Transformer Details Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSFORMER STATUS', 14, yPos);
  yPos += 8;
  
  // Sort transformers by load percentage (highest first)
  const sortedTransformers = [...data.transformers]
    .sort((a, b) => b.loadPercentage - a.loadPercentage)
    .slice(0, 15); // Top 15 transformers
  
  const transformerData = sortedTransformers.map(t => [
    t.transformer.ID,
    `${t.currentLoadKw.toFixed(1)} kW`,
    `${t.loadPercentage.toFixed(1)}%`,
    t.bghi.status,
    t.transformer.NumDownstreamBuildings?.toString() || 'N/A',
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Transformer', 'Load', 'Capacity', 'Status', 'Buildings']],
    body: transformerData,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { halign: 'right', cellWidth: 30 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'center', cellWidth: 30 },
      4: { halign: 'center', cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      // Color code status column
      if (data.column.index === 3 && data.section === 'body') {
        const status = data.cell.text[0];
        if (status === 'Critical') {
          data.cell.styles.textColor = [239, 68, 68]; // Red
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'Warning') {
          data.cell.styles.textColor = [245, 158, 11]; // Amber
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [34, 197, 94]; // Green
        }
      }
    },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Check if we need a new page for alerts
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  }
  
  // Critical Alerts Section
  if (data.alerts.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CRITICAL ALERTS', 14, yPos);
    yPos += 8;
    
    const alertData = data.alerts.slice(0, 10).map(a => [
      a.transformerName,
      a.alert.confidence > 0.8 ? 'High' : a.alert.confidence > 0.6 ? 'Medium' : 'Low',
      `+${a.alert.hoursAhead}h`,
      `${(a.alert.riskRatio * 100).toFixed(0)}%`,
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Transformer', 'Severity', 'Time', 'Peak Load']],
      body: alertData,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { halign: 'center', cellWidth: 40 },
        2: { halign: 'center', cellWidth: 30 },
        3: { halign: 'right', cellWidth: 40 },
      },
      margin: { left: 14, right: 14 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Anomalies Section
  if (data.anomalies.length > 0) {
    // Check if we need a new page
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ANOMALY REPORT (24H)', 14, yPos);
    yPos += 8;
    
    // Count anomaly types
    const anomalyTypes = data.anomalies.reduce((acc, a) => {
      acc[a.anomalyType] = (acc[a.anomalyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const anomalyData = Object.entries(anomalyTypes).map(([type, count]) => [
      type,
      count.toString(),
      'Detected',
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Anomaly Type', 'Count', 'Status']],
      body: anomalyData,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Recommendations Section
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMMENDATIONS', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const recommendations: string[] = [];
  
  if (data.summary.criticalTransformers > 0) {
    recommendations.push(`• Schedule immediate maintenance for ${data.summary.criticalTransformers} critical transformer(s)`);
  }
  
  if (data.summary.warningTransformers > 3) {
    recommendations.push('• Consider load balancing across transformers in warning state');
  }
  
  if (data.alerts.length > 0) {
    const nearestAlert = data.alerts[0];
    recommendations.push(`• Prepare for predicted overload at ${nearestAlert.transformerName} in ${nearestAlert.alert.hoursAhead} hours`);
  }
  
  if (data.summary.anomalyCount24h > 5) {
    recommendations.push(`• Investigate ${data.summary.anomalyCount24h} anomalies detected in last 24 hours`);
  }
  
  if (data.weather.condition === 'Rainy') {
    recommendations.push('• Monitor for weather-related power fluctuations');
  }
  
  if (data.summary.averageLoadPct > 75) {
    recommendations.push('• Average grid load is high - consider infrastructure expansion');
  }
  
  recommendations.forEach(rec => {
    doc.text(rec, 14, yPos, { maxWidth: pageWidth - 28 });
    yPos += 7;
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `GridPulse Grid Health Report | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  const filename = `GridPulse_Report_${data.city}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Generate Barangay Transformer Report PDF
 */
export function generateBarangayReport(data: DashboardDataResponse, barangay: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(249, 115, 22);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('GridPulse', 14, 15);
  
  doc.setFontSize(16);
  doc.text(`Barangay ${barangay} Report`, 14, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 20, { align: 'right' });
  
  let yPos = 45;
  
  // Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BARANGAY OVERVIEW', 14, yPos);
  yPos += 8;
  
  const summaryData = [
    ['BGHI Score', data.summary.bghiScore.toFixed(1)],
    ['Transformers', data.summary.totalTransformers.toString()],
    ['Average Load', `${data.summary.averageLoadPct.toFixed(1)}%`],
    ['Critical Status', data.summary.criticalTransformers.toString()],
  ];
  
  autoTable(doc, {
    startY: yPos,
    body: summaryData,
    theme: 'striped',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { halign: 'right', cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Transformer details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSFORMER DETAILS', 14, yPos);
  yPos += 8;
  
  const transformerData = data.transformers.map(t => [
    t.transformer.ID,
    `${t.currentLoadKw.toFixed(1)} kW`,
    `${t.loadPercentage.toFixed(1)}%`,
    t.bghi.status,
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['ID', 'Load', 'Capacity', 'Status']],
    body: transformerData,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });
  
  const filename = `Barangay_${barangay}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
