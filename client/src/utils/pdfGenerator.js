

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export const generateRequestPDF = (request) => {
  const doc = new jsPDF()
  
  // Add professional header
  doc.setFillColor(51, 65, 85) // Slate-700
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('LOAD SERVICE REQUEST', 105, 18, { align: 'center' })
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Request Number: ${request.requestNumber}`, 105, 28, { align: 'center' })
  
  // Reset text color
  doc.setTextColor(0, 0, 0)
  
  // Request Information
  let yPos = 50
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Request Information', 14, yPos)
  
  yPos += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const info = [
    ['Request Number:', request.requestNumber],
    ['Status:', request.status],
    ['LSR ID:', request.lsrId],
    ['Route:', request.route || 'N/A'],
    ['Created:', new Date(request.createdAt).toLocaleString()],
    ['Submitted:', request.submittedAt ? new Date(request.submittedAt).toLocaleString() : 'N/A'],
    ['Priority:', request.priority || 'MEDIUM'],
  ]
  
  if (request.decidedAt) {
    info.push(['Decided:', new Date(request.decidedAt).toLocaleString()])
  }
  
  if (request.decisionReason) {
    info.push(['Decision Reason:', request.decisionReason])
  }
  
  info.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, 14, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(String(value), 60, yPos)
    yPos += 7
  })
  
  if (request.notes) {
    yPos += 3
    doc.setFont('helvetica', 'bold')
    doc.text('Notes:', 14, yPos)
    yPos += 7
    doc.setFont('helvetica', 'normal')
    const splitNotes = doc.splitTextToSize(request.notes, 180)
    doc.text(splitNotes, 14, yPos)
    yPos += splitNotes.length * 7
  }
  
  // Commercial Products
  if (request.commercialProducts && request.commercialProducts.length > 0) {
    yPos += 10
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Commercial Products (${request.commercialProducts.length})`, 14, yPos)
    
    yPos += 5
    const productData = request.commercialProducts.map(p => [
      p.name,
      p.sku,
      p.uom,
      p.qty
    ])
    
    autoTable(doc, {
      startY: yPos,
      head: [['Product Name', 'SKU', 'UOM', 'Quantity']],
      body: productData,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 }
    })
    
    yPos = doc.lastAutoTable.finalY + 10
  }
  
  // POSM Items
  if (request.posmItems && request.posmItems.length > 0) {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`POSM Items (${request.posmItems.length})`, 14, yPos)
    
    yPos += 5
    const posmData = request.posmItems.map(p => [
      p.description,
      p.code,
      p.qty
    ])
    
    autoTable(doc, {
      startY: yPos,
      head: [['Description', 'Code', 'Quantity']],
      body: posmData,
      theme: 'striped',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 }
    })
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    )
  }
  
  // Save the PDF
  doc.save(`Request_${request.requestNumber}.pdf`)
}

export const generateMultipleRequestsPDF = (requests) => {
  const doc = new jsPDF()
  
  // Add professional header
  doc.setFillColor(51, 65, 85) // Slate-700
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('LOAD REQUESTS REPORT', 105, 18, { align: 'center' })
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Requests: ${requests.length} | Generated: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' })
  
  // Reset text color
  doc.setTextColor(0, 0, 0)
  
  // Summary table
  let yPos = 50
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Requests Summary', 14, yPos)
  
  yPos += 5
  const summaryData = requests.map(r => [
    r.requestNumber,
    r.lsrId,
    r.status,
    r.route || 'N/A',
    r.commercialProducts.length + r.posmItems.length,
    r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'N/A'
  ])
  
  autoTable(doc, {
    startY: yPos,
    head: [['Request #', 'LSR ID', 'Status', 'Route', 'Items', 'Submitted']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 }
  })
  
  // Start detailed section on new page after summary
  doc.addPage()
  yPos = 20
  
  // Detailed pages for each request - placed back-to-back
  requests.forEach((request, index) => {
    // Check if we need a new page (leave 40mm for footer and spacing)
    // Estimate: header ~15mm, info ~30mm, small table ~20mm = ~65mm minimum
    if (yPos > 220) {
      doc.addPage()
      yPos = 20
    }
    
    // Request separator line (except for first request)
    if (index > 0) {
      doc.setDrawColor(200, 200, 200)
      doc.line(14, yPos - 5, 196, yPos - 5)
      yPos += 5
    }
    
    // Request header (compact, no full-width banner)
    doc.setFillColor(51, 65, 85) // Slate-700
    doc.rect(14, yPos, 182, 10, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Request #${request.requestNumber}`, 20, yPos + 7)
    doc.setFontSize(8)
    doc.text(`(${index + 1} of ${requests.length})`, 190, yPos + 7, { align: 'right' })
    
    doc.setTextColor(0, 0, 0)
    yPos += 15
    
    // Request details (more compact)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    const info = [
      ['Status:', request.status],
      ['LSR:', request.lsrId],
      ['Route:', request.route || 'N/A'],
      ['Submitted:', request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : 'N/A'],
    ]
    
    // Display info in two columns for compactness
    const col1 = info.slice(0, 2)
    const col2 = info.slice(2, 4)
    
    let tempY = yPos
    col1.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, 14, tempY)
      doc.setFont('helvetica', 'normal')
      doc.text(String(value), 35, tempY)
      tempY += 5
    })
    
    tempY = yPos
    col2.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, 105, tempY)
      doc.setFont('helvetica', 'normal')
      doc.text(String(value), 125, tempY)
      tempY += 5
    })
    
    yPos += 12
    
    // Products
    if (request.commercialProducts.length > 0) {
      // Check if table will fit on current page
      const estimatedTableHeight = (request.commercialProducts.length * 5) + 15
      if (yPos + estimatedTableHeight > 270) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`Commercial Products (${request.commercialProducts.length})`, 14, yPos)
      yPos += 3
      
      const productData = request.commercialProducts.map(p => [
        p.name,
        p.sku,
        p.uom,
        p.qty
      ])
      
      autoTable(doc, {
        startY: yPos,
        head: [['Product', 'SKU', 'UOM', 'Qty']],
        body: productData,
        theme: 'striped',
        headStyles: { fillColor: [51, 65, 85], fontSize: 8, fontStyle: 'bold' },
        styles: { fontSize: 7, cellPadding: 2 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 }
      })
      
      yPos = doc.lastAutoTable.finalY + 3
    }
    
    // POSM
    if (request.posmItems.length > 0) {
      // Check if table will fit on current page
      const estimatedTableHeight = (request.posmItems.length * 5) + 15
      if (yPos + estimatedTableHeight > 270) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`POSM Items (${request.posmItems.length})`, 14, yPos)
      yPos += 3
      
      const posmData = request.posmItems.map(p => [
        p.description,
        p.code,
        p.qty
      ])
      
      autoTable(doc, {
        startY: yPos,
        head: [['Description', 'Code', 'Qty']],
        body: posmData,
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105], fontSize: 8, fontStyle: 'bold' },
        styles: { fontSize: 7, cellPadding: 2 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 }
      })
      
      yPos = doc.lastAutoTable.finalY + 3
    }
    
    // Add spacing between requests
    yPos += 8
  })
  
  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    )
  }
  
  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0]
  doc.save(`Load_Requests_${timestamp}.pdf`)
}
