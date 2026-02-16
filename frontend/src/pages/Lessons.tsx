import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Calendar, 
  Trash2, 
  Loader2,
  Clock,
  Music,
  Filter
} from "lucide-react";
import { ludusApi } from "@/components/api/ludusApi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    day: '',
    startSchedule: '',
    endSchedule: '',
    dancingClassId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadLessons();
    }
  }, [selectedClassId]);

  const loadClasses = async () => {
    try {
      const data = await ludusApi.getDancingClasses(0, 100);
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadLessons = async () => {
    setLoading(true);
    try {
      const data = await ludusApi.getLessons(parseInt(selectedClassId), 0, 100);
      setLessons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading lessons:', error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ludusApi.createLesson({
        ...formData,
        dancingClassId: parseInt(formData.dancingClassId)
      });
      setDialogOpen(false);
      setFormData({ day: '', startSchedule: '', endSchedule: '', dancingClassId: '' });
      if (selectedClassId) loadLessons();
    } catch (error) {
      console.error('Error creating lesson:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover esta aula?')) return;
    try {
      await ludusApi.deleteLesson(id);
      loadLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
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
            <Calendar className="w-8 h-8 text-emerald-500" />
            Aulas
          </h1>
          <p className="text-slate-500 mt-1">Registre e gerencie as aulas realizadas</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/30">
              <Plus className="w-5 h-5 mr-2" />
              Nova Aula
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Registrar Aula</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Turma</Label>
                <Select 
                  value={formData.dancingClassId} 
                  onValueChange={(v) => setFormData({ ...formData, dancingClassId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione a turma" /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.beat?.name} - {c.dayWeek}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data da Aula</Label>
                <Input 
                  type="date" 
                  value={formData.day} 
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })} 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora Início</Label>
                  <Input 
                    type="time" 
                    value={formData.startSchedule?.slice(0,5)} 
                    onChange={(e) => setFormData({ ...formData, startSchedule: e.target.value + ':00' })} 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora Fim</Label>
                  <Input 
                    type="time" 
                    value={formData.endSchedule?.slice(0,5)} 
                    onChange={(e) => setFormData({ ...formData, endSchedule: e.target.value + ':00' })} 
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                  ) : (
                    'Registrar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-600">Filtrar por turma:</span>
        </div>
        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
          <SelectTrigger className="w-64 bg-white">
            <SelectValue placeholder="Selecione uma turma" />
          </SelectTrigger>
          <SelectContent>
            {classes.map(c => (
              <SelectItem key={c.id} value={c.id.toString()}>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-fuchsia-500" />
                  {c.beat?.name} - {c.dayWeek}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg shadow-emerald-500/5 overflow-hidden">
          <CardContent className="p-0">
            {!selectedClassId ? (
              <div className="text-center py-20 text-slate-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium">Selecione uma turma</p>
                <p className="text-sm">Escolha uma turma acima para ver suas aulas</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium">Nenhuma aula registrada</p>
                <p className="text-sm">Registre a primeira aula desta turma</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold">Data</TableHead>
                    <TableHead className="font-semibold">Horário</TableHead>
                    <TableHead className="font-semibold">Turma</TableHead>
                    <TableHead className="font-semibold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {lessons.map((lesson, index) => (
                      <motion.tr
                        key={lesson.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-emerald-50/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {lesson.day && format(new Date(lesson.day), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {lesson.startSchedule?.slice(0, 5)} - {lesson.endSchedule?.slice(0, 5)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4 text-fuchsia-500" />
                            {lesson.dancingClass?.beat?.name || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(lesson.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}