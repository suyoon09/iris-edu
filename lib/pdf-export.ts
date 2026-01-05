"use client";

// PDF Export utility using browser print functionality
// This is more reliable than html2pdf.js for complex layouts

export interface PDFExportOptions {
    filename: string;
    title: string;
}

export function exportToPDF(elementId: string, options: PDFExportOptions) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found`);
        return;
    }

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        alert('팝업이 차단되었습니다. 팝업을 허용해주세요.');
        return;
    }

    // Setup the print document with Korean-optimized styles
    printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${options.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          padding: 40px;
          background: white;
        }
        
        h1, h2, h3, h4 {
          margin-bottom: 12px;
          color: #0f172a;
        }
        
        h1 { font-size: 24px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-bottom: 24px; }
        h2 { font-size: 20px; color: #1e40af; margin-top: 24px; }
        h3 { font-size: 18px; color: #1e3a8a; margin-top: 20px; }
        h4 { font-size: 16px; color: #334155; margin-top: 16px; }
        
        p { margin-bottom: 8px; }
        
        ul, ol { margin-left: 20px; margin-bottom: 12px; }
        li { margin-bottom: 4px; }
        
        .section {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .highlight {
          background: #eff6ff;
          padding: 12px;
          border-radius: 8px;
          margin: 12px 0;
        }
        
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .badge-blue { background: #dbeafe; color: #1e40af; }
        .badge-green { background: #dcfce7; color: #166534; }
        .badge-red { background: #fee2e2; color: #991b1b; }
        .badge-amber { background: #fef3c7; color: #92400e; }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
        }
        
        th, td {
          padding: 8px;
          text-align: left;
          border: 1px solid #e2e8f0;
        }
        
        th { background: #f8fafc; font-weight: 600; }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #cbd5e1;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }
        
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <h1>${options.title}</h1>
      ${clone.innerHTML}
      <div class="footer">
        생성일: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} | Iris Edu Consulting
      </div>
    </body>
    </html>
  `);

    printWindow.document.close();

    // Wait for fonts and content to load, then print
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // Don't close immediately - let user save as PDF
    }, 500);
}

// Export student profile to PDF
export function exportStudentProfileToPDF(studentName: string) {
    const profileElement = document.getElementById('student-profile-content');
    if (profileElement) {
        exportToPDF('student-profile-content', {
            filename: `${studentName}_프로필.pdf`,
            title: `${studentName} 학생 프로필`
        });
    }
}

// Export report to PDF
export function exportReportToPDF(studentName: string, reportType: 'analysis' | 'roadmap', reportDate: string) {
    const reportElement = document.getElementById('report-content');
    if (reportElement) {
        const typeLabel = reportType === 'analysis' ? 'AI 분석' : '로드맵';
        exportToPDF('report-content', {
            filename: `${studentName}_${typeLabel}_${reportDate}.pdf`,
            title: `${studentName} - ${typeLabel} 리포트`
        });
    }
}
