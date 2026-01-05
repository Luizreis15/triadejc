import { Lock, Check, Play } from "lucide-react";

const mockModules = [
  {
    number: 1,
    title: "Fundamentos",
    description: "Entenda a lógica por trás dos carrosséis que vendem",
    status: "completed",
    progress: 100,
  },
  {
    number: 2,
    title: "Formatos Estratégicos",
    description: "Escolha o formato certo para cada objetivo",
    status: "in_progress",
    progress: 60,
  },
  {
    number: 3,
    title: "Estrutura Card a Card",
    description: "Monte carrosséis com ritmo e condução",
    status: "available",
    progress: 0,
  },
  {
    number: 4,
    title: "Headlines Magnéticas",
    description: "Capas que param o dedo e geram clique",
    status: "locked",
    progress: 0,
  },
  {
    number: 5,
    title: "CTAs de Conversão",
    description: "Feche cada post com intenção clara",
    status: "locked",
    progress: 0,
  },
];

function ProgressCircle({ progress, status }: { progress: number; status: string }) {
  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (status === "completed") {
    return (
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
        <Check className="h-5 w-5 text-white" />
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
        <Lock className="h-4 w-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10">
      <svg className="w-10 h-10 -rotate-90">
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="#8B2635"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Play className="h-3.5 w-3.5 text-red-800 fill-red-800 ml-0.5" />
      </div>
    </div>
  );
}

export function MockupModules() {
  const completedCount = mockModules.filter(m => m.status === "completed").length;
  const totalCount = mockModules.length;
  const overallProgress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="relative mx-auto max-w-[280px]">
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
            <h1 className="text-lg font-serif font-bold text-gray-900 mb-3">
              Módulos
            </h1>

            {/* Progress Bar */}
            <div className="flex items-center gap-3 mb-1">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-800 to-red-600 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700">
                {completedCount}/{totalCount}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mb-4">
              {overallProgress}% concluído
            </p>

            {/* Module Cards */}
            <div className="space-y-2">
              {mockModules.map((module) => (
                <div 
                  key={module.number}
                  className={`bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 ${
                    module.status === "locked" ? "opacity-60" : ""
                  }`}
                >
                  <ProgressCircle progress={module.progress} status={module.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-red-800 bg-red-100 px-1.5 py-0.5 rounded">
                        Módulo {module.number}
                      </span>
                    </div>
                    <h3 className="font-serif font-semibold text-sm text-gray-900 leading-tight mt-0.5">
                      {module.title}
                    </h3>
                    <p className="text-[10px] text-gray-500 line-clamp-1">
                      {module.description}
                    </p>
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
