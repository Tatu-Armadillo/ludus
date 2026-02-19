import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  Calendar,
  Music,
  ArrowRight,
  TrendingUp,
  ClipboardList,
  AlertTriangle
} from "lucide-react";
import { ludusApi } from "@/components/api/ludusApi";
import { useClassesStatus, type ClassWithStatus } from "@/hooks/useClassesStatus";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon: Icon, color, delay }: StatCardProps) => (
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

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  delay: number;
}

const QuickAction = ({ title, description, icon: Icon, href, color, delay }: QuickActionProps) => (
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

function formatEndDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const classCardStyles = {
  closing_soon: 'bg-amber-50 border-amber-200/60',
  in_progress: 'bg-emerald-50 border-emerald-200/60',
  closed: 'bg-slate-100 border-slate-200',
} as const;

const classCardAccent = {
  closing_soon: 'text-amber-600',
  in_progress: 'text-emerald-600',
  closed: 'text-slate-500',
} as const;

const DAY_WEEK_LABELS: Record<string, string> = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

interface ClassStatusCardProps {
  item: ClassWithStatus;
}

function ClassStatusCard({ item }: ClassStatusCardProps) {
  const variant = item.visualStatus;
  const styles = classCardStyles[variant];
  const accent = classCardAccent[variant];
  const endDateFormatted = formatEndDate(item.endDate ?? '');
  const remainingLessons = item.remainingLessons ?? 0;
  const daysRemaining = item.daysRemaining ?? 0;
  const dayWeekLabel = item.dayWeek ? (DAY_WEEK_LABELS[item.dayWeek] ?? item.dayWeek) : null;

  const statusLabel =
    variant === 'closed' ? 'Encerrada' : String(Math.max(0, daysRemaining));

  return (
    <div className={`rounded-xl border p-4 ${styles}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-slate-800 truncate">{item.name || 'Turma'}</h4>
          {dayWeekLabel && (
            <p className="text-sm text-slate-600 mt-1">Dia: {dayWeekLabel}</p>
          )}
          <p className="text-sm text-slate-600 mt-1">Encerra em: {endDateFormatted}</p>
          <p className="text-sm text-slate-600">Aulas restantes: {remainingLessons}</p>
        </div>
        <div className={`shrink-0 text-right ${accent}`}>
          <span className="block text-xl font-bold">{statusLabel}</span>
          <span className="block text-xs">
            {variant === 'closed' ? '' : 'dias restantes'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeEnrollments: 0,
    totalClasses: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const { closingSoon, byMonth, closed, loading: classesLoading, empty: classesEmpty } = useClassesStatus();

  useEffect(() => {
    const ac = new AbortController();
    let mounted = true;

    (async () => {
      try {
        const data = await ludusApi.getDashboardStats(ac.signal);
        if (mounted) {
          setStats({
            activeEnrollments: data?.activeEnrollments ?? 0,
            totalClasses: data?.totalClasses ?? 0,
            totalStudents: data?.totalStudents ?? 0
          });
        }
      } catch (error) {
        if (!mounted || (error instanceof Error && error.name === 'AbortError')) return;
        console.error('Error loading stats:', error);
        setStats({ activeEnrollments: 0, totalClasses: 0, totalStudents: 0 });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      ac.abort();
    };
  }, []);

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
          </h1>
          <p className="text-slate-500 mt-1">Bem-vindo ao sistema de gestão Ludus Checkin</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Matrículas Ativas"
          value={loading ? "—" : stats.activeEnrollments}
          icon={ClipboardList}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          delay={0.1}
        />
        <StatCard
          title="Turmas Ativas"
          value={loading ? "—" : stats.totalClasses}
          icon={GraduationCap}
          color="bg-gradient-to-br from-fuchsia-500 to-pink-600"
          delay={0.2}
        />
        <StatCard
          title="Total de Alunos"
          value={loading ? "—" : stats.totalStudents}
          icon={Users}
          color="bg-gradient-to-br from-violet-500 to-purple-600"
          delay={0.3}
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

      {/* Classes status */}
      <div className="space-y-6">
        {classesLoading ? (
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg shadow-violet-500/5">
            <CardContent className="p-6">
              <p className="text-slate-500">Carregando status das turmas...</p>
            </CardContent>
          </Card>
        ) : classesEmpty ? (
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg shadow-violet-500/5">
            <CardContent className="p-6">
              <p className="text-slate-500">Nenhuma turma encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {closingSoon.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg shadow-violet-500/5">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                      Turmas Fechando em Breve
                    </h2>
                    <p className="text-sm text-slate-600 mb-4">
                      As seguintes turmas estão próximas da data de encerramento:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {closingSoon.map((item) => (
                        <ClassStatusCard key={item.id} item={item} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg shadow-violet-500/5">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-slate-800 mb-6">Status de Todas as Turmas</h2>

                  {byMonth.length > 0 && (
                    <div className="space-y-6">
                      {byMonth.map((group) => (
                        <div key={group.monthKey}>
                          <h3 className="text-base font-bold text-slate-800 mb-2">{group.monthLabel}</h3>
                          <div className="h-px bg-slate-200 mb-4" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {group.classes.map((item) => (
                              <ClassStatusCard key={item.id} item={item} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {closed.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-base font-bold text-slate-800 mb-2">Turmas Encerradas</h3>
                      <div className="h-px bg-slate-200 mb-4" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {closed.map((item) => (
                          <ClassStatusCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  )}

                  {byMonth.length === 0 && closed.length === 0 && (
                    <p className="text-slate-500 text-sm">Nenhuma turma ativa ou encerrada recente.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}