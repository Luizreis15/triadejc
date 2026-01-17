import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Printer } from "lucide-react";

interface DownloadCardProps {
  title: string;
  description?: string;
  fileUrl?: string | null;
  onDownload: () => void;
  onPrint?: () => void;
}

export function DownloadCard({ 
  title, 
  description, 
  fileUrl,
  onDownload, 
  onPrint 
}: DownloadCardProps) {
  const handleDownload = () => {
    if (fileUrl && fileUrl !== "[LINK]") {
      window.open(fileUrl, "_blank");
    }
    onDownload();
  };

  const handlePrint = () => {
    if (fileUrl && fileUrl !== "[LINK]") {
      // Open in new window for printing
      const printWindow = window.open(fileUrl, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
    onPrint?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="elevated" className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Ícone PDF */}
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-destructive" />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground mb-1">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-muted-foreground mb-3">
                  {description}
                </p>
              )}
              
              {/* Botões */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                
                {onPrint && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
