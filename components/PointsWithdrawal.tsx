
import React, { useState, useMemo } from 'react';
import { Student, LogEntry } from '../types';
import { UNITS } from '../constants';
import { 
  MinusCircle, 
  User, 
  ArrowRight, 
  ShieldAlert, 
  Search, 
  TrendingDown, 
  Check, 
  History,
  Calculator,
  AlertTriangle
} from 'lucide-react';

interface PointsWithdrawalProps {
  students: Student[];
  entries: LogEntry[];
  onAddEntry: (entry: LogEntry) => void;
  onComplete?: () => void;
}

export const PointsWithdrawal: React.FC<PointsWithdrawalProps> = ({ students, entries, onAddEntry }) => {
  const [selectedUnit, setSelectedUnit] = useState(UNITS[0]);
  const [targetStudentId, setTargetStudentId] = useState<string | null>(null);
  const [pointsToRemove, setPointsToRemove] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Encontra o objeto do aluno selecionado
  const targetStudent = useMemo(() => {
    return students.find(s => s.id === targetStudentId) || null;
  }, [students, targetStudentId]);

  // FUNÇÃO CRÍTICA: Calcula o saldo real de um aluno considerando TODOS os lançamentos (positivos e negativos)
  const calculateStudentBalance = (student: Student) => {
    return entries.reduce((sum, e) => {
      const isSameId = e.studentId && e.studentId === student.id;
      const isSameLegacy = !e.studentId && e.studentName === student.name && e.unitName === student.unitName;
      
      if (isSameId || isSameLegacy) {
        return sum + (Number(e.points) || 0);
      }
      return sum;
    }, 0);
  };

  // Lista de alunos com saldos atualizados em tempo real
  const studentsWithBalances = useMemo(() => {
    return students
      .filter(s => s.unitName === selectedUnit)
      .map(student => ({
        ...student,
        balance: calculateStudentBalance(student)
      }))
      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, entries, selectedUnit, searchTerm]);

  // Saldo do aluno focado no formulário
  const currentTargetBalance = targetStudent ? calculateStudentBalance(targetStudent) : 0;
  const finalPredictedBalance = currentTargetBalance - Math.abs(pointsToRemove);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudent || pointsToRemove <= 0 || !reason.trim()) return;

    // Execução do cálculo e criação do log
    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      activityId: 'withdrawal',
      points: -Math.abs(pointsToRemove), // Transforma em valor negativo para a conta fechar
      quantity: 1,
      unitName: targetStudent.unitName,
      studentName: targetStudent.name,
      studentId: targetStudent.id,
      notes: `AJUSTE NEGATIVO: ${reason}`
    };

    onAddEntry(newEntry);
    
    // Feedback visual de que a conta foi feita
    setSuccessAnimation(true);
    setTimeout(() => {
      setSuccessAnimation(false);
      setPointsToRemove(0);
      setReason('');
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex gap-4 items-start shadow-sm">
        <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-1" />
        <div>
          <h3 className="text-red-800 font-bold text-sm uppercase tracking-tight">Módulo de Ajuste de Saldo</h3>
          <p className="text-red-700 text-xs">A retirada de pontos é subtraída automaticamente do total acumulado do participante.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lado Esquerdo: Seletor e Lista (8 colunas) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Unidade</label>
                <select 
                  value={selectedUnit}
                  onChange={(e) => { setSelectedUnit(e.target.value); setTargetStudentId(null); }}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-red-500 outline-none font-bold text-slate-700"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Pesquisar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Nome do aluno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-red-500 outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Participante</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-right tracking-tighter">Saldo Atual</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-right tracking-tighter">Selecionar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {studentsWithBalances.map(s => (
                    <tr key={s.id} className={`hover:bg-red-50/20 transition-all ${targetStudentId === s.id ? 'bg-red-50/50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800 text-sm">{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.role}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-black text-sm transition-all duration-500 ${successAnimation && targetStudentId === s.id ? 'text-emerald-500 scale-110' : 'text-slate-700'}`}>
                          {s.balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => { setTargetStudentId(s.id); setPointsToRemove(0); }}
                          className={`p-2 rounded-xl transition-all ${targetStudentId === s.id ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600'}`}
                        >
                          <MinusCircle className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lado Direito: Formulário e Cálculo (5 colunas) */}
        <div className="lg:col-span-5">
          {targetStudent ? (
            <div className="space-y-6 sticky top-24">
              <form onSubmit={handleWithdraw} className={`bg-white p-8 rounded-[2.5rem] shadow-xl border-t-8 transition-all duration-500 ${successAnimation ? 'border-emerald-500 ring-8 ring-emerald-50' : 'border-red-600'} space-y-6 animate-in zoom-in duration-300`}>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${successAnimation ? 'bg-emerald-100 rotate-[360deg]' : 'bg-red-100'}`}>
                    {successAnimation ? <Check className="w-8 h-8 text-emerald-600" /> : <Calculator className="w-8 h-8 text-red-600" />}
                  </div>
                  <h3 className="text-xl font-black text-slate-800">{targetStudent.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ajuste de Saldo da Unidade</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 p-4 rounded-2xl text-white text-center">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Saldo Antes</p>
                    <p className="text-xl font-black">{currentTargetBalance.toLocaleString()}</p>
                  </div>
                  <div className={`p-4 rounded-2xl text-center border-2 transition-all ${pointsToRemove > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1">Saldo Depois</p>
                    <p className="text-xl font-black">{finalPredictedBalance.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pontos a Retirar</label>
                  <div className="relative">
                    <input 
                      type="number"
                      min="1"
                      value={pointsToRemove || ''}
                      onChange={(e) => setPointsToRemove(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      required
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-500 outline-none font-black text-3xl text-red-600 text-center transition-all"
                    />
                    <TrendingDown className="absolute left-4 top-5 w-6 h-6 text-red-200" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivo / Justificativa</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Descreva o motivo deste ajuste..."
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-500 outline-none min-h-[80px] text-sm font-medium"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={pointsToRemove <= 0 || !reason.trim() || successAnimation}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:shadow-none transform active:scale-95"
                >
                  Confirmar Subtração <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              {/* Mini Histórico do Aluno */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-slate-400" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimos Lançamentos Dele</h4>
                </div>
                <div className="space-y-2">
                  {entries
                    .filter(e => e.studentId === targetStudent.id)
                    .slice(0, 3)
                    .map(e => (
                      <div key={e.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-500 truncate max-w-[150px] font-medium">{e.notes || 'Atividade'}</span>
                        <span className={`font-black ${e.points < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {e.points > 0 ? `+${e.points}` : e.points}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                <Calculator className="w-12 h-12 text-slate-200" />
              </div>
              <h4 className="text-slate-400 font-black uppercase tracking-widest text-sm mb-2">Selecione um Aluno</h4>
              <p className="text-slate-400 text-xs max-w-[220px] leading-relaxed">
                Clique no botão de menos na tabela ao lado para calcular e retirar pontos do saldo.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
