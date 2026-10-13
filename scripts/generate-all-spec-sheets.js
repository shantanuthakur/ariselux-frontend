// Script to generate high-resolution professional PDF Technical Specification Sheets
// for all Ariselux Light Towers based on official factory specification images and technical data.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { productsData } from '../src/products-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '../public/spec-sheets');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Convert logo to base64 if available
const logoPath = path.join(__dirname, '../public/images/logo.png');
let logoBase64 = null;
if (fs.existsSync(logoPath)) {
  const logoBuffer = fs.readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
}

// Function to generate PDF for a given product
function generateSpecPdf(product) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryNavy = [11, 27, 61];      // #0B1B3D
  const accentBlue = [13, 91, 255];      // #0D5BFF
  const darkSlate = [30, 41, 59];        // #1E293B
  const textMuted = [100, 116, 139];     // #64748B
  const cardBg = [248, 250, 252];        // #F8FAFC
  const borderLight = [226, 232, 240];   // #E2E8F0

  // ── HEADER ──
  // Top deep navy accent bar
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Ariselux Logo or text
  if (logoBase64) {
    try {
      // Logo dimensions: 40mm x 8.5mm approx
      doc.addImage(logoBase64, 'PNG', margin, 5.5, 38, 8.5);
    } catch (e) {
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('ARISELUX', margin, 12);
    }
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('ARISELUX', margin, 12);
  }

  // Header Subtitle & Factory Compliance
  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('HEAVY-DUTY MOBILE LIGHTING TOWERS & ENGINEERING EQUIPMENT', margin, 19);
  doc.text('MANUFACTURING COMPLIANCE: ISO 9001:2015 | CE CONFORMITY | CPCB / BIS APPROVED', margin, 23);

  // Document Type Banner (Right Side)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('TECHNICAL SPECIFICATION SHEET', pageWidth - margin, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(190, 210, 240);
  const docRef = product.specSheetData?.docRef || `ALX-TSS-${product.id.toUpperCase()}`;
  doc.text(`DOC REF: ${docRef} | REV: 2026.1 | DATE: OCT 2026`, pageWidth - margin, 18, { align: 'right' });
  doc.text('CLASSIFICATION: OFFICIAL FACTORY DATA SHEET', pageWidth - margin, 23, { align: 'right' });

  // ── MODEL TITLE & CATEGORY BAR ──
  let curY = 34;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryNavy);
  doc.text(product.title, margin, curY);

  // Category Badge (Right Side)
  const catText = (product.categoryName || 'LIGHT TOWER').toUpperCase();
  doc.setFontSize(8.5);
  const badgeWidth = doc.getTextWidth(catText) + 8;
  doc.setFillColor(...accentBlue);
  doc.roundedRect(pageWidth - margin - badgeWidth, curY - 5.5, badgeWidth, 7, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(catText, pageWidth - margin - (badgeWidth / 2), curY - 1, { align: 'center' });

  // Tagline / Brief Description
  curY += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...textMuted);
  const tagline = product.tagline || product.description?.slice(0, 110) + '...';
  doc.text(tagline, margin, curY);

  // ── 4 QUICK METRICS BOXES ──
  curY += 5;
  const numCards = 4;
  const gap = 3.5;
  const cardWidth = (contentWidth - gap * (numCards - 1)) / numCards;
  const cardHeight = 15;

  const quickItems = [
    { label: 'MAST HEIGHT', val: product.quickSpecs?.mastHeight?.value || 'N/A' },
    { label: 'LIGHT / LUMENS', val: product.quickSpecs?.light?.value || 'N/A' },
    { label: 'POWER / RUNTIME', val: product.quickSpecs?.runtime?.value || 'N/A' },
    { label: 'COVERAGE AREA', val: product.quickSpecs?.coverage?.value || 'N/A' }
  ];

  quickItems.forEach((item, idx) => {
    const x = margin + idx * (cardWidth + gap);
    doc.setFillColor(...cardBg);
    doc.setDrawColor(...borderLight);
    doc.roundedRect(x, curY, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...textMuted);
    doc.text(item.label, x + cardWidth / 2, curY + 4.5, { align: 'center' });

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryNavy);
    const shortVal = item.val.length > 28 ? item.val.slice(0, 26) + '...' : item.val;
    doc.text(shortVal, x + cardWidth / 2, curY + 10.5, { align: 'center' });
  });

  curY += cardHeight + 4;

  // ── STRUCTURED SPECIFICATION TABLES ──
  // Extract or build sections
  let sections = product.specSheetData?.sections;
  if (!sections || sections.length === 0) {
    // Fallback: build from tableSpecs & features
    const tableItem = product.tableSpecs?.[0] || {};
    sections = [
      {
        category: 'Power & Drive System',
        items: [
          { name: 'Engine / Power Source', value: tableItem.engine || 'Standard Industrial Unit' },
          { name: 'Alternator / Generator', value: tableItem.generator || 'Heavy Duty Industrial' },
          { name: 'Fuel / Energy Storage', value: tableItem.tankSize || 'Optimized Capacity' }
        ]
      },
      {
        category: 'Lighting System & Optics',
        items: [
          { name: 'Lamp Array & Lumens', value: product.quickSpecs?.light?.value || 'High Efficiency LED' },
          { name: 'Area Illumination Coverage', value: product.quickSpecs?.coverage?.value || 'Industrial Footprint' }
        ]
      },
      {
        category: 'Mast & Tower Specifications',
        items: [
          { name: 'Maximum Mast Height', value: product.quickSpecs?.mastHeight?.value || 'Heavy Duty Telescopic' },
          { name: 'Mast Rotation', value: '359° Manual Rotation with Safety Lock' }
        ]
      },
      {
        category: 'Dimensions & Logistics',
        items: [
          { name: 'Operational & Travel Dimensions', value: tableItem.dimensions || 'Standard Road Towable' },
          { name: 'Total Gross Weight', value: tableItem.weight || 'Engineered Lightweight' }
        ]
      }
    ];
  }

  // Flatten sections into tables or build a clean table for each category
  sections.forEach((sec, sIdx) => {
    const tableRows = sec.items.map(item => [item.name, item.value]);

    autoTable(doc, {
      startY: curY,
      margin: { left: margin, right: margin },
      head: [[sec.category.toUpperCase(), 'TECHNICAL SPECIFICATION DETAILS']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: primaryNavy,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: 1.8
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 1.6,
        lineColor: borderLight,
        textColor: darkSlate
      },
      columnStyles: {
        0: { cellWidth: 54, fontStyle: 'bold', textColor: [15, 23, 42] },
        1: { cellWidth: contentWidth - 54 }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      pageBreak: 'auto',
      didDrawPage: (data) => {
        // Draw page footer on each page
        drawFooter(doc, pageWidth, pageHeight, margin, product);
      }
    });

    curY = doc.lastAutoTable.finalY + 3.5;
  });

  // Key Features & Inclusions note if space permits
  if (product.features && product.features.length > 0) {
    if (curY > pageHeight - 38) {
      doc.addPage();
      curY = 20;
    }

    autoTable(doc, {
      startY: curY,
      margin: { left: margin, right: margin },
      head: [['KEY ENGINEERING HIGHLIGHTS & COMPLIANCE']],
      body: product.features.map(f => [`• ${f}`]),
      theme: 'plain',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: 1.8
      },
      bodyStyles: {
        fontSize: 6.8,
        cellPadding: 1.4,
        textColor: darkSlate
      },
      didDrawPage: () => {
        drawFooter(doc, pageWidth, pageHeight, margin, product);
      }
    });
  }

  // Ensure footer is rendered on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, pageWidth, pageHeight, margin, product, i, totalPages);
  }

  return doc;
}

