
import React, { useState, useMemo } from 'react';
import { LogEntry } from '../types';
import { UNITS } from '../constants';
import { Trophy, Medal, Filter, Target, Star, TrendingUp } from 'lucide-react';

interface UnitRankingProps {
  entries: LogEntry[];
}

interface RankedUnit {
  name: string;
  points: number;
  entriesCount: number;
}

export const UnitRanking: React.FC<UnitRankingProps> = ({ entries }) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  const unitStats = useMemo(() => {
    return UNITS.map(unit => {
      const unitEntries = entries.filter(e => e.unitName === unit);
      const points = unitEntries.reduce((sum, e) => sum + e.points, 0);
      return {
        name: unit,
        points,
        entriesCount: unitEntries.length
      };
    }).sort((a, b) => b.points - a.points);
  }, [entries]);

  const maxPoints = useMemo(() => {
    return Math.max(...unitStats.map(u => u.points), 1);
  }, [unitStats]);

  const getMedalColor = (index: number) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-slate-400';
    if (index === 2) return 'text-amber-600';
    return 'text-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Filtro / Seletor de Destaque */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Filter className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Destaque da Unidade</h3>
              <p className="text-xs text-slate-500">Selecione uma unidade para destacá-la no ranking</p>
            </div>
          </div>
          <div className="relative w-full md:w-72">
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white font-bold text-slate-700"
            >
              <option value="all">Ver Todas (Sem destaque)</option>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <div className="absolute right-3 top-4 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end py-4">
        {/* Segundo Lugar */}
        {unitStats[1] && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center order-2 md:order-1 transform transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 border-2 border-slate-100">
              <Medal className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="font-bold text-slate-700 text-lg mb-1">{unitStats[1].name}</h4>
            <div className="text-2xl font-black text-slate-800 mb-2">{unitStats[1].points.toLocaleString()}</div>
            <div className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">2º LUGAR</div>
          </div>
        )}

        {/* Primeiro Lugar */}
        {unitStats[0] && (
          <div className="bg-gradient-to-b from-indigo-600 to-indigo-700 p-8 rounded-3xl shadow-xl flex flex-col items-center text-center order-1 md:order-2 transform scale-105 border-4 border-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border-2 border-white/30">
              <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-md" />
            </div>
            <h4 className="font-black text-white text-2xl mb-1">{unitStats[0].name}</h4>
            <div className="text-4xl font-black text-white mb-3">{unitStats[0].points.toLocaleString()}</div>
            <div className="text-xs font-black bg-yellow-400 text-indigo-900 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">LÍDER</div>
          </div>
        )}

        {/* Terceiro Lugar */}
        {unitStats[2] && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center order-3 transform transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4 border-2 border-amber-100">
              <Medal className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-bold text-slate-700 text-lg mb-1">{unitStats[2].name}</h4>
            <div className="text-2xl font-black text-slate-800 mb-2">{unitStats[2].points.toLocaleString()}</div>
            <div className="text-[10px] font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full uppercase tracking-widest">3º LUGAR</div>
          </div>
        )}
      </div>

      {/* Tabela Completa */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
            <Star className="w-5 h-5 text-indigo-600" />
            Classificação das Unidades
          </h3>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Tempo Real</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {unitStats.map((unit, index) => {
            const isHighlighted = unit.name === selectedUnit;
            return (
              <div
                key={unit.name}
                className={`p-5 flex items-center gap-6 transition-all ${isHighlighted ? 'bg-indigo-50/50 ring-2 ring-inset ring-indigo-500/20' : 'hover:bg-slate-50'}`}
              >
                <div className="w-10 text-center shrink-0">
                  <span className={`text-xl font-black ${index < 3 ? 'text-indigo-600' : 'text-slate-300'}`}>
                    {index + 1}º
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className={`text-lg font-bold transition-colors ${isHighlighted ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {unit.name}
                      </h4>
                      {isHighlighted && (
                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black rounded uppercase tracking-tighter">Sua Unidade</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-black ${isHighlighted ? 'text-indigo-600' : 'text-slate-800'}`}>
                        {unit.points.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">PONTOS</div>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-out rounded-full ${isHighlighted ? 'bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-slate-400'}`}
                      style={{ width: `${(unit.points / maxPoints) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{unit.entriesCount} atividades</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{((unit.points / maxPoints) * 100).toFixed(1)}% do líder</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Extra */}
      <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg flex items-center gap-6 border-b-4 border-indigo-500">
        <div className="p-3 bg-white/10 rounded-xl">
          <Target className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h4 className="font-bold text-lg leading-tight mb-1">Deseja subir no Ranking?</h4>
          <p className="text-sm text-slate-400">Encoraje sua unidade a estudar a lição diariamente e convidar novos amigos para a Escola Sabatina!</p>
        </div>
      </div>
    </div>
  );
};
