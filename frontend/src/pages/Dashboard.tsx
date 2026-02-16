import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  Music,
  ArrowRight,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { ludusApi } from "@/components/api/ludusApi";

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card className="bg-white/80 backdrop-blur border-0 shadow-lg shadow-violet-500/5 hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm text-emerald-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>Ativo</span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const QuickAction = ({ title, description, icon: Icon, href, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Link to={href}>
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg shadow-violet-500/5 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden">
        <CardContent className="p-6 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 group-hover:text-violet-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    classes: 0,
    beats: 0,
    lessons: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [students, classes, beats] = await Promise.all([
        ludusApi.getStudents(0, 1),
        ludusApi.getDancingClasses(0, 1),
        ludusApi.getBeats(0, 1)
      ]);

      setStats({
        students: Array.isArray(students) ? students.length : 0,
        classes: Array.isArray(classes) ? classes.length : 0,
        beats: Array.isArray(beats) ? beats.length : 0,
        lessons: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            Dashboard
            <Sparkles className="w-8 h-8 text-blue-500" />
          </h1>
          <p className="text-slate-500 mt-1">Bem-vindo ao sistema de gestão Ludus Checkin</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Alunos"
          value={stats.students}
          icon={Users}
          color="bg-gradient-to-br from-violet-500 to-purple-600"
          delay={0.1}
        />
        <StatCard
          title="Turmas Ativas"
          value={stats.classes}
          icon={GraduationCap}
          color="bg-gradient-to-br from-fuchsia-500 to-pink-600"
          delay={0.2}
        />
        <StatCard
          title="Ritmos Cadastrados"
          value={stats.beats}
          icon={Music}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
          delay={0.3}
        />
        <StatCard
          title="Aulas Realizadas"
          value={stats.lessons}
          icon={Calendar}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          delay={0.4}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            title="Cadastrar Aluno"
            description="Adicione um novo aluno ao sistema"
            icon={Users}
            href={createPageUrl('Students')}
            color="bg-gradient-to-br from-violet-500 to-purple-600"
            delay={0.5}
          />
          <QuickAction
            title="Criar Turma"
            description="Configure uma nova turma de dança"
            icon={GraduationCap}
            href={createPageUrl('DancingClasses')}
            color="bg-gradient-to-br from-fuchsia-500 to-pink-600"
            delay={0.6}
          />
          <QuickAction
            title="Registrar Aula"
            description="Registre uma nova aula realizada"
            icon={Calendar}
            href={createPageUrl('Lessons')}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
            delay={0.7}
          />
          <QuickAction
            title="Adicionar Ritmo"
            description="Cadastre um novo estilo de dança"
            icon={Music}
            href={createPageUrl('Beats')}
            color="bg-gradient-to-br from-amber-500 to-orange-600"
            delay={0.8}
          />
        </div>
      </div>
    </div>
  );
}