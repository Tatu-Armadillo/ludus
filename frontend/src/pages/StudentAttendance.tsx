import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, Loader2, Clock, Calendar, Music, Users } from "lucide-react";
import { ludusApi } from "@/components/api/ludusApi";
import { format } from "date-fns";

const ARCHIVED_STORAGE_KEY = 'ludus_archived_class_ids';
const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const FINISHED_STATUSES = ['COMPLETED', 'CANCELED'];

const LEVELS = [
    { value: 'BEGINNER', label: 'Iniciante' },
    { value: 'INTERMEDIARY', label: 'Intermediário' },
    { value: 'ADVANCED', label: 'Avançado' },
];

const STATUSES = [
    { value: 'IN_PROGRESS', label: 'Em Andamento' },
    { value: 'COMPLETED', label: 'Concluída' },
    { value: 'CANCELED', label: 'Cancelada' },
];

const DAYS = [
    { value: 'MONDAY', label: 'Segunda' },
    { value: 'TUESDAY', label: 'Terça' },
    { value: 'WEDNESDAY', label: 'Quarta' },
    { value: 'THURSDAY', label: 'Quinta' },
    { value: 'FRIDAY', label: 'Sexta' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' },
];

const levelColors = {
    BEGINNER: 'bg-emerald-100 text-emerald-700',
    INTERMEDIARY: 'bg-amber-100 text-amber-700',
    ADVANCED: 'bg-red-100 text-red-700',
};

const statusColors = {
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-slate-100 text-slate-700',
    CANCELED: 'bg-red-100 text-red-700',
};

const DAY_FULL_LABELS: Record<string, string> = {
    MONDAY: 'Segunda-feira',
    TUESDAY: 'Terça-feira',
    WEDNESDAY: 'Quarta-feira',
    THURSDAY: 'Quinta-feira',
    FRIDAY: 'Sexta-feira',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo',
};

function loadArchivedIds(): number[] {
    try {
        const raw = localStorage.getItem(ARCHIVED_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function AttendanceClassCard({ classItem, index, isArchivedView, isFinished, onNotify }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Music className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{classItem.beat?.name || 'Sem ritmo'}</h3>
                                <p className="text-sm text-slate-500">
                                    {DAYS.find((d) => d.value === classItem.dayWeek)?.label || classItem.dayWeek}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className={levelColors[classItem.level]}>
                            {LEVELS.find((l) => l.value === classItem.level)?.label || classItem.level}
                        </Badge>
                        <Badge className={statusColors[classItem.status]}>
                            {STATUSES.find((s) => s.value === classItem.status)?.label || classItem.status}
                        </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>{classItem.startSchedule?.slice(0, 5)} - {classItem.endSchedule?.slice(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>
                                {classItem.startDate && format(new Date(classItem.startDate), 'dd/MM/yy')} - {classItem.endDate && format(new Date(classItem.endDate), 'dd/MM/yy')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>{classItem.enrollments?.length || 0} alunos matriculados</span>
                        </div>
                    </div>

                    <Button
                        className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/30"
                        onClick={() => onNotify(classItem)}
                        disabled={isFinished || isArchivedView}
                    >
                        <ClipboardCheck className="w-4 h-4 mr-2" />
                        Notificar Turma
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function toList(data) {
    if (data == null) return [];
    if (Array.isArray(data)) return data;
    if (data?.content && Array.isArray(data.content)) return data.content;
    if (typeof data === 'object' && Array.isArray(data._embedded?.dancingClasses)) return data._embedded.dancingClasses;
    return [];
}

export default function StudentAttendance() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
    const [archivedClassIds, setArchivedClassIds] = useState<number[]>(() => loadArchivedIds());

    useEffect(() => {
        loadData();
    }, []);

    const activeClasses = useMemo(() => classes.filter((c) => !archivedClassIds.includes(c.id)), [classes, archivedClassIds]);
    const archivedClasses = useMemo(() => classes.filter((c) => archivedClassIds.includes(c.id)), [classes, archivedClassIds]);

    const classesByDay = useMemo(() => {
        const list = activeTab === 'active' ? activeClasses : archivedClasses;
        const byDay: Record<string, typeof list> = {};
        DAY_ORDER.forEach((day) => { byDay[day] = []; });
        list.forEach((c) => {
            const day = c.dayWeek || 'MONDAY';
            if (!byDay[day]) byDay[day] = [];
            byDay[day].push(c);
        });
        DAY_ORDER.forEach((day) => {
            byDay[day].sort((a, b) => {
                const aFinished = FINISHED_STATUSES.includes(a.status);
                const bFinished = FINISHED_STATUSES.includes(b.status);
                if (aFinished !== bFinished) return aFinished ? 1 : -1;
                if (aFinished) return 0;
                const endA = a.endDate ? new Date(a.endDate).getTime() : 0;
                const endB = b.endDate ? new Date(b.endDate).getTime() : 0;
                return endA - endB;
            });
        });
        return byDay;
    }, [activeTab, activeClasses, archivedClasses]);

    const loadData = async () => {
        try {
            const classesData = await ludusApi.getDancingClasses(0, 500);
            const classList = toList(classesData);
            setClasses(classList);
            setArchivedClassIds((prev) => {
                const validIds = prev.filter((id) => classList.some((c) => c.id === id));
                if (validIds.length !== prev.length) return validIds;
                return prev;
            });
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openClassAttendance = (classItem) => {
        navigate(createPageUrl('class-attendance'), { state: { dancingClass: classItem } });
    };

    const isFinished = (classItem) => FINISHED_STATUSES.includes(classItem.status);
    const displayClasses = activeTab === 'active' ? activeClasses : archivedClasses;
    const hasAnyGroup = DAY_ORDER.some((day) => classesByDay[day].length > 0);

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <ClipboardCheck className="w-8 h-8 text-cyan-500" />
                        Presença de Alunos
                    </h1>
                    <p className="text-slate-500 mt-1">Registre a presença por turma e data</p>
                </div>
            </motion.div>

            <div className="flex gap-2 border-b border-slate-200 pb-2">
                <Button
                    variant={activeTab === 'active' ? 'default' : 'ghost'}
                    size="sm"
                    className={activeTab === 'active' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
                    onClick={() => setActiveTab('active')}
                >
                    Turmas ativas
                    {activeClasses.length > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-white/20">{activeClasses.length}</Badge>
                    )}
                </Button>
                <Button
                    variant={activeTab === 'archived' ? 'default' : 'ghost'}
                    size="sm"
                    className={activeTab === 'archived' ? 'bg-slate-600 hover:bg-slate-700' : ''}
                    onClick={() => setActiveTab('archived')}
                >
                    Arquivadas
                    {archivedClasses.length > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-white/20">{archivedClasses.length}</Badge>
                    )}
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                </div>
            ) : displayClasses.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                    <CardContent className="text-center py-20 text-slate-500">
                        <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium">
                            {activeTab === 'active' ? 'Nenhuma turma cadastrada' : 'Nenhuma turma arquivada'}
                        </p>
                        <p className="text-sm">
                            {activeTab === 'active' ? 'Cadastre turmas em Turmas para registrar presença' : 'Arquive turmas na aba Turmas ativas'}
                        </p>
                    </CardContent>
                </Card>
            ) : !hasAnyGroup ? (
                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                    <CardContent className="text-center py-20 text-slate-500">
                        <p className="text-lg font-medium">Nenhuma turma nesta aba</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {DAY_ORDER.map((day) => {
                        const dayClasses = classesByDay[day] || [];
                        if (dayClasses.length === 0) return null;
                        const dayLabel = DAY_FULL_LABELS[day] ?? day;
                        return (
                            <motion.div
                                key={day}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-cyan-500" />
                                    {dayLabel}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <AnimatePresence>
                                        {dayClasses.map((classItem, index) => (
                                            <AttendanceClassCard
                                                key={classItem.id}
                                                classItem={classItem}
                                                index={index}
                                                isArchivedView={activeTab === 'archived'}
                                                isFinished={isFinished(classItem)}
                                                onNotify={openClassAttendance}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
