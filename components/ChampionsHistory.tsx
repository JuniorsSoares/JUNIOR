
import React from 'react';
import { Award, Star, History, Trophy, ShieldCheck, Sparkles } from 'lucide-react';

export const ChampionsHistory: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cabeçalho de Destaque */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="w-64 h-64 rotate-12" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/30 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Legado Missionário
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Historico de Campeções</h1>
          <p className="text-indigo-200 text-lg leading-relaxed">
            Celebrando a dedicação e o compromisso das unidades que marcaram a história da nossa Escola Sabatina através do estudo e da missão.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1ª Edição */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transform transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="bg-amber-500 p-6 flex justify-between items-center text-white">
            <div>
              <span className="text-xs font-black uppercase tracking-widest opacity-80">Edição Histórica</span>
              <h3 className="text-3xl font-black">1ª Edição</h3>
            </div>
            <Award className="w-12 h-12" />
          </div>
          
          <div className="p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center border-2 border-indigo-100 shrink-0">
                <ShieldCheck className="w-10 h-10 text-indigo-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Unidade Campeã</p>
                <h4 className="text-3xl font-black text-slate-800">Luz Celeste</h4>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">Liderança excepcional no estudo da lição</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">Destaque em visitas missionárias</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">Recorde de pontuação em pontualidade</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                 ))}
                 <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">+12</div>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ano: 2025</span>
            </div>
          </div>
        </div>

        {/* Card 2ª Edição (Atual) */}
        <div className="bg-slate-50 rounded-3xl shadow-sm border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center p-12 text-center group">
          <div className="w-24 h-24 bg-white rounded-full shadow-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-slate-100">
             <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">Aguardando Campeão</span>
          <h3 className="text-3xl font-black text-slate-800 mb-4">2ª Edição</h3>
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-8">
            A história está sendo escrita agora! Qual unidade erguerá o troféu desta edição?
          </p>
          <div className="px-6 py-2 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest">
             Em Andamento
          </div>
        </div>
      </div>

      {/* Seção de Valores */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <History className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-800">O que define um Campeão Nota 10?</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <span className="text-indigo-600 font-black">01</span>
            </div>
            <h5 className="font-bold text-slate-800">Constância</h5>
            <p className="text-sm text-slate-500 leading-relaxed">Estudar a lição todos os dias não é apenas ganhar pontos, é alimentar a fé continuamente.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <span className="text-emerald-600 font-black">02</span>
            </div>
            <h5 className="font-bold text-slate-800">Missão</h5>
            <p className="text-sm text-slate-500 leading-relaxed">Levar novos amigos à igreja e ao PG é o coração da nossa Escola Sabatina.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <span className="text-amber-600 font-black">03</span>
            </div>
            <h5 className="font-bold text-slate-800">Comunhão</h5>
            <p className="text-sm text-slate-500 leading-relaxed">Fortalecer os laços através de visitas e encontros sociais faz da unidade uma verdadeira família.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
