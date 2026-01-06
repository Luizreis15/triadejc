import { 
  Target, 
  Columns3, 
  Users, 
  FileText, 
  Calendar,
  Trophy,
  ChevronRight,
  Plus,
  Check
} from "lucide-react";
import { motion } from "framer-motion";

const sectionItems = [
  {
    icon: Target,
    title: "Minha Promessa",
    description: "O que você promete entregar ao seu público",
    hasContent: true,
  },
  {
    icon: Columns3,
    title: "Meus 3 Pilares",
    description: "Os 3 temas principais do seu conteúdo",
    hasContent: true,
  },
  {
    icon: Users,
    title: "Meu Público",
    description: "Dores, desejos e objeções da sua audiência",
    hasContent: false,
  },
  {
    icon: FileText,
    title: "Meus Rascunhos",
    description: "Carrosséis que você está criando",
    hasContent: false,
  },
  {
    icon: Calendar,
    title: "Meu Calendário",
    description: "O que você postou e vai postar",
    hasContent: false,
  },
];

export function MockupNotebook() {
  return (
    <motion.div 
      className="relative mx-auto max-w-[280px]"
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <div className="rounded-[2rem] bg-gray-900 p-2 shadow-2xl">
        <div className="rounded-[1.5rem] bg-[#F5F0EB] overflow-hidden">
          {/* Status Bar */}
          <div className="h-6 bg-[#F5F0EB] flex items-center justify-center">
            <div className="w-20 h-5 rounded-full bg-gray-900" />
          </div>
          
          {/* Content */}
          <div className="px-3 py-3 min-h-[400px]">
            {/* Header */}
            <h1 className="text-lg font-serif font-bold text-gray-900 mb-1">
              Meu Caderno
            </h1>
            <p className="text-[11px] text-gray-500 mb-4">
              Suas anotações, rascunhos e planejamentos
            </p>

            {/* Quick Action Card */}
            <div className="bg-red-800 text-white rounded-xl p-3 mb-4 flex items-center gap-2.5">
              <Trophy className="h-4 w-4" />
              <div className="flex-1">
                <p className="text-xs font-medium">Registrar resultado</p>
                <p className="text-[10px] opacity-80">Acompanhe suas métricas</p>
              </div>
              <ChevronRight className="h-4 w-4 opacity-80" />
            </div>

            {/* Section Cards */}
            <div className="space-y-2">
              {sectionItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={i}
                    className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-2.5"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.hasContent 
                        ? "bg-green-100 text-green-600" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-sm text-gray-900 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-[10px] text-gray-500 line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {item.hasContent ? (
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                      ) : (
                        <Plus className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
