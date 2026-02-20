
import React, { useState, useMemo } from 'react';
import { LogEntry, Student } from '../types';
import { UNITS, ACTIVITIES } from '../constants';
import { Trophy, Search, Filter, User, Star, Medal, Printer, FileText, X, History, Crown, ArrowUpRight } from 'lucide-react';

interface StudentRankingProps {
  entries: LogEntry[];
  students: Student[];
}

interface RankedStudent extends Student {
  totalPoints: number;
}

export const StudentRanking: React.FC<StudentRankingProps> = ({ entries, students }) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportStudent, setReportStudent] = useState<RankedStudent | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const rankedStudents = useMemo(() => {
    const studentPointsMap = entries.reduce((acc, entry) => {
      const student = students.find(s => s.name === entry.studentName);
      if (student) {
        acc[student.id] = (acc[student.id] || 0) + entry.points;
      }
      return acc;
    }, {} as Record<string, number>);

    const list: RankedStudent[] = students.map(s => ({
      ...s,
      totalPoints: studentPointsMap[s.id] || 0
    }));

    let filtered = selectedUnit === 'all'
      ? list
      : list.filter(s => s.unitName === selectedUnit);

    if (searchTerm) {
      filtered = filtered.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return filtered.sort((a, b) => b.totalPoints - a.totalPoints);
  }, [entries, students, selectedUnit, searchTerm]);

  const maxPoints = useMemo(() => {
    return Math.max(...rankedStudents.map(s => s.totalPoints), 1);
  }, [rankedStudents]);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Crown className="w-4 h-4" />, label: '1º Lugar' };
      case 1: return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <Medal className="w-4 h-4" />, label: '2º Lugar' };
      case 2: return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Medal className="w-4 h-4" />, label: '3º Lugar' };
      default: return { color: 'bg-slate-50 text-slate-400 border-slate-100', icon: null, label: `${index + 1}º` };
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const getActivityLabel = (id: string) => {
    if (id === 'redemption') return 'Resgate de Brinde';
    if (id === 'withdrawal') return 'Retirada de Pontos (Ajuste)';
    return ACTIVITIES.find(a => a.id === id)?.label || 'Atividade';
  };

  const studentDetailedEntries = useMemo(() => {
    if (!reportStudent) return [];
    return entries
      .filter(e => e.studentName === reportStudent.name)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, reportStudent]);

  const unitLabel = selectedUnit === 'all' ? 'Todas as Unidades' : selectedUnit;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* ===== ESTILOS DE IMPRESSAO ===== */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }

          #printable-student-report,
          #printable-student-report * { visibility: visible !important; }
          #printable-student-report {
            position: fixed;
            left: 0; top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }

          #printable-ranking,
          #printable-ranking * { visibility: visible !important; }
          #printable-ranking {
            position: fixed;
            left: 0; top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }

          .no-print { display: none !important; }
          @page { margin: 1cm; size: A4 portrait; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
      `}</style>

      {/* ===== RANKING IMPRIMIVEL (oculto na tela, visivel ao imprimir) ===== */}
      <div id="printable-ranking" style={{ display: 'none', fontFamily: "'Georgia', serif" }}>

        {/* Cabecalho azul escuro */}
        <div style={{ background: '#0f172a', color: 'white', padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#818cf8', marginBottom: '5px' }}>
                Sistema Aluno Nota 10
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px', margin: 0 }}>
                Ranking Geral de Alunos
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                Escola Sabatina &bull; {unitLabel}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Gerado em</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#c7d2fe' }}>{new Date().toLocaleDateString('pt-BR')}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{rankedStudents.length} participantes</div>
            </div>
          </div>
        </div>

        {/* Faixa dourada decorativa */}
        <div style={{ height: '5px', background: 'linear-gradient(90deg, #b45309, #f59e0b, #fbbf24, #f59e0b, #b45309)', marginBottom: '20px' }} />

        {/* Destaque Top 3 */}
        {rankedStudents.length >= 3 && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', padding: '0 4px' }}>
            {([1, 0, 2] as number[]).map((pos) => (
              <div key={pos} style={{
                flex: 1,
                background: pos === 0 ? '#0f172a' : '#f8fafc',
                border: pos === 0 ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '14px 10px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                  {pos === 0 ? '🥇' : pos === 1 ? '🥈' : '🥉'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: pos === 0 ? '#ffffff' : '#0f172a', marginBottom: '3px' }}>
                  {rankedStudents[pos].name}
                </div>
                <div style={{ fontSize: '10px', color: pos === 0 ? '#818cf8' : '#64748b', marginBottom: '8px' }}>
                  {rankedStudents[pos].unitName}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: pos === 0 ? '#fbbf24' : '#1e40af' }}>
                  {rankedStudents[pos].totalPoints.toLocaleString()}
                </div>
                <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>pts</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabela completa */}
        <div style={{ fontSize: '9px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', padding: '0 4px' }}>
          Classificacao Completa
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ padding: '8px 10px', textAlign: 'center', width: '40px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0' }}>Pos.</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0' }}>Nome</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0' }}>Unidade</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0' }}>Funcao</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0' }}>Pontos</th>
            </tr>
          </thead>
          <tbody>
            {rankedStudents.map((student, index) => (
              <tr key={student.id} style={{
                background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <td style={{ padding: '7px 10px', fontWeight: 900, textAlign: 'center', color: index < 3 ? '#0f172a' : '#cbd5e1', fontSize: index < 3 ? '13px' : '11px' }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}°`}
                </td>
                <td style={{ padding: '7px 10px', fontWeight: index < 3 ? 800 : 600, color: '#0f172a' }}>{student.name}</td>
                <td style={{ padding: '7px 10px', color: '#475569' }}>{student.unitName}</td>
                <td style={{ padding: '7px 10px', color: '#64748b' }}>{student.role}</td>
                <td style={{ padding: '7px 10px', fontWeight: 900, textAlign: 'right', color: index < 3 ? '#1e3a5f' : '#1e40af', fontSize: '13px' }}>
                  {student.totalPoints.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Rodape */}
        <div style={{ marginTop: '24px', borderTop: '2px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Sistema Aluno Nota 10 — Escola Sabatina
          </div>
          <div style={{ fontSize: '9px', color: '#94a3b8' }}>
            {rankedStudents.length} participante(s) &bull; {new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* ===== MODAL DE RELATORIO INDIVIDUAL (imprimivel) ===== */}
      {reportStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">

            {/* Header do modal (nao imprime) */}
            <div className="bg-blue-950 p-6 text-white flex justify-between items-center shrink-0 no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-400" />
                <h3 className="font-bold text-lg">Comprovante de Pontos</h3>
              </div>
              <button onClick={() => setReportStudent(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ===== CONTEUDO QUE SERA IMPRESSO ===== */}
            <div id="printable-student-report" className="overflow-y-auto bg-white flex-1" style={{ fontFamily: "'Georgia', serif" }}>

              {/* Header institucional */}
              <div style={{ background: '#0f172a', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '8px', color: '#818cf8', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Escola Sabatina
                  </div>
                  <div style={{ fontSize: '19px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px' }}>
                    Comprovante de Pontos
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
                    Aluno Nota 10 &mdash; Relatorio Individual
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Emitido em</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#c7d2fe' }}>{new Date().toLocaleDateString('pt-BR')}</div>
                </div>
              </div>

              {/* Faixa dourada */}
              <div style={{ height: '5px', background: 'linear-gradient(90deg, #b45309, #f59e0b, #fbbf24, #f59e0b, #b45309)' }} />

              <div style={{ padding: '22px 28px' }}>

                {/* Dados do aluno + Selo de pontos */}
                <div style={{ display: 'flex', gap: '18px', marginBottom: '22px', alignItems: 'stretch' }}>

                  {/* Dados */}
                  <div style={{ flex: 1, background: '#f8fafc', borderRadius: '10px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      Dados do Participante
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Nome Completo</div>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{reportStudent.name}</div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Unidade / Classe</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e40af' }}>{reportStudent.unitName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Funcao</div>
                      <div style={{ fontSize: '13px', color: '#475569' }}>{reportStudent.role}</div>
                    </div>
                  </div>

                  {/* Selo de pontos */}
                  <div style={{ width: '155px', background: '#0f172a', borderRadius: '10px', padding: '18px 14px', textAlign: 'center', border: '2px solid #f59e0b', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '28px' }}>&#11088;</div>
                    <div style={{ fontSize: '9px', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
                      Pontuacao Total
                    </div>
                    <div style={{ fontSize: '38px', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>
                      {reportStudent.totalPoints.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      pontos nota 10
                    </div>
                  </div>
                </div>

                {/* Historico de lancamentos */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', paddingBottom: '7px', borderBottom: '2px solid #f1f5f9' }}>
                    Historico de Lancamentos
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 800, color: '#475569', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', width: '80px' }}>Data</th>
                        <th style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 800, color: '#475569', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0' }}>Atividade</th>
                        <th style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 800, color: '#475569', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', width: '70px' }}>Pontos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDetailedEntries.slice(0, 15).map((entry, i) => (
                        <tr key={entry.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 10px', color: '#64748b' }}>{new Date(entry.date).toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding: '6px 10px', fontWeight: 600, color: '#0f172a' }}>{getActivityLabel(entry.activityId)}</td>
                          <td style={{ padding: '6px 10px', fontWeight: 900, textAlign: 'right', color: entry.points < 0 ? '#dc2626' : '#1e40af', fontSize: '12px' }}>
                            {entry.points > 0 ? `+${entry.points}` : entry.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Rodape com assinatura */}
                <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Sistema Aluno Nota 10 &mdash; Escola Sabatina
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '160px', borderTop: '1px solid #cbd5e1', paddingTop: '5px' }}>
                      <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Secretario(a) / Líder</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botoes do modal (nao imprimem) */}
            <div className="p-6 bg-slate-50 flex flex-col md:flex-row gap-3 shrink-0 no-print">
              <button
                onClick={handlePrintReport}
                className="flex-1 bg-blue-950 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Printer className="w-5 h-5" />
                Imprimir / Salvar PDF
              </button>
              <button
                onClick={() => setReportStudent(null)}
                className="px-8 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-100 transition-all"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FILTROS E BUSCA ===== */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 no-print flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none font-medium text-slate-700 transition-all"
          />
        </div>

        <div className="w-full md:w-64 relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full p-4 pl-12 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none appearance-none font-bold text-slate-700 cursor-pointer transition-all"
          >
            <option value="all">Todas as Unidades</option>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        {/* Botao Imprimir Ranking */}
        <button
          onClick={() => {
            const el = document.getElementById('printable-ranking');
            if (el) el.style.display = 'block';
            window.print();
            setTimeout(() => { if (el) el.style.display = 'none'; }, 500);
          }}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shrink-0"
        >
          <Printer className="w-5 h-5" />
          Imprimir Ranking
        </button>
      </div>

      {/* ===== PODIO (Top 3) ===== */}
      {!searchTerm && rankedStudents.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end no-print py-4">
          {/* Segundo Lugar */}
          <div className="order-2 md:order-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border-t-8 border-slate-300 flex flex-col items-center text-center relative group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-4 bg-slate-100 text-slate-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-white shadow-sm">
                🥈 2º Lugar
              </div>
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border-4 border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-slate-300" />
              </div>
              <h4 className="font-black text-slate-800 text-xl truncate w-full mb-1">{rankedStudents[1].name}</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mb-4">{rankedStudents[1].unitName}</p>
              <div className="bg-slate-100 text-slate-700 px-6 py-2 rounded-2xl font-black text-lg">
                {rankedStudents[1].totalPoints.toLocaleString()} <span className="text-[10px] uppercase">pts</span>
              </div>
            </div>
          </div>

          {/* Primeiro Lugar */}
          <div className="order-1 md:order-2 animate-slide-up" style={{ animationDelay: '0s' }}>
            <div className="bg-blue-950 p-10 rounded-[3rem] shadow-2xl shadow-blue-900/40 border-t-8 border-yellow-500 flex flex-col items-center text-center relative transform md:scale-110 z-10 group hover:-translate-y-3 transition-transform duration-300">
              <div className="absolute -top-5 bg-yellow-500 text-blue-950 px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-4 border-blue-950 shadow-xl">
                👑 Campeão Geral
              </div>
              <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center mb-6 border-4 border-blue-800 shadow-inner group-hover:rotate-12 transition-transform relative">
                <Crown className="w-12 h-12 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              </div>
              <h4 className="font-black text-white text-2xl truncate w-full mb-1">{rankedStudents[0].name}</h4>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-6">{rankedStudents[0].unitName}</p>
              <div className="bg-yellow-500 text-blue-950 px-8 py-3 rounded-[1.5rem] font-black text-3xl shadow-lg shadow-yellow-500/20">
                {rankedStudents[0].totalPoints.toLocaleString()} <span className="text-xs uppercase opacity-80">pts</span>
              </div>
            </div>
          </div>

          {/* Terceiro Lugar */}
          <div className="order-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border-t-8 border-amber-600/50 flex flex-col items-center text-center relative group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-4 bg-amber-50 text-amber-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-white shadow-sm">
                🥉 3º Lugar
              </div>
              <div className="w-20 h-20 bg-amber-50/30 rounded-full flex items-center justify-center mb-4 border-4 border-amber-50 shadow-inner group-hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-amber-200" />
              </div>
              <h4 className="font-black text-slate-800 text-xl truncate w-full mb-1">{rankedStudents[2].name}</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mb-4">{rankedStudents[2].unitName}</p>
              <div className="bg-amber-50 text-amber-800 px-6 py-2 rounded-2xl font-black text-lg">
                {rankedStudents[2].totalPoints.toLocaleString()} <span className="text-[10px] uppercase">pts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TABELA DE CLASSIFICACAO ===== */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden no-print">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Star className="w-6 h-6 text-blue-700 fill-blue-700" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Tabela de Classificacao</h3>
              <p className="text-xs text-slate-500 font-medium">Clique em um aluno para ver o comprovante</p>
            </div>
          </div>
          <span className="text-[10px] font-black bg-white px-4 py-2 rounded-full border border-slate-200 text-slate-500 shadow-sm">
            {rankedStudents.length} PARTICIPANTES
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {rankedStudents.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                <Search className="w-10 h-10" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest">Nenhum resultado encontrado</p>
            </div>
          ) : (
            rankedStudents.map((student, index) => {
              const { color, icon, label } = getRankBadge(index);
              const isHovered = hoveredId === student.id;

              return (
                <div
                  key={student.id}
                  onMouseEnter={() => setHoveredId(student.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setReportStudent(student)}
                  className={`group p-6 flex items-center gap-6 transition-all duration-300 cursor-pointer ${isHovered ? 'bg-blue-50/50 translate-x-2' : 'hover:bg-slate-50'}`}
                >
                  <div className="w-12 text-center shrink-0">
                    <span className={`text-xl font-black transition-colors ${index < 3 ? 'text-blue-900' : 'text-slate-300'}`}>
                      {index + 1}°
                    </span>
                  </div>

                  <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shrink-0 transition-all duration-500 ${index < 3 ? 'bg-blue-950 text-white shadow-lg rotate-3 group-hover:rotate-0' : 'bg-slate-100 text-slate-400 group-hover:bg-white'}`}>
                    {index === 0 ? <Crown className="w-7 h-7 text-yellow-500" /> : <User className="w-7 h-7" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h4 className="font-black text-slate-800 text-lg truncate group-hover:text-blue-900 transition-colors">
                        {student.name}
                      </h4>
                      {index < 3 && (
                        <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 ${color}`}>
                          {icon} {label}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{student.unitName} &bull; {student.role}</p>
                      <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ease-out ${index < 3 ? 'bg-blue-900' : 'bg-slate-300'}`}
                          style={{ width: `${(student.totalPoints / maxPoints) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-6">
                    <div>
                      <div className="text-2xl font-black text-slate-900">
                        {student.totalPoints.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest text-right">PONTOS</div>
                    </div>
                    <div className={`p-3 rounded-xl transition-all duration-300 ${isHovered ? 'bg-blue-600 text-white scale-110' : 'bg-slate-100 text-slate-300'}`}>
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 no-print border-b-8 border-blue-600 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy className="w-32 h-32 text-white" />
        </div>
        <div className="flex-1 relative z-10">
          <h4 className="text-white text-xl font-black mb-1">Como subir no Ranking?</h4>
          <p className="text-blue-300 text-sm font-medium leading-relaxed">
            Cada atividade missionaria, estudo diario da licao e pontualidade conta pontos valiosos.
            Clique em qualquer aluno da lista para gerar o comprovante em PDF!
          </p>
        </div>
        <div className="shrink-0 relative z-10">
          <button
            onClick={() => alert("Dica: Focar em 'Trazer visitas' e a forma mais rapida de subir no ranking!")}
            className="px-8 py-3 bg-white text-blue-950 font-black rounded-2xl hover:bg-blue-50 transition-colors shadow-xl"
          >
            Ver Dicas de Missao
          </button>
        </div>
      </div>
    </div>
  );
};
