import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, GraduationCap, Trash2, Loader2, Clock, Calendar, Music, Users, UserPlus } from "lucide-react";
import { ludusApi } from "@/components/api/ludusApi";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

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

export default function DancingClasses() {
    const [classes, setClasses] = useState([]);
    const [beats, setBeats] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);
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

    const loadData = async () => {
        try {
            const [classesData, beatsData, studentsData] = await Promise.all([
                ludusApi.getDancingClasses(0, 100),
                ludusApi.getBeats(0, 100),
                ludusApi.getStudents(0, 100)
            ]);
            setClasses(Array.isArray(classesData) ? classesData : []);
            setBeats(Array.isArray(beatsData) ? beatsData : []);
            setStudents(Array.isArray(studentsData) ? studentsData : []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
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

    const handleEnroll = async () => {
        if (!selectedClass || selectedStudents.length === 0) return;
        setSubmitting(true);
        try {
            await ludusApi.registerStudents(selectedClass.id, selectedStudents);
            setEnrollDialogOpen(false);
            setSelectedStudents([]);
            setSelectedClass(null);
            loadData();
        } catch (error) {
            console.error('Error enrolling students:', error);
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

    const openEnrollDialog = (classItem) => {
        setSelectedClass(classItem);
        setSelectedStudents(classItem.students?.map(s => s.id) || []);
        setEnrollDialogOpen(true);
    };

    const toggleStudent = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

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

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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

            {/* Classes Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
                </div>
            ) : classes.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                    <CardContent className="text-center py-20 text-slate-500">
                        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium">Nenhuma turma cadastrada</p>
                        <p className="text-sm">Crie a primeira turma para começar</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {classes.map((classItem, index) => (
                            <motion.div
                                key={classItem.id}
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
                                                        {DAYS.find(d => d.value === classItem.dayWeek)?.label || classItem.dayWeek}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(classItem.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <Badge className={levelColors[classItem.level]}>
                                                {LEVELS.find(l => l.value === classItem.level)?.label || classItem.level}
                                            </Badge>
                                            <Badge className={statusColors[classItem.status]}>
                                                {STATUSES.find(s => s.value === classItem.status)?.label || classItem.status}
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
                                                <span>{classItem.students?.length || 0} alunos matriculados</span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            className="w-full mt-4 border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50"
                                            onClick={() => openEnrollDialog(classItem)}
                                        >
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Matricular Alunos
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Enroll Dialog */}
            <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Matricular Alunos</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4 max-h-96 overflow-y-auto">
                        {students.map(student => (
                            <div key={student.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50">
                                <Checkbox
                                    id={`student-${student.id}`}
                                    checked={selectedStudents.includes(student.id)}
                                    onCheckedChange={() => toggleStudent(student.id)}
                                />
                                <label htmlFor={`student-${student.id}`} className="flex-1 cursor-pointer">
                                    <p className="font-medium text-slate-800">{student.name}</p>
                                    <p className="text-sm text-slate-500">{student.contact}</p>
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleEnroll} disabled={submitting} className="bg-gradient-to-r from-fuchsia-600 to-pink-600">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}