import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, GraduationCap, Trash2, Loader2, Clock, Calendar, Music, Users, UserPlus, Archive, ArchiveRestore } from "lucide-react";
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

function ClassCard({ classItem, index, isArchivedView, isFinished, onArchive, onUnarchive, onDelete, onEnroll }) {
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
                            <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Music className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{classItem.beat?.name || 'Sem ritmo'}</h3>
                                <p className="text-sm text-slate-500">
                                    {DAYS.find((d) => d.value === classItem.dayWeek)?.label || classItem.dayWeek}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isArchivedView ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onUnarchive(classItem.id)}
                                    className="text-violet-500 hover:text-violet-600 hover:bg-violet-50"
                                    title="Desarquivar"
                                >
                                    <ArchiveRestore className="w-4 h-4" />
                                </Button>
                            ) : (
                                <>
                                    {isFinished && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onArchive(classItem.id)}
                                            className="text-slate-500 hover:text-slate-600 hover:bg-slate-100"
                                            title="Arquivar"
                                        >
                                            <Archive className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(classItem.id)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        title="Excluir turma"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
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
                        variant="outline"
                        className="w-full mt-4 border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50 disabled:opacity-50 disabled:pointer-events-none"
                        onClick={() => onEnroll(classItem)}
                        disabled={isFinished || isArchivedView}
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Matricular Alunos
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}

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

function saveArchivedIds(ids: number[]) {
    localStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(ids));
}

export default function DancingClasses() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [beats, setBeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
    const [archivedClassIds, setArchivedClassIds] = useState<number[]>(() => loadArchivedIds());
    const [formData, setFormData] = useState({
        level: '',
        status: 'IN_PROGRESS',
        dayWeek: '',
        startSchedule: '',
        endSchedule: '',
        startDate: '',
        endDate: '',
        beatId: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const activeClasses = useMemo(() => {
        return classes.filter((c) => !archivedClassIds.includes(c.id));
    }, [classes, archivedClassIds]);

    const archivedClasses = useMemo(() => {
        return classes.filter((c) => archivedClassIds.includes(c.id));
    }, [classes, archivedClassIds]);

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

    const toList = (data) => {
        if (data == null) return [];
        if (Array.isArray(data)) return data;
        if (data?.content && Array.isArray(data.content)) return data.content;
        if (typeof data === 'object' && Array.isArray(data._embedded?.dancingClasses)) return data._embedded.dancingClasses;
        return [];
    };

    const loadData = async () => {
        try {
            const [classesData, beatsData] = await Promise.all([
                ludusApi.getDancingClasses(0, 500),
                ludusApi.getBeats(0, 500)
            ]);
            const classList = toList(classesData);
            setClasses(classList);
            setBeats(toList(beatsData));
            setArchivedClassIds((prev) => {
                const validIds = prev.filter((id) => classList.some((c) => c.id === id));
                const allWouldBeArchived = classList.length > 0 && classList.every((c) => validIds.includes(c.id));
                if (allWouldBeArchived) {
                    saveArchivedIds([]);
                    return [];
                }
                if (validIds.length !== prev.length) {
                    saveArchivedIds(validIds);
                    return validIds;
                }
                return prev;
            });
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBeatsWhenOpeningDialog = async () => {
        try {
            const beatsData = await ludusApi.getBeats(0, 100);
            setBeats(toList(beatsData));
        } catch (error) {
            console.error('Error loading beats:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await ludusApi.createDancingClass({
                ...formData,
                beatId: parseInt(formData.beatId)
            });
            setDialogOpen(false);
            setFormData({
                level: '', status: 'IN_PROGRESS', dayWeek: '',
                startSchedule: '', endSchedule: '', startDate: '', endDate: '', beatId: ''
            });
            loadData();
        } catch (error) {
            console.error('Error creating class:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja remover esta turma?')) return;
        try {
            await ludusApi.deleteDancingClass(id);
            loadData();
        } catch (error) {
            console.error('Error deleting class:', error);
        }
    };

    const openEnrollPage = (classItem) => {
        navigate(createPageUrl('ClassEnrollment'), { state: { dancingClass: classItem } });
    };

    const handleArchive = (id: number) => {
        setArchivedClassIds((prev) => {
            const next = [...prev, id];
            saveArchivedIds(next);
            return next;
        });
    };

    const handleUnarchive = (id: number) => {
        setArchivedClassIds((prev) => {
            const next = prev.filter((x) => x !== id);
            saveArchivedIds(next);
            return next;
        });
    };

    const isFinished = (classItem) => FINISHED_STATUSES.includes(classItem.status);
    const displayClasses = activeTab === 'active' ? activeClasses : archivedClasses;
    const hasAnyGroup = DAY_ORDER.some((day) => classesByDay[day].length > 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-fuchsia-500" />
                        Turmas
                    </h1>
                    <p className="text-slate-500 mt-1">Gerencie as turmas de dança</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (open) loadBeatsWhenOpeningDialog(); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 shadow-lg shadow-fuchsia-500/30">
                            <Plus className="w-5 h-5 mr-2" />
                            Nova Turma
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Criar Turma</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nível</Label>
                                    <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                        <SelectContent>
                                            {LEVELS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                        <SelectContent>
                                            {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Dia da Semana</Label>
                                    <Select value={formData.dayWeek} onValueChange={(v) => setFormData({ ...formData, dayWeek: v })}>
                                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                        <SelectContent>
                                            {DAYS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ritmo</Label>
                                    <Select value={formData.beatId} onValueChange={(v) => setFormData({ ...formData, beatId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                        <SelectContent>
                                            {beats.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Hora Início</Label>
                                    <Input type="time" value={formData.startSchedule} onChange={(e) => setFormData({ ...formData, startSchedule: e.target.value + ':00' })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Hora Fim</Label>
                                    <Input type="time" value={formData.endSchedule} onChange={(e) => setFormData({ ...formData, endSchedule: e.target.value + ':00' })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Data Início</Label>
                                    <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data Fim</Label>
                                    <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-fuchsia-600 to-pink-600">
                                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : 'Criar Turma'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
                <Button
                    variant={activeTab === 'active' ? 'default' : 'ghost'}
                    size="sm"
                    className={activeTab === 'active' ? 'bg-fuchsia-600 hover:bg-fuchsia-700' : ''}
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

            {/* Classes by day */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
                </div>
            ) : displayClasses.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                    <CardContent className="text-center py-20 text-slate-500">
                        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium">
                            {activeTab === 'active' ? 'Nenhuma turma cadastrada' : 'Nenhuma turma arquivada'}
                        </p>
                        <p className="text-sm">
                            {activeTab === 'active' ? 'Crie a primeira turma para começar' : 'Arquive turmas finalizadas na aba Turmas ativas'}
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
                                    <Calendar className="w-5 h-5 text-fuchsia-500" />
                                    {dayLabel}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <AnimatePresence>
                                        {dayClasses.map((classItem, index) => (
                                            <ClassCard
                                                key={classItem.id}
                                                classItem={classItem}
                                                index={index}
                                                isArchivedView={activeTab === 'archived'}
                                                isFinished={isFinished(classItem)}
                                                onArchive={handleArchive}
                                                onUnarchive={handleUnarchive}
                                                onDelete={handleDelete}
                                                onEnroll={openEnrollPage}
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