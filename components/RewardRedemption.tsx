
import React, { useState, useMemo } from 'react';
import { Student, LogEntry, Reward } from '../types';
import { REWARDS, UNITS } from '../constants';
import { Gift, User, Star, CheckCircle, Printer, X, Loader2, AlertCircle } from 'lucide-react';

interface RewardRedemptionProps {
  students: Student[];
  entries: LogEntry[];
  onAddEntry: (entry: LogEntry) => void;
}

interface LastRedemption {
  id: string;
  student: Student;
  reward: Reward;
  date: string;
  previousBalance: number;
  newBalance: number;
}

// Utilitário para gerar ID único caso o crypto.randomUUID falhe
const generateSafeId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return `red-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
};

export const RewardRedemption: React.FC<RewardRedemptionProps> = ({ students, entries, onAddEntry }) => {
  const [selectedUnit, setSelectedUnit] = useState(UNITS[0]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRedemption, setLastRedemption] = useState<LastRedemption | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.unitName === selectedUnit).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, selectedUnit]);

  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // Cálculo de saldo ultra-robusto com tratamento de tipos
  const studentPoints = useMemo(() => {
    if (!selectedStudent) return 0;
    
    const normalizedName = selectedStudent.name.trim().toLowerCase();
    
    return entries.reduce((sum, e) => {
      // 1. Prioridade absoluta para o ID para garantir precisão
      const isSameId = e.studentId && e.studentId === selectedStudent.id;
      
      // 2. Fallback para Nome + Unidade (para dados legados de CSV ou versões antigas)
      const isSameLegacyInfo = !e.studentId && 
                               e.studentName.trim().toLowerCase() === normalizedName && 
                               e.unitName === selectedStudent.unitName;
      
      if (isSameId || isSameLegacyInfo) {
        return sum + (Number(e.points) || 0);
      }
      return sum;
    }, 0);
  }, [entries, selectedStudent]);

  const handleRedeem = (reward: Reward) => {
    if (!selectedStudent) {
      alert("Por favor, selecione um participante primeiro.");
      return;
    }

    const cost = Number(reward.pointsCost);
    const currentBalance = Number(studentPoints);

    if (currentBalance < cost) {
      alert(`Saldo insuficiente!\n\nSeu saldo: ${currentBalance.toLocaleString()} pts\nCusto do brinde: ${cost.toLocaleString()} pts\n\nFaltam ${ (cost - currentBalance).toLocaleString() } pontos.`);
      return;
    }

    if (window.confirm(`Confirmar resgate de "${reward.name}"?\nIsso debitará ${cost.toLocaleString()} pontos de ${selectedStudent.name}.`)) {
      setIsProcessing(true);
      
      try {
        const now = new Date();
        const redemptionId = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Criar o lançamento de DÉBITO (valor negativo)
        const newEntry: LogEntry = {
          id: generateSafeId(),
          date: now.toISOString(),
          activityId: 'redemption',
          points: -Math.abs(cost), // Garante que seja sempre negativo para subtrair
          quantity: 1,
          unitName: selectedStudent.unitName,
          studentName: selectedStudent.name,
          studentId: selectedStudent.id, 
          notes: `RESGATE: ${reward.name} (Ref: ${redemptionId})`
        };

        // Chama a função global para atualizar o estado e localStorage
        onAddEntry(newEntry);
        
        // Prepara o comprovante para exibição
        setLastRedemption({
          id: redemptionId,
          student: selectedStudent,
          reward,
          date: now.toLocaleString('pt-BR'),
          previousBalance: currentBalance,
          newBalance: currentBalance - cost
        });
        
        // Delay suave para feedback visual de processamento
        setTimeout(() => {
          setIsProcessing(false);
          setShowReceipt(true);
        }, 500);
      } catch (error) {
        console.error("Erro ao processar resgate:", error);
        alert("Ocorreu um erro técnico ao processar o resgate. Tente novamente.");
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt-area, #printable-receipt-area * { visibility: visible; }
          #printable-receipt-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: white !important;
            padding: 40px !important;
            margin: 0 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Modal de Comprovante / Voucher */}
      {showReceipt && lastRedemption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md no-print">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col relative">
            <div className="bg-indigo-950 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">Resgate com Sucesso!</h3>
              </div>
              <button onClick={() => setShowReceipt(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div id="printable-receipt-area" className="p-8 space-y-6 bg-white overflow-y-auto">
              <div className="text-center pb-6 border-b-2 border-slate-100 flex flex-col items-center">
                <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 mb-4" />
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Voucher de Brinde</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Gincana Escola Sabatina Aluno Nota 10</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Protocolo de Segurança</span>
                  <span className="text-sm font-black text-indigo-900">#RED-{lastRedemption.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Participante Beneficiado</p>
                    <p className="text-sm font-black text-slate-800">{lastRedemption.student.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{lastRedemption.student.unitName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Data e Hora</p>
                    <p className="text-sm font-black text-slate-800">{lastRedemption.date}</p>
                  </div>
                </div>
                <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-dashed border-indigo-200 text-center">
                   <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">Item Resgatado</p>
                   <h4 className="text-2xl font-black text-slate-900 leading-tight">{lastRedemption.reward.name}</h4>
                   <p className="text-xs text-slate-500 mt-2">Valor debitado: {lastRedemption.reward.pointsCost.toLocaleString()} pontos</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Saldo Anterior:</span>
                  <span className="text-sm font-bold text-slate-400 line-through">{lastRedemption.previousBalance.toLocaleString()} pts</span>
                </div>
                <div className="text-center pt-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Novo Saldo Disponível</div>
                  <p className="text-2xl font-black text-indigo-600">{lastRedemption.newBalance.toLocaleString()} pts</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col gap-3 no-print">
              <button onClick={() => window.print()} className="w-full bg-indigo-950 hover:bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95">
                <Printer className="w-5 h-5" /> Imprimir Comprovante
              </button>
              <button onClick={() => setShowReceipt(false)} className="w-full bg-white border border-slate-200 text-slate-500 font-bold py-3 rounded-2xl hover:bg-slate-100 text-sm">
                Fechar Janela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interface Principal de Seleção */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 no-print">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-indigo-50 rounded-2xl">
            <Gift className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Troca de Brindes</h2>
            <p className="text-slate-500 text-sm font-medium">Recompense o esforço e a dedicação dos alunos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Unidade / Classe</label>
            <select 
              value={selectedUnit}
              onChange={(e) => { setSelectedUnit(e.target.value); setSelectedStudentId(''); }}
              className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none bg-slate-50 font-bold transition-all"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Quem vai resgatar?</label>
            <select 
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none bg-slate-50 font-bold transition-all"
              disabled={filteredStudents.length === 0}
            >
              <option value="">Selecione o participante...</option>
              {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {selectedStudent ? (
          <div className="p-8 bg-indigo-950 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between shadow-xl animate-in slide-in-from-top-4 duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Star className="w-48 h-48 rotate-12" />
            </div>
            <div className="relative z-10 text-center md:text-left mb-4 md:mb-0">
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Saldo Atual de {selectedStudent.name}</p>
              <h3 className="text-5xl font-black tabular-nums">
                {studentPoints.toLocaleString()} 
                <span className="text-sm text-indigo-400 uppercase ml-2 tracking-widest font-bold">pts</span>
              </h3>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
               </div>
               <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Saldo Disponível</span>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
             <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
             <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Selecione um participante para ver o saldo</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 no-print pb-12">
        {REWARDS.map((reward) => {
          const cost = Number(reward.pointsCost);
          const canAfford = selectedStudentId && studentPoints >= cost;
          
          return (
            <div key={reward.id} className={`bg-white rounded-[2.5rem] shadow-sm border-2 transition-all duration-300 flex flex-col overflow-hidden ${canAfford ? 'border-slate-100 hover:border-indigo-600 hover:shadow-2xl hover:-translate-y-1' : 'border-slate-50 opacity-60'}`}>
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl transition-colors ${canAfford ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}>
                    <Gift className="w-8 h-8" />
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border-2 transition-all ${canAfford ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-slate-100 text-slate-400 bg-slate-50'}`}>
                    {cost.toLocaleString()} PONTOS
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{reward.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{reward.description}</p>
              </div>
              
              <div className="p-6 bg-slate-50/50 border-t border-slate-100 mt-auto">
                {!selectedStudentId ? (
                  <div className="text-center text-[10px] font-black text-slate-400 py-3 bg-slate-100 rounded-xl">
                    AGUARDANDO SELEÇÃO
                  </div>
                ) : canAfford ? (
                  <button 
                    onClick={() => handleRedeem(reward)}
                    disabled={isProcessing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Resgate'}
                  </button>
                ) : (
                  <div className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-2xl text-center text-xs flex items-center justify-center gap-2 border border-red-100">
                    <AlertCircle className="w-4 h-4" />
                    Faltam {(cost - studentPoints).toLocaleString()} pts
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
