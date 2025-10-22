import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import type { Treatment } from '../types/treatment';

export async function exportToPDF(treatment: Treatment): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(treatment.title, margin, yPosition);
  yPosition += 15;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(treatment.updatedAt).toLocaleDateString(), margin, yPosition);
  yPosition += 15;

  // Chapters
  for (const chapter of treatment.chapters) {
    // Check if we need a new page
    if (yPosition > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPosition = margin;
    }

    // Chapter title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(chapter.title, margin, yPosition);
    yPosition += 10;

    // Chapter content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(chapter.content || '', maxWidth);
    
    for (const line of lines) {
      if (yPosition > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 7;
    }
    
    yPosition += 10;
  }

  doc.save(`${treatment.title}.pdf`);
}

export async function exportToDOCX(treatment: Treatment): Promise<void> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: treatment.title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    })
  );

  // Date
  children.push(
    new Paragraph({
      text: new Date(treatment.updatedAt).toLocaleDateString(),
      spacing: { after: 400 },
    })
  );

  // Chapters
  for (const chapter of treatment.chapters) {
    // Chapter title
    children.push(
      new Paragraph({
        text: chapter.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      })
    );

    // Chapter content
    const paragraphs = (chapter.content || '').split('\n\n');
    paragraphs.forEach(para => {
      if (para.trim()) {
        children.push(
          new Paragraph({
            children: [new TextRun(para.trim())],
            spacing: { after: 200 },
          })
        );
      }
    });
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${treatment.title}.docx`);
}

export function exportToMarkdown(treatment: Treatment): void {
  let markdown = `# ${treatment.title}\n\n`;
  markdown += `*${new Date(treatment.updatedAt).toLocaleDateString()}*\n\n`;
  markdown += '---\n\n';

  for (const chapter of treatment.chapters) {
    markdown += `## ${chapter.title}\n\n`;
    markdown += `${chapter.content || ''}\n\n`;
  }

  const blob = new Blob([markdown], { type: 'text/markdown' });
  saveAs(blob, `${treatment.title}.md`);
}

