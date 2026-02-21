
import React, { useState, useMemo } from 'react';
import { LogEntry } from '../types';
import { UNITS } from '../constants';
import { Trophy, Medal, Filter, Target, Star, TrendingUp, ArrowUpRight, Printer } from 'lucide-react';

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  const selectedUnitData = useMemo(() => {
    return unitStats.find(u => u.name === selectedUnit);
  }, [unitStats, selectedUnit]);

  const handlePrintUnitReport = () => {
    const el = document.getElementById('printable-unit-report');
    if (el) el.style.display = 'block';
    window.print();
    setTimeout(() => { if (el) el.style.display = 'none'; }, 500);
  };

  const getMedalColor = (index: number) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-slate-400';
    if (index === 2) return 'text-amber-600';
    return 'text-slate-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">

      {/* ===== ESTILOS DE IMPRESSAO ===== */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-unit-report,
          #printable-unit-report * { visibility: visible !important; }
          #printable-unit-report {
            position: fixed;
            left: 0; top: 0;
            width: 100%;
            height: 100%;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print { display: none !important; }
          @page { margin: 0; size: A4 portrait; }
        }
      `}</style>

      {/* ===== RELATORIO DA UNIDADE IMPRIMIVEL ===== */}
      {selectedUnitData && (
        <div id="printable-unit-report" style={{ display: 'none', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
          <div style={{ padding: '60px 40px' }}>
            {/* Header Decorativo */}
            <div style={{ background: '#0f172a', padding: '40px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden', marginBottom: '40px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
                <Trophy size={200} />
              </div>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Star fill="#fbbf24" color="#fbbf24" size={24} />
                  <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', color: '#818cf8' }}>Aluno Nota 10 &bull; Relatórios</span>
                </div>
                <h1 style={{ fontSize: '42px', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>Relatório da Unidade</h1>
                <p style={{ fontSize: '18px', color: '#94a3b8', marginTop: '8px', fontWeight: 500 }}>Escola Sabatina Central</p>
              </div>
            </div>

            {/* Conteudo Principal */}
            <div style={{ background: 'white', borderRadius: '32px', padding: '50px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ width: '100px', height: '100px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Trophy size={48} color="#4f46e5" />
              </div>

              <h2 style={{ fontSize: '24px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Unidade</h2>
              <div style={{ fontSize: '56px', fontWeight: 950, color: '#0f172a', marginBottom: '40px', letterSpacing: '-2px' }}>{selectedUnitData.name}</div>

              <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)', marginBottom: '40px' }} />

              <div style={{ fontSize: '28px', color: '#475569', fontWeight: 600, marginBottom: '20px' }}>
                Sua Unidade tem:
              </div>

              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '40px' }}>
                <div style={{ fontSize: '120px', fontWeight: 950, color: '#4f46e5', lineHeight: 0.9, position: 'relative', zIndex: 2 }}>
                  {selectedUnitData.points.toLocaleString()}
                </div>
                <div style={{ position: 'absolute', bottom: '10px', left: '0', width: '100%', height: '20px', background: '#fbbf24', opacity: 0.3, zIndex: 1, borderRadius: 'full' }}></div>
              </div>

              <div style={{ fontSize: '24px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '4px' }}>PONTOS ACUMULADOS</div>
            </div>

            {/* Rodapé e Assinatura */}
            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                DOCUMENTO OFICIAL GERADO EM<br />
                <span style={{ color: '#64748b', fontSize: '14px' }}>{new Date().toLocaleDateString('pt-BR')} ÀS {new Date().toLocaleTimeString('pt-BR')}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '200px', borderBottom: '2px solid #e2e8f0', marginBottom: '8px' }}></div>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Secretaria / Líder</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Filtro / Seletor de Destaque */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <Filter className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Pesquisar Unidade</h3>
              <p className="text-xs text-slate-500 font-medium">Selecione uma unidade para ver detalhes ou exportar</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            <div className="relative w-full md:w-72 group">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full p-4 pl-5 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none appearance-none bg-slate-50 font-black text-slate-700 transition-all cursor-pointer"
              >
                <option value="all">Ver Todas (Sem destaque)</option>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ArrowUpRight className="w-5 h-5 rotate-45" />
              </div>
            </div>

            {selectedUnit !== 'all' && (
              <button
                onClick={handlePrintUnitReport}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-950 hover:bg-slate-900 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95"
              >
                <Printer className="w-5 h-5" />
                <span>Salvar em PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end py-4">
        {/* Segundo Lugar */}
        {unitStats[1] && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center order-2 md:order-1 transform transition-all hover:-translate-y-2 duration-300">
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
          <div className="bg-gradient-to-b from-indigo-600 to-indigo-700 p-8 rounded-3xl shadow-xl flex flex-col items-center text-center order-1 md:order-2 transform scale-105 border-4 border-white hover:-translate-y-3 transition-transform duration-300">
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center order-3 transform transition-all hover:-translate-y-2 duration-300">
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
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
            <Star className="w-6 h-6 text-indigo-600 fill-indigo-600" />
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
            const isHovered = hoveredId === unit.name;
            return (
              <div
                key={unit.name}
                onMouseEnter={() => setHoveredId(unit.name)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group p-6 flex items-center gap-6 transition-all duration-300 ${isHovered ? 'bg-indigo-50/50 translate-x-2' : isHighlighted ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
              >
                <div className="w-12 text-center shrink-0">
                  <span className={`text-xl font-black ${index < 3 ? 'text-indigo-600' : 'text-slate-300'}`}>
                    {index + 1}º
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className={`text-lg font-black transition-colors ${isHighlighted || isHovered ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {unit.name}
                      </h4>
                      {isHighlighted && (
                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black rounded uppercase tracking-tighter shadow-sm">Destaque</span>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div className="text-right">
                        <div className={`text-2xl font-black ${isHighlighted || isHovered ? 'text-indigo-600' : 'text-slate-800'}`}>
                          {unit.points.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">PONTOS</div>
                      </div>
                      <div className={`p-3 rounded-xl transition-all duration-300 ${isHovered ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-100 text-slate-300'}`}>
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-out rounded-full ${isHighlighted || isHovered ? 'bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-slate-400'}`}
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
