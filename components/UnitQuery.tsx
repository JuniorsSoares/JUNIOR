
import React, { useState, useMemo } from 'react';
import { UNITS, ACTIVITIES } from '../constants';
import { LogEntry, ActivityCategory } from '../types';
import { Search, Trophy, TrendingUp, History as HistoryIcon, Filter } from 'lucide-react';

interface UnitQueryProps {
  entries: LogEntry[];
}

export const UnitQuery: React.FC<UnitQueryProps> = ({ entries }) => {
  const [selectedUnit, setSelectedUnit] = useState(UNITS[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const unitEntries = useMemo(() => {
    return entries.filter(e => e.unitName === selectedUnit);
  }, [entries, selectedUnit]);

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return unitEntries;
    return unitEntries.filter(e => 
      e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ACTIVITIES.find(a => a.id === e.activityId)?.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [unitEntries, searchTerm]);

  const totalPoints = useMemo(() => {
    return unitEntries.reduce((sum, e) => sum + e.points, 0);
  }, [unitEntries]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    unitEntries.forEach(e => {
      const activity = ACTIVITIES.find(a => a.id === e.activityId);
      if (activity) {
        breakdown[activity.category] = (breakdown[activity.category] || 0) + e.points;
      }
    });
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  }, [unitEntries]);

  const getActivityLabel = (id: string) => ACTIVITIES.find(a => a.id === id)?.label || 'Atividade Desconhecida';

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Selecionar Unidade para Consulta</label>
            <div className="relative">
              <select 
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <Filter className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Filtrar por nome ou atividade</label>
            <div className="relative">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-xl shadow-md text-white">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-indigo-200" />
            <h3 className="text-xl font-bold">Pontuação Acumulada</h3>
          </div>
          <p className="text-5xl font-extrabold mb-2">{totalPoints.toLocaleString()}</p>
          <p className="text-indigo-100 text-sm">Total de pontos da unidade {selectedUnit}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-800">Destaque por Categoria</h3>
          </div>
          <div className="space-y-3">
            {categoryBreakdown.length === 0 ? (
              <p className="text-slate-400 text-sm">Sem dados para exibir.</p>
            ) : (
              categoryBreakdown.map(([cat, pts]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">{cat}</span>
                  <div className="flex items-center gap-4 flex-1 mx-4">
                    <div className="h-2 bg-slate-100 rounded-full flex-1 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${(pts / totalPoints) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{pts.toLocaleString()} pts</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-slate-500" />
          <h3 className="font-bold text-slate-800">Detalhamento de Lançamentos ({filteredEntries.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Data</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Participante</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Atividade</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Pontos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum lançamento encontrado para os critérios.</td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{entry.studentName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getActivityLabel(entry.activityId)}
                      {entry.quantity > 1 && <span className="ml-1 text-slate-400 text-xs">(x{entry.quantity})</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-indigo-600">
                      +{entry.points.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
