
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { LogEntry, ActivityCategory } from '../types';
import { ACTIVITIES, UNITS } from '../constants';
import { Filter, Target, Award, ListChecks } from 'lucide-react';

interface DashboardProps {
  entries: LogEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [isMounted, setIsMounted] = useState(false);
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Garante que o gráfico só renderize após a montagem para evitar erro de dimensões -1
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dados para o Ranking
  const unitStats = useMemo(() => {
    return UNITS.map(unit => {
      const unitEntries = entries.filter(e => e.unitName === unit);
      const points = unitEntries.reduce((sum, e) => sum + e.points, 0);
      return { name: unit, points };
    }).sort((a, b) => b.points - a.points);
  }, [entries]);

  // Filtragem das entradas baseada na seleção
  const filteredEntries = useMemo(() => {
    if (selectedUnit === 'all') return entries;
    return entries.filter(e => e.unitName === selectedUnit);
  }, [entries, selectedUnit]);

  // Estatísticas baseadas no filtro
  const totalPoints = useMemo(() => filteredEntries.reduce((sum, e) => sum + e.points, 0), [filteredEntries]);
  const entriesCount = filteredEntries.length;
  
  const categoryData = useMemo(() => {
    return Object.values(ActivityCategory).map(cat => {
      const catPoints = filteredEntries.reduce((sum, e) => {
        const activity = ACTIVITIES.find(a => a.id === e.activityId);
        return activity?.category === cat ? sum + e.points : sum;
      }, 0);
      return { name: cat, value: catPoints };
    }).filter(c => c.value > 0);
  }, [filteredEntries]);

  if (!isMounted) return <div className="h-[400px] flex items-center justify-center text-slate-400 font-medium">Carregando indicadores...</div>;

  return (
    <div className="space-y-6">
      {/* Filtro de Unidade */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Filter className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold text-sm uppercase tracking-wider">Filtro de Visualização</span>
        </div>
        <div className="relative w-full md:w-64">
          <select 
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full p-2 pl-4 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white text-sm font-medium text-slate-700 cursor-pointer hover:border-indigo-400 transition-colors"
          >
            <option value="all">Todas as Unidades (Geral)</option>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Award className="w-16 h-16 text-indigo-600" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total de Pontos</p>
          <p className="text-4xl font-black text-indigo-600 mt-2">{totalPoints.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ListChecks className="w-16 h-16 text-slate-800" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Atividades Registradas</p>
          <p className="text-4xl font-black text-slate-800 mt-2">{entriesCount}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Target className="w-16 h-16 text-emerald-600" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Líder do Ranking</p>
          <p className="text-2xl font-black text-emerald-600 mt-2 truncate">{unitStats[0]?.points > 0 ? unitStats[0]?.name : '---'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Container com min-w-0 para evitar erro de cálculo do ResponsiveContainer em grids */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Ranking das Unidades</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={unitStats} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  fontSize={11} 
                  fontWeight={600}
                  stroke="#475569" 
                />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                   formatter={(value: number) => [`${value.toLocaleString()} pts`, 'Pontuação']}
                />
                <Bar dataKey="points" radius={[0, 6, 6, 0]} barSize={32}>
                  {unitStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === selectedUnit ? '#4338ca' : COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Desempenho por Categoria</h3>
          </div>
          {categoryData.length > 0 ? (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-[10px] font-medium text-slate-600 truncate">{cat.name}: {cat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[350px] flex flex-col items-center justify-center text-slate-400 text-sm">
              <ListChecks className="w-12 h-12 mb-2 opacity-20" />
              Nenhum dado para exibir.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
