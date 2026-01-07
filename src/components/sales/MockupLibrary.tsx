import { Copy, Heart, Filter } from "lucide-react";

const mockItems = [
  {
    title: "Carrossel de Contraste",
    stage: "Topo",
    stageColor: "bg-green-500",
    content: "Você faz X, mas quer Y. A maioria comete o erro de...",
    tags: ["Consciência", "Posicionamento"],
  },
  {
    title: "Autoridade Silenciosa",
    stage: "Meio",
    stageColor: "bg-red-700",
    content: "3 coisas que eu faria diferente se começasse hoje no Instagram...",
    tags: ["Autoridade", "Conexão"],
  },
  {
    title: "Venda com Critério",
    stage: "Fundo",
    stageColor: "bg-amber-700",
    content: "Se você está lendo isso, provavelmente já...",
    tags: ["Venda", "Conversão"],
  },
];

export function MockupLibrary() {
  return (
    <div className="relative mx-auto max-w-[280px] animate-fade-in-up">
      {/* Phone Frame */}
      <div className="rounded-[2rem] bg-gray-900 p-2 shadow-2xl">
        <div className="rounded-[1.5rem] bg-[#F5F0EB] overflow-hidden">
          {/* Status Bar */}
          <div className="h-6 bg-[#F5F0EB] flex items-center justify-center">
            <div className="w-20 h-5 rounded-full bg-gray-900" />
          </div>
          
          {/* Content */}
          <div className="px-3 py-3 min-h-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-serif font-bold text-gray-900">
                Biblioteca
              </h1>
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-200 text-xs text-gray-700">
                <Filter className="h-3 w-3" />
                Filtros
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-200/60 rounded-lg p-1 mb-4">
              <div className="flex-1 py-1.5 text-center text-xs font-medium bg-white rounded-md shadow-sm text-gray-900">
                Modelos
              </div>
              <div className="flex-1 py-1.5 text-center text-xs text-gray-500">
                Ganchos
              </div>
              <div className="flex-1 py-1.5 text-center text-xs text-gray-500">
                CTAs
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-2.5">
              {mockItems.map((item, i) => (
                <div 
                  key={i}
                  className="bg-white rounded-xl p-3 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif font-semibold text-sm text-gray-900 leading-tight">
                      {item.title}
                    </h3>
                    <span className={`${item.stageColor} text-white text-[10px] px-2 py-0.5 rounded-full font-medium`}>
                      {item.stage}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-gray-500 mb-2 line-clamp-2">
                    {item.content}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-1.5">
                    <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-[10px] text-gray-700">
                      <Copy className="h-2.5 w-2.5" />
                      Copiar
                    </button>
                    <button className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded">
                      <Heart className="h-2.5 w-2.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