function drawFooter(doc, pageWidth, pageHeight, margin, product, pageNum = 1, totalPages = 1) {
  const footerY = pageHeight - 11;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);

  // Left
  doc.text('ARISELUX EQUIPMENTS | Factory Support & Technical Inquiries: info@ariselux.com | Web: www.ariselux.com', margin, footerY + 1.5);
  doc.text('© 2026 Ariselux Equipments. Technical specifications subject to continuous engineering innovation without notice.', margin, footerY + 5);

  // Right: Page number
  if (totalPages > 1) {
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY + 1.5, { align: 'right' });
  } else {
    doc.text('Official Technical Specification', pageWidth - margin, footerY + 1.5, { align: 'right' });
  }
}

// Generate for all products in productsData
console.log('Generating PDF specification sheets for all products...');
let count = 0;

for (const [key, prod] of Object.entries(productsData)) {
  try {
    const doc = generateSpecPdf(prod);
    const fileName = `${prod.id}-spec-sheet.pdf`;
    const filePath = path.join(outputDir, fileName);
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(filePath, pdfBuffer);
    count++;
    console.log(`✓ Generated: ${fileName} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`✗ Error generating spec for ${key}:`, err);
  }
}

console.log(`\nSuccessfully generated ${count} specification sheets in ${outputDir}`);
