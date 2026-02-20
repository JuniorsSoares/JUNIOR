
import React, { useState } from 'react';
import { Trophy, User, Lock, LogIn, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { AppUser } from '../types';

interface LoginProps {
  onLogin: (success: boolean) => void;
  onSignUp: (user: AppUser) => void;
  users: AppUser[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, onSignUp, users }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // Simulação de delay para feedback visual
    setTimeout(() => {
      if (mode === 'login') {
        const user = users.find(u => u.name === username && u.password === password);
        
        // Admin fixo como fallback
        if (user || (username === 'admin' && password === '1010')) {
          onLogin(true);
        } else {
          setError('Usuário ou senha incorretos.');
          setLoading(false);
        }
      } else {
        if (username.length < 3) {
          setError('O nome deve ter pelo menos 3 caracteres.');
          setLoading(false);
          return;
        }
        if (password.length < 4) {
          setError('A senha deve ter pelo menos 4 caracteres.');
          setLoading(false);
          return;
        }

        const exists = users.find(u => u.name === username);
        if (exists) {
          setError('Este nome de usuário já está em uso.');
          setLoading(false);
          return;
        }

        const newUser: AppUser = {
          id: crypto.randomUUID(),
          name: username,
          password: password
        };

        onSignUp(newUser);
        setSuccessMsg('Cadastro realizado com sucesso! Faça login agora.');
        setMode('login');
        setPassword('');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-indigo-600 p-8 text-center text-white relative">
            <div className="inline-flex p-4 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm shadow-lg">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Aluno Nota10</h1>
            <p className="text-indigo-100 text-sm mt-1 font-medium opacity-80">Gestão Escola Sabatina</p>
            
            <div className="flex bg-indigo-700/50 p-1 rounded-xl mt-8 backdrop-blur-md">
              <button 
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-200 hover:text-white'}`}
              >
                Acessar
              </button>
              <button 
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'signup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-200 hover:text-white'}`}
              >
                Cadastrar
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 text-center animate-pulse">
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-bold border border-emerald-100 text-center">
                {successMsg}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Seu Nome</label>
                <div className="relative group">
                  <input 
                    type="text"
                    required
                    disabled={loading}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={mode === 'login' ? "Nome de usuário" : "Escolha um nome"}
                    className="w-full p-4 pl-12 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-700 disabled:opacity-50"
                  />
                  <User className="absolute left-4 top-4 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
                <div className="relative group">
                  <input 
                    type="password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-4 pl-12 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-700 disabled:opacity-50"
                  />
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 transform active:scale-95 group disabled:bg-slate-400 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar no Sistema
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Criar minha Conta
                </>
              )}
              {!loading && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
