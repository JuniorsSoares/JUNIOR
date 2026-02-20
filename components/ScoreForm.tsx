
import React, { useState, useEffect } from 'react';
import { ACTIVITIES, UNITS } from '../constants';
import { LogEntry, Student } from '../types';
import { CheckCircle2, PlusCircle } from 'lucide-react';

interface ScoreFormProps {
  onAddEntry: (entry: LogEntry) => void;
  students: Student[];
  onComplete?: () => void;
}

export const ScoreForm: React.FC<ScoreFormProps> = ({ onAddEntry, students, onComplete }) => {
  const [activityId, setActivityId] = useState(ACTIVITIES[0].id);
  const [unitName, setUnitName] = useState(UNITS[0]);
  const [studentId, setStudentId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const filteredStudents = students.filter(s => s.unitName === unitName);

  useEffect(() => {
    if (filteredStudents.length > 0) {
      setStudentId(filteredStudents[0].id);
    } else {
      setStudentId('');
    }
  }, [unitName, students]);

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const activity = ACTIVITIES.find(a => a.id === activityId);
    const student = students.find(s => s.id === studentId);
    
    if (!activity || !student) {
      if (!student) alert('Por favor, cadastre participantes para esta unidade primeiro.');
      return;
    }

    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      activityId,
      points: activity.points * (activity.multiValue ? quantity : 1),
      quantity: activity.multiValue ? quantity : 1,
      unitName,
      studentName: student.name,
      studentId: student.id, // Adiciona o ID para garantir precisão
      notes
    };

    onAddEntry(newEntry);
    setNotes('');
    setQuantity(1);
    
    if (onComplete) onComplete();
  };

  const selectedActivity = ACTIVITIES.find(a => a.id === activityId);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmitManual} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <PlusCircle className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Lançamento Individual</h2>
        </div>
        
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Unidade / Classe</label>
              <select 
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-slate-700 font-medium"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Participante</label>
              <select 
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-slate-700 font-medium disabled:opacity-50"
                disabled={filteredStudents.length === 0}
              >
                {filteredStudents.length === 0 ? (
                  <option value="">Nenhum participante cadastrado</option>
                ) : (
                  filteredStudents.sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Atividade Realizada</label>
            <select 
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 text-slate-700 font-medium"
            >
              {ACTIVITIES.map(a => (
                <option key={a.id} value={a.id}>
                  {a.label} (+{a.points} pts)
                </option>
              ))}
            </select>
          </div>

          {selectedActivity?.multiValue && (
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Quantidade de Itens / Doações</label>
              <input 
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full p-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-indigo-900 font-bold"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Observações Extras (Opcional)</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 bg-slate-50 text-slate-700"
              placeholder="Detalhes sobre a visita, atividade ou doação..."
            />
          </div>

          <button 
            type="submit"
            disabled={filteredStudents.length === 0}
            className={`w-full font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-lg ${
              filteredStudents.length === 0 
              ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:-translate-y-0.5 active:scale-95'
            }`}
          >
            <CheckCircle2 className="w-6 h-6" />
            {filteredStudents.length === 0 ? 'Cadastre alunos primeiro' : 'Salvar Lançamento'}
          </button>
        </div>
      </form>
    </div>
  );
};
