import jsPDF from "jspdf";

interface NotebookEntry {
  id: string;
  section: string;
  title: string | null;
  content_md: string | null;
  created_at: string;
  exercise_id?: string | null;
  devotional_day_id?: string | null;
}

interface UserProfile {
  name?: string | null;
  email?: string | null;
}

const moodLabels: Record<number, string> = {
  1: "Difícil 😔",
  2: "Cansada 😐",
  3: "Normal 😐",
  4: "Bem 🙂",
  5: "Ótima ✨",
};

const sectionLabels: Record<string, string> = {
  checkin: "Check-in",
  exercise: "Exercício",
  devotional: "Devocional",
  summary: "Resumo",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseCheckinContent(content: string): { mood: number; feeling: string; thought: string; need: string } | null {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function parseExerciseContent(content: string): string[] | null {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function exportNotebookToPdf(entries: NotebookEntry[], profile?: UserProfile): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const colors = {
    primary: [37, 50, 68] as [number, number, number], // #253244
    secondary: [212, 158, 158] as [number, number, number], // #D49E9E
    accent: [104, 42, 12] as [number, number, number], // #682A0C
    muted: [120, 120, 120] as [number, number, number],
    light: [240, 226, 210] as [number, number, number], // #F0E2D2
  };

  // Helper to add new page if needed
  const checkNewPage = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Title page
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 80, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("Meu Caderno", pageWidth / 2, 40, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Jornada Única", pageWidth / 2, 52, { align: "center" });

  yPos = 100;

  // User info
  doc.setTextColor(...colors.primary);
  doc.setFontSize(12);
  if (profile?.name) {
    doc.text(`Aluna: ${profile.name}`, margin, yPos);
    yPos += 8;
  }

  doc.setTextColor(...colors.muted);
  doc.setFontSize(10);
  doc.text(`Exportado em: ${formatDate(new Date().toISOString())}`, margin, yPos);
  yPos += 6;
  doc.text(`Total de registros: ${entries.length}`, margin, yPos);
  yPos += 20;

  // Stats summary
  const checkins = entries.filter(e => e.section === "checkin").length;
  const exercises = entries.filter(e => e.section === "exercise").length;
  const devotionals = entries.filter(e => e.section === "devotional").length;

  doc.setFillColor(...colors.light);
  doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, "F");

  doc.setTextColor(...colors.primary);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  
  const statWidth = contentWidth / 3;
  doc.text(`${checkins}`, margin + statWidth / 2, yPos + 12, { align: "center" });
  doc.text(`${exercises}`, margin + statWidth + statWidth / 2, yPos + 12, { align: "center" });
  doc.text(`${devotionals}`, margin + statWidth * 2 + statWidth / 2, yPos + 12, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colors.muted);
  doc.text("Check-ins", margin + statWidth / 2, yPos + 22, { align: "center" });
  doc.text("Exercícios", margin + statWidth + statWidth / 2, yPos + 22, { align: "center" });
  doc.text("Devocionais", margin + statWidth * 2 + statWidth / 2, yPos + 22, { align: "center" });

  // New page for entries
  doc.addPage();
  yPos = margin;

  // Section header helper
  const addSectionHeader = (title: string) => {
    checkNewPage(20);
    doc.setFillColor(...colors.secondary);
    doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, "F");
    doc.setTextColor(...colors.primary);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 5, yPos + 8);
    yPos += 18;
  };

  // Group entries by section
  const groupedEntries = {
    checkin: entries.filter(e => e.section === "checkin"),
    exercise: entries.filter(e => e.section === "exercise"),
    devotional: entries.filter(e => e.section === "devotional"),
  };

  // Check-ins section
  if (groupedEntries.checkin.length > 0) {
    addSectionHeader("📋 Check-ins Diários");

    groupedEntries.checkin.forEach((entry) => {
      checkNewPage(50);

      // Date
      doc.setTextColor(...colors.muted);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(formatDate(entry.created_at), margin, yPos);
      yPos += 6;

      const checkinData = entry.content_md ? parseCheckinContent(entry.content_md) : null;

      if (checkinData) {
        // Mood
        doc.setTextColor(...colors.primary);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`Humor: ${moodLabels[checkinData.mood] || "Não informado"}`, margin, yPos);
        yPos += 7;

        // Content fields
        const fields = [
          { label: "Sentimento", value: checkinData.feeling },
          { label: "Pensamento", value: checkinData.thought },
          { label: "Necessidade", value: checkinData.need },
        ];

        fields.forEach(({ label, value }) => {
          if (value && value.trim()) {
            checkNewPage(20);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(...colors.accent);
            doc.text(`${label}:`, margin, yPos);
            yPos += 5;

            doc.setFont("helvetica", "normal");
            doc.setTextColor(...colors.primary);
            const lines = doc.splitTextToSize(value, contentWidth);
            doc.text(lines, margin, yPos);
            yPos += lines.length * 4.5 + 3;
          }
        });
      }

      yPos += 8;
      doc.setDrawColor(...colors.light);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
    });
  }

  // Exercises section
  if (groupedEntries.exercise.length > 0) {
    doc.addPage();
    yPos = margin;
    addSectionHeader("📝 Exercícios Completados");

    groupedEntries.exercise.forEach((entry) => {
      checkNewPage(40);

      // Title and date
      doc.setTextColor(...colors.primary);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(entry.title || "Exercício", margin, yPos);
      yPos += 5;

      doc.setTextColor(...colors.muted);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(formatDate(entry.created_at), margin, yPos);
      yPos += 8;

      // Content
      if (entry.content_md) {
        const answers = parseExerciseContent(entry.content_md);
        if (answers) {
          answers.forEach((answer, idx) => {
            if (answer && answer.trim()) {
              checkNewPage(20);
              doc.setFont("helvetica", "bold");
              doc.setFontSize(9);
              doc.setTextColor(...colors.accent);
              doc.text(`Resposta ${idx + 1}:`, margin, yPos);
              yPos += 5;

              doc.setFont("helvetica", "normal");
              doc.setTextColor(...colors.primary);
              const lines = doc.splitTextToSize(answer, contentWidth);
              doc.text(lines, margin, yPos);
              yPos += lines.length * 4.5 + 3;
            }
          });
        } else {
          doc.setTextColor(...colors.primary);
          doc.setFontSize(10);
          const lines = doc.splitTextToSize(entry.content_md, contentWidth);
          doc.text(lines, margin, yPos);
          yPos += lines.length * 4.5;
        }
      }

      yPos += 8;
      doc.setDrawColor(...colors.light);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
    });
  }

  // Devotionals section
  if (groupedEntries.devotional.length > 0) {
    doc.addPage();
    yPos = margin;
    addSectionHeader("🙏 Devocionais");

    groupedEntries.devotional.forEach((entry) => {
      checkNewPage(40);

      // Title and date
      doc.setTextColor(...colors.primary);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(entry.title || "Devocional", margin, yPos);
      yPos += 5;

      doc.setTextColor(...colors.muted);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(formatDate(entry.created_at), margin, yPos);
      yPos += 8;

      // Content
      if (entry.content_md) {
        doc.setTextColor(...colors.primary);
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(entry.content_md, contentWidth);
        doc.text(lines, margin, yPos);
        yPos += lines.length * 4.5;
      }

      yPos += 8;
      doc.setDrawColor(...colors.light);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
    });
  }

  // Footer on last page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setTextColor(...colors.muted);
    doc.setFontSize(8);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text("Jornada Única - Jordana Cantarelli", pageWidth / 2, pageHeight - 5, { align: "center" });
  }

  // Save
  const fileName = `meu-caderno-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
