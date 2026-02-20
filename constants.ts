
import { Activity, ActivityCategory, Reward } from './types';

export const ACTIVITIES: Activity[] = [
  { id: 'daily_lesson', label: 'Estudar a lição diariamente', points: 50, category: ActivityCategory.STUDY },
  { id: 'arrival_time', label: 'Chegar até as 09h', points: 20, category: ActivityCategory.PUNCTUALITY },
  { id: 'fellowship_meal', label: 'Almoço/Café/Jantar/Piquenique', points: 50, category: ActivityCategory.FELLOWSHIP, isUnitWide: true },
  { id: 'missionary_visit', label: 'Visita missionária (membros/afastados)', points: 250, category: ActivityCategory.MISSION },
  { id: 'pg_presence', label: 'Presença no PG', points: 10, category: ActivityCategory.PRESENCE },
  { id: 'baptism', label: 'Levar pessoa ao batismo', points: 2500, category: ActivityCategory.BAPTISM, isUnitWide: true },
  { id: 'food_donation', label: 'Doação de alimentos ASA', points: 100, category: ActivityCategory.DONATION, multiValue: true },
  { id: 'branch_ss', label: 'Realização Escola Sabatina Filial', points: 250, category: ActivityCategory.MISSION },
  { id: 'spirit_reading', label: 'Leitura do Espírito de Profecia', points: 30, category: ActivityCategory.STUDY },
  { id: 'family_worship', label: 'Culto familiar', points: 50, category: ActivityCategory.FELLOWSHIP },
  { id: 'church_visitor', label: 'Levar visitas à igreja', points: 150, category: ActivityCategory.MISSION },
  { id: 'pg_visitor', label: 'Levar visitas ao PG', points: 50, category: ActivityCategory.MISSION },
  { id: 'bible_year', label: 'Estar fazendo Ano Bíblico', points: 20, category: ActivityCategory.STUDY },
  { id: 'lesson_quiz', label: 'Quizz da Lição', points: 100, category: ActivityCategory.STUDY, multiValue: true, isUnitWide: true },
];

export const UNITS = [
  'Asas de Águia',
  'Soldados de Jesus',
  'Maranata',
  'Luz Celeste',
  'Jovens'
];

export const ROLES = [
  'Professor',
  'Secretário',
  'Aluno'
];

// Rewards catalog for students to redeem their points
// Added to resolve import error in components/RewardRedemption.tsx
export const REWARDS: Reward[] = [
  { id: 'bible', name: 'Bíblia de Estudo', pointsCost: 5000, description: 'Bíblia com recursos avançados de estudo.' },
  { id: 'book', name: 'Livro Missionário', pointsCost: 1000, description: 'Livro inspirador para atividades de campo.' },
  { id: 'bottle', name: 'Garrafa Térmica', pointsCost: 2500, description: 'Garrafa exclusiva da gincana.' },
  { id: 'notebook', name: 'Caderno de Anotações', pointsCost: 1500, description: 'Para registrar seus estudos diários.' },
  { id: 'pen', name: 'Caneta Premium', pointsCost: 500, description: 'Caneta personalizada Nota 10.' }
];
