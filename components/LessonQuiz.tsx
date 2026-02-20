
import React, { useState } from 'react';
import { UNITS, ACTIVITIES } from '../constants';
import { LogEntry } from '../types';
import { BrainCircuit, Trophy, CheckCircle2, Info, FileSpreadsheet, Download } from 'lucide-react';

interface LessonQuizProps {
  onAddEntry: (entry: LogEntry) => void;
  entries: LogEntry[];
}

export const LessonQuiz: React.FC<LessonQuizProps> = ({ onAddEntry, entries }) => {
  const [unitName, setUnitName] = useState(UNITS[0]);
  const [correctAnswers, setCorrectAnswers] = useState(1);
  const [notes, setNotes] = useState('');

  const activity = ACTIVITIES.find(a => a.id === 'lesson_quiz')!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      activityId: 'lesson_quiz',
      points: activity.points * correctAnswers,
      quantity: correctAnswers,
      unitName,
      studentName: 'Unidade (Geral)',
      notes: notes || `Quizz da Lição: ${correctAnswers} acerto(s).`
    };

    onAddEntry(newEntry);
    setCorrectAnswers(1);
    setNotes('');
  };

  const exportQuizCsv = () => {
    const quizEntries = entries.filter(e => e.activityId === 'lesson_quiz');
    
    if (quizEntries.length === 0) {
      alert("Nenhum lançamento de Quizz para exportar.");
      return;
    }

    const headers = ["Data", "Unidade", "Acertos (Quantidade)", "Pontos Ganhos", "Observações"];
    const rows = quizEntries.map(entry => [
      new Date(entry.date).toLocaleDateString('pt-BR'),
      `"${entry.unitName}"`,
      entry.quantity,
      entry.points,
      `"${entry.notes || ''}"`
    ]);

    const csvContent = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_quizz_lesson_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Botão de Exportação Especializada no Topo */}
      <div className="flex justify-end">
        <button 
          onClick={exportQuizCsv}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all font-bold text-sm transform hover:-translate-y-0.5 active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Exportar Relatório do Quizz (CSV)
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-50 rounded-xl">
            <BrainCircuit className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Quizz da Lição</h2>
            <p className="text-slate-500 text-sm font-medium">Lançamento de pontos por acertos semanais</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 mb-8">
          <Info className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800 leading-relaxed">
            Cada acerto no Quizz da Lição garante <strong>100 pontos</strong> para a unidade. 
            Realize as perguntas para os representantes de cada unidade e registre os acertos abaixo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Unidade Competindo</label>
              <select 
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50 text-slate-700 font-bold text-lg"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total de Acertos</label>
              <div className="flex items-center gap-4">
                <input 
                  type="number"
                  min="1"
                  max="50"
                  value={correctAnswers}
                  onChange={(e) => setCorrectAnswers(parseInt(e.target.value) || 0)}
                  className="flex-1 p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none bg-white text-slate-800 font-black text-xl text-center"
                />
                <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 min-w-[140px] text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total de Pontos</div>
                  <div className="text-2xl font-black text-amber-600">
                    +{(correctAnswers * 100).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Observações (Opcional)</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Todas as perguntas acertadas com rapidez!"
              className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50 text-slate-700 min-h-[100px]"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-5 px-8 rounded-2xl transition-all shadow-xl shadow-amber-900/10 flex items-center justify-center gap-3 text-xl transform hover:-translate-y-1 active:scale-95"
          >
            <Trophy className="w-6 h-6" />
            Salvar Pontos do Quizz
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shrink-0">
               <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
               <h4 className="font-bold text-slate-800">Resultado Imediato</h4>
               <p className="text-xs text-slate-500">Os pontos aparecem no ranking logo após o salvamento.</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 shrink-0">
               <Trophy className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
               <h4 className="font-bold text-slate-800">Incentivo ao Estudo</h4>
               <p className="text-xs text-slate-500">Unidades que estudam mais têm melhores resultados no sábado.</p>
            </div>
         </div>
      </div>
    </div>
  );
};
