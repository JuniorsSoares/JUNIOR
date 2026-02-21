
import React, { useState, useEffect, useCallback } from 'react';
import { LogEntry, Student } from './types';
import { ScoreForm } from './components/ScoreForm';
import { Dashboard } from './components/Dashboard';
import { StudentManager } from './components/StudentManager';
import { UnitQuery } from './components/UnitQuery';
import { StudentRanking } from './components/StudentRanking';
import { UnitRanking } from './components/UnitRanking';
import { ChampionsHistory } from './components/ChampionsHistory';
import { LessonQuiz } from './components/LessonQuiz';
import { Reports } from './components/Reports';
import { PointsWithdrawal } from './components/PointsWithdrawal';
import { AuthScreen } from './components/AuthScreen';
import { UserManager } from './components/UserManager';
import { ACTIVITIES } from './constants';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';
import {
  LayoutDashboard, PlusCircle, History, Trash2, Calendar, Users,
  Search, FileSpreadsheet, Trophy, BarChart3, Award, BrainCircuit,
  Cloud, MinusCircle, Loader2, LogOut, Crown, MapPin, Shield,
} from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  unit_name: string;
  role: 'admin' | 'professor';
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Escuta mudanças de sessão
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) { setUserProfile(null); setEntries([]); setStudents([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Carrega perfil e dados quando usuário loga
  useEffect(() => {
    if (!user) return;

    const loadAll = async () => {
      setDataLoading(true);

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setUserProfile(profileData);
      }

      // Carrega dados iniciais
      const isAdmin = profileData?.role === 'admin';
      const unitFilter = profileData?.unit_name;

      const studentsQuery = isAdmin || !unitFilter
        ? supabase.from('students').select('*').order('name')
        : supabase.from('students').select('*').eq('unit_name', unitFilter).order('name');

      const entriesQuery = isAdmin || !unitFilter
        ? supabase.from('log_entries').select('*').order('date', { ascending: false })
        : supabase.from('log_entries').select('*').eq('unit_name', unitFilter).order('date', { ascending: false });

      const [studentsRes, entriesRes] = await Promise.all([studentsQuery, entriesQuery]);

      if (studentsRes.data) {
        setStudents(studentsRes.data.map((s: any) => ({
          id: s.id, name: s.name, unitName: s.unit_name, role: s.role,
        })));
      }
      if (entriesRes.data) {
        setEntries(entriesRes.data.map((e: any) => ({
          id: e.id, date: e.date, activityId: e.activity_id,
          points: e.points, quantity: e.quantity, unitName: e.unit_name,
          studentName: e.student_name, studentId: e.student_id, notes: e.notes,
        })));
      }

      setDataLoading(false);
    };

    loadAll();
  }, [user]);

  const isAdmin = userProfile?.role === 'admin' || user?.email === 'juniorolivergol@gmail.com';

  const handleSignOut = async () => { await supabase.auth.signOut(); };

  const handleAddEntry = useCallback(async (entry: LogEntry) => {
    const { error } = await supabase.from('log_entries').insert({
      id: entry.id, date: entry.date, activity_id: entry.activityId,
      points: entry.points, quantity: entry.quantity, unit_name: entry.unitName,
      student_name: entry.studentName, student_id: entry.studentId ?? null, notes: entry.notes ?? null,
    });
    if (!error) setEntries(prev => [entry, ...prev]);
    else alert('Erro ao salvar lançamento.');
  }, []);

  const handleDeleteEntry = useCallback(async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este lançamento?')) return;
    const { error } = await supabase.from('log_entries').delete().eq('id', id);
    if (!error) setEntries(prev => prev.filter(e => e.id !== id));
    else alert('Erro ao excluir lançamento.');
  }, []);

  const handleAddStudent = useCallback(async (student: Student) => {
    const { error } = await supabase.from('students').insert({
      id: student.id, name: student.name, unit_name: student.unitName, role: student.role,
    });
    if (!error) setStudents(prev => [...prev, student]);
    else alert('Erro ao salvar participante.');
  }, []);

  const handleUpdateStudent = useCallback(async (updated: Student) => {
    const { error } = await supabase.from('students').update({
      name: updated.name, unit_name: updated.unitName, role: updated.role,
    }).eq('id', updated.id);
    if (!error) setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    else alert('Erro ao atualizar participante.');
  }, []);

  const handleRemoveStudent = useCallback(async (id: string) => {
    if (!window.confirm('Remover este participante?')) return;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) setStudents(prev => prev.filter(s => s.id !== id));
    else alert('Erro ao remover participante.');
  }, []);

  const handleImportData = useCallback(async (newStudents: Student[], newEntries: LogEntry[]) => {
    await supabase.from('log_entries').delete().neq('id', 'NONE');
    await supabase.from('students').delete().neq('id', 'NONE');
    if (newStudents.length > 0)
      await supabase.from('students').insert(newStudents.map(s => ({ id: s.id, name: s.name, unit_name: s.unitName, role: s.role })));
    if (newEntries.length > 0)
      await supabase.from('log_entries').insert(newEntries.map(e => ({
        id: e.id, date: e.date, activity_id: e.activityId, points: e.points,
        quantity: e.quantity, unit_name: e.unitName, student_name: e.studentName,
        student_id: e.studentId ?? null, notes: e.notes ?? null,
      })));
    setStudents([...newStudents]);
    setEntries([...newEntries]);
    setActiveTab('dashboard');
  }, []);

  const getActivityLabel = (id: string) => {
    if (id === 'redemption') return 'Resgate de Brinde';
    if (id === 'withdrawal') return 'Retirada de Pontos (Ajuste)';
    return ACTIVITIES.find(a => a.id === id)?.label || 'Atividade';
  };

  // Tabs disponíveis por perfil
  const allTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: 'reports', label: 'Dados e Backup', icon: FileSpreadsheet, adminOnly: true },
    { id: 'form', label: 'Lançar Pontos', icon: PlusCircle, adminOnly: false },
    { id: 'withdrawal', label: 'Retirar Pontos', icon: MinusCircle, adminOnly: false },
    { id: 'quiz', label: 'Quizz da Lição', icon: BrainCircuit, adminOnly: false },
    { id: 'unitRanking', label: 'Ranking Unidades', icon: BarChart3, adminOnly: false },
    { id: 'ranking', label: 'Ranking Alunos', icon: Trophy, adminOnly: false },
    { id: 'champions', label: 'Histórico Campeões', icon: Award, adminOnly: true },
    { id: 'query', label: 'Pesquisar Unidade', icon: Search, adminOnly: false },
    { id: 'students', label: 'Participantes', icon: Users, adminOnly: true },
    { id: 'history', label: 'Histórico Geral', icon: History, adminOnly: false },
  ];

  const visibleTabs = allTabs.filter(tab => isAdmin || !tab.adminOnly);

  // ===== ESTADOS DE CARREGAMENTO =====
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
          <p className="text-lg font-medium text-slate-300">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
          <p className="text-lg font-medium text-slate-300">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const displayName = userProfile?.full_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">

      {/* ===== SIDEBAR ===== */}
      <nav className="w-full md:w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10 sticky top-0 h-auto md:h-screen">

        {/* Logo */}
        <div className="p-6 flex flex-col items-center gap-3 border-b border-slate-800/50">
          <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-lg flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Logo" className="max-w-full max-h-full object-contain" />
          </div>
          <div className="text-center">
            <h1 className="font-bold text-lg tracking-tight text-white leading-tight">Sistema de Gincanas</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-0.5">IASD PLANALTO</p>
          </div>
        </div>

        {/* Perfil do usuário logado */}
        <div className="mx-3 mt-4 bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isAdmin ? 'bg-indigo-600' : 'bg-sky-700'}`}>
              {isAdmin ? <Crown className="w-4 h-4 text-yellow-400" /> : <Shield className="w-4 h-4 text-sky-200" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[9px] font-black uppercase tracking-widest ${isAdmin ? 'text-indigo-400' : 'text-sky-400'}`}>
                  {isAdmin ? 'Administrador' : 'Professor'}
                </span>
                {!isAdmin && userProfile?.unit_name && (
                  <span className="text-[9px] text-slate-500">• {userProfile.unit_name}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex-1 px-3 space-y-0.5 mt-4 overflow-y-auto pb-4">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <tab.icon className={`w-4 h-4 shrink-0 ${tab.id === 'withdrawal' && activeTab !== 'withdrawal' ? 'text-red-500/70' : ''}`} />
              <span className="font-medium text-sm">{tab.label}</span>
              {tab.id === 'userManager' && <Shield className="w-3 h-3 ml-auto text-indigo-400 opacity-60" />}
            </button>
          ))}
        </div>

        {/* Rodapé sidebar */}
        <div className="p-3 space-y-2 border-t border-slate-800">
          {/* Badge professor: unidade */}
          {!isAdmin && userProfile && (
            <div className="bg-sky-900/30 border border-sky-800/40 rounded-xl p-2.5 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div>
                <p className="text-[9px] text-sky-500 font-bold uppercase tracking-wide">Sua Unidade</p>
                <p className="text-xs text-sky-200 font-bold">{userProfile.unit_name}</p>
              </div>
            </div>
          )}
          {/* Supabase badge */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 flex items-center gap-2">
            <Cloud className="w-3 h-3 text-green-400" />
            <span className="text-[9px] font-bold text-green-300 uppercase tracking-widest">Supabase Conectado</span>
          </div>
          {/* Sair */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-300 rounded-xl transition-all text-xs font-bold border border-slate-700 hover:border-red-800"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </button>
        </div>
      </nav>

      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {visibleTabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isAdmin ? 'Acesso Total • Todas as Unidades' : `Unidade: ${userProfile?.unit_name}`}
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-slate-600">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard entries={entries} />}
        {activeTab === 'reports' && isAdmin && <Reports entries={entries} students={students} onImport={handleImportData} />}
        {activeTab === 'quiz' && <LessonQuiz onAddEntry={handleAddEntry} entries={entries} />}
        {activeTab === 'unitRanking' && <UnitRanking entries={entries} />}
        {activeTab === 'ranking' && <StudentRanking entries={entries} students={students} />}
        {activeTab === 'champions' && isAdmin && <ChampionsHistory />}
        {activeTab === 'form' && (
          <div className="max-w-4xl mx-auto">
            <ScoreForm onAddEntry={handleAddEntry} students={students} onComplete={() => setActiveTab('dashboard')} />
          </div>
        )}
        {activeTab === 'withdrawal' && (
          <PointsWithdrawal students={students} entries={entries} onAddEntry={handleAddEntry} />
        )}
        {activeTab === 'query' && <UnitQuery entries={entries} />}
        {activeTab === 'students' && isAdmin && (
          <StudentManager
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onRemoveStudent={handleRemoveStudent}
          />
        )}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Data</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Participante</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Atividade</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Pontos</th>
                    {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ação</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Nenhum lançamento.</td></tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(entry.date).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{entry.studentName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{getActivityLabel(entry.activityId)}</td>
                        <td className={`px-6 py-4 text-sm font-bold text-right ${entry.points < 0 ? 'text-red-600' : 'text-indigo-600'}`}>
                          {entry.points > 0 ? `+${entry.points.toLocaleString()}` : entry.points.toLocaleString()}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-sm text-right">
                            <button onClick={() => handleDeleteEntry(entry.id)} className="p-2 text-slate-300 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
