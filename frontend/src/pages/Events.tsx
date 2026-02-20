import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  Clock,
  Users,
  Loader2,
  Trash2,
  UserPlus,
  Edit3,
  PartyPopper,
  Archive,
  Eye,
} from "lucide-react";
import { ludusApi } from "@/components/api/ludusApi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const EVENT_STATUSES = [
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'FINISHED', label: 'Finalizado' },
];

const statusColors: Record<string, string> = {
  IN_PROGRESS: 'bg-emerald-100 text-emerald-700',
  FINISHED: 'bg-slate-100 text-slate-600',
};

type EventItem = {
  id: number;
  name: string;
  eventDate: string;
  eventTime: string;
  hasMaxParticipants?: boolean;
  maxParticipants: number;
  status: string;
  participants?: { studentId: number; student?: { id: number; name: string } }[];
};

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [students, setStudents] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [detailDialogEvent, setDetailDialogEvent] = useState<EventItem | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    eventDate: '',
    eventTime: '',
    hasMaxParticipants: true,
    maxParticipants: 20,
    status: 'IN_PROGRESS',
  });

  const activeEvents = useMemo(
    () => events.filter((e) => e.status !== 'FINISHED'),
    [events]
  );

  const archivedEvents = useMemo(
    () =>
      events
        .filter((e) => e.status === 'FINISHED')
        .sort((a, b) => {
          const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
          const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
          return dateB - dateA;
        }),
    [events]
  );

  const displayEvents = activeTab === 'active' ? activeEvents : archivedEvents;

  useEffect(() => {
    loadEvents();
    loadStudents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await ludusApi.getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading events:', e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await ludusApi.getStudents(0, 500);
      const list = Array.isArray(data) ? data : [];
      setStudents(list.map((s: { id: number; name: string }) => ({ id: s.id, name: s.name ?? '' })));
    } catch (e) {
      console.error('Error loading students:', e);
    }
  };

  const openCreate = () => {
    setEditingEvent(null);
    setForm({
      name: '',
      eventDate: '',
      eventTime: '',
      hasMaxParticipants: true,
      maxParticipants: 20,
      status: 'IN_PROGRESS',
    });
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (event: EventItem) => {
    setEditingEvent(event);
    const hasLimit = event.hasMaxParticipants !== false;
    setForm({
      name: event.name,
      eventDate: event.eventDate || '',
      eventTime: event.eventTime?.substring?.(0, 5) ?? event.eventTime ?? '',
      hasMaxParticipants: hasLimit,
      maxParticipants: event.maxParticipants ?? 20,
      status: event.status || 'IN_PROGRESS',
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.hasMaxParticipants && (!form.maxParticipants || Number(form.maxParticipants) < 1)) {
      setError('Informe a quantidade máxima de alunos quando o limite estiver ativo.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        eventDate: form.eventDate,
        eventTime: form.eventTime.length === 5 ? form.eventTime + ':00' : form.eventTime,
        hasMaxParticipants: form.hasMaxParticipants,
        maxParticipants: form.hasMaxParticipants ? (Number(form.maxParticipants) || 20) : 0,
        status: form.status,
      };
      if (editingEvent) {
        await ludusApi.updateEvent(editingEvent.id, payload);
      } else {
        await ludusApi.createEvent(payload);
      }
      setDialogOpen(false);
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este evento? Esta ação não remove os participantes do histórico.')) return;
    try {
      await ludusApi.deleteEvent(id);
      loadEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const handleStatusChange = async (event: EventItem, newStatus: string) => {
    try {
      await ludusApi.updateEventStatus(event.id, newStatus);
      setEvents((prev) =>
        prev.map((ev) => (ev.id === event.id ? { ...ev, status: newStatus } : ev))
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAddParticipant = async (event: EventItem, studentId: number) => {
    setError(null);
    try {
      await ludusApi.addEventParticipant(event.id, studentId);
      loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar participante.');
    }
  };

  const handleRemoveParticipant = async (event: EventItem, studentId: number) => {
    if (!confirm('Remover este participante do evento?')) return;
    try {
      await ludusApi.removeEventParticipant(event.id, studentId);
      loadEvents();
    } catch (err) {
      console.error('Error removing participant:', err);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <PartyPopper className="w-8 h-8 text-violet-500" />
            Eventos
          </h1>
          <p className="text-slate-500 mt-1">
            Bailes, workshops e outras atividades extras
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreate}
              disabled={activeTab !== 'active'}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 shadow-lg shadow-violet-500/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingEvent ? 'Editar Evento' : 'Cadastrar Evento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="eventName">Nome do evento</Label>
                <Input
                  id="eventName"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Baile de Forró, Workshop de Zouk"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Data</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventTime">Horário</Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={form.eventTime}
                    onChange={(e) => setForm((f) => ({ ...f, eventTime: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasMaxParticipants"
                  checked={form.hasMaxParticipants}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({
                      ...f,
                      hasMaxParticipants: checked === true,
                      maxParticipants: checked === true ? (f.maxParticipants || 20) : 0,
                    }))
                  }
                />
                <Label htmlFor="hasMaxParticipants" className="font-normal cursor-pointer">
                  Possui limite máximo de alunos
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">
                  Vagas máximas {form.hasMaxParticipants && '(obrigatório)'}
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min={1}
                  value={form.hasMaxParticipants ? form.maxParticipants : ''}
                  placeholder={form.hasMaxParticipants ? undefined : 'Sem limite'}
                  disabled={!form.hasMaxParticipants}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxParticipants: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              {editingEvent && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-violet-500 to-purple-600">
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                  ) : (
                    editingEvent ? 'Salvar' : 'Cadastrar'
                  )}
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
          className={activeTab === 'active' ? 'bg-violet-600 hover:bg-violet-700' : ''}
          onClick={() => setActiveTab('active')}
        >
          Eventos ativos
          {activeEvents.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-white/20">{activeEvents.length}</Badge>
          )}
        </Button>
        <Button
          variant={activeTab === 'archived' ? 'default' : 'ghost'}
          size="sm"
          className={activeTab === 'archived' ? 'bg-slate-600 hover:bg-slate-700' : ''}
          onClick={() => setActiveTab('archived')}
        >
          Eventos Arquivados
          {archivedEvents.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-white/20">{archivedEvents.length}</Badge>
          )}
        </Button>
      </div>

      {error && !dialogOpen && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : displayEvents.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="text-center py-20 text-slate-500">
            <PartyPopper className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="font-medium">
              {activeTab === 'active' ? 'Nenhum evento ativo' : 'Nenhum evento arquivado'}
            </p>
            <p className="text-sm mt-1">
              {activeTab === 'active'
                ? 'Cadastre bailes e workshops ou finalize eventos para vê-los aqui.'
                : 'Eventos finalizados aparecem aqui, ordenados do mais recente ao mais antigo.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {displayEvents.map((event, index) => {
              const participants = event.participants ?? [];
              const count = participants.length;
              const hasLimit = event.hasMaxParticipants !== false;
              const max = event.maxParticipants ?? 0;
              const isFull = hasLimit && count >= max;
              const isFinished = event.status === 'FINISHED';
              const canAdd = !isFinished && (!hasLimit || !isFull);
              const participantIds = participants.map((p) =>
                p.studentId ?? (p as { id?: { studentId?: number } }).id?.studentId ?? p.student?.id
              ).filter(Boolean);
              const availableStudents = students.filter((s) => !participantIds.includes(s.id));
              const isArchivedView = activeTab === 'archived';

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="bg-white/80 backdrop-blur border-0 shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 border-b border-slate-100">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800">{event.name}</h3>
                              <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                                <Calendar className="w-4 h-4" />
                                {event.eventDate
                                  ? format(new Date(event.eventDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                  : '—'}
                                <span className="flex items-center gap-1 ml-2">
                                  <Clock className="w-4 h-4" />
                                  {event.eventTime?.substring?.(0, 5) ?? event.eventTime ?? '—'}
                                </span>
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    statusColors[event.status] ?? 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {EVENT_STATUSES.find((s) => s.value === event.status)?.label ?? event.status}
                                </span>
                                <span className="text-sm text-slate-500 flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {hasLimit ? `${count} / ${max} vagas` : `${count} participantes (sem limite)`}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isArchivedView ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDetailDialogEvent(event)}
                                  className="border-violet-200 text-violet-600 hover:bg-violet-50"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver detalhes
                                </Button>
                              </>
                            ) : (
                              <>
                                <Select
                                  value={event.status}
                                  onValueChange={(v) => handleStatusChange(event, v)}
                                >
                                  <SelectTrigger className="w-[160px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {EVENT_STATUSES.map((s) => (
                                      <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openEdit(event)}
                                  title="Editar evento"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(event.id)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  title="Excluir evento"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {hasLimit && !isArchivedView && (
                        <div className="p-6 bg-slate-50/50">
                          <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Participantes
                          </h4>
                          <div className="flex flex-wrap gap-3 mb-4">
                            <Select
                              value=""
                              onValueChange={(v) => {
                                const id = Number(v);
                                if (id) handleAddParticipant(event, id);
                              }}
                              disabled={!canAdd || availableStudents.length === 0}
                            >
                              <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder={
                                  isFinished
                                    ? 'Evento finalizado'
                                    : isFull
                                      ? 'Vagas esgotadas'
                                      : availableStudents.length === 0
                                        ? 'Todos já inscritos'
                                        : 'Adicionar aluno'
                                } />
                              </SelectTrigger>
                              <SelectContent>
                                {availableStudents.map((s) => (
                                  <SelectItem key={s.id} value={String(s.id)}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {participants.length === 0 ? (
                            <p className="text-sm text-slate-500">Nenhum participante inscrito.</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Aluno</TableHead>
                                  {!isFinished && <TableHead className="w-[80px]">Ação</TableHead>}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {participants.map((p) => {
                                  const name = p.student?.name ?? 'Aluno';
                                  const sid = p.studentId ?? (p as { id?: { studentId?: number } }).id?.studentId ?? p.student?.id;
                                  return (
                                    <TableRow key={sid ?? name}>
                                      <TableCell>{name}</TableCell>
                                      {!isFinished && (
                                        <TableCell>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600"
                                            onClick={() => sid != null && handleRemoveParticipant(event, sid)}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </TableCell>
                                      )}
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      )}
                      {isArchivedView && hasLimit && (
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                          <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Participantes ({count})
                          </h4>
                          {participants.length === 0 ? (
                            <p className="text-sm text-slate-500">Nenhum participante inscrito.</p>
                          ) : (
                            <ul className="text-sm text-slate-600 space-y-1">
                              {participants.slice(0, 5).map((p) => (
                                <li key={p.studentId ?? p.student?.id}>{p.student?.name ?? 'Aluno'}</li>
                              ))}
                              {participants.length > 5 && (
                                <li className="text-slate-500">+{participants.length - 5} mais</li>
                              )}
                            </ul>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Dialog: detalhes do evento arquivado (somente leitura) */}
      <Dialog open={!!detailDialogEvent} onOpenChange={(open) => !open && setDetailDialogEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Archive className="w-5 h-5 text-slate-500" />
              Detalhes do evento
            </DialogTitle>
          </DialogHeader>
          {detailDialogEvent && (
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-slate-500 text-xs">Nome</Label>
                <p className="font-medium text-slate-800">{detailDialogEvent.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500 text-xs">Data</Label>
                  <p className="text-slate-800">
                    {detailDialogEvent.eventDate
                      ? format(new Date(detailDialogEvent.eventDate), "dd/MM/yyyy", { locale: ptBR })
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Horário</Label>
                  <p className="text-slate-800">
                    {detailDialogEvent.eventTime?.substring?.(0, 5) ?? detailDialogEvent.eventTime ?? '—'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-slate-500 text-xs">Status</Label>
                <p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[detailDialogEvent.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {EVENT_STATUSES.find((s) => s.value === detailDialogEvent.status)?.label ?? detailDialogEvent.status}
                  </span>
                </p>
              </div>
              <div>
                <Label className="text-slate-500 text-xs">Vagas</Label>
                <p className="text-slate-800">
                  {detailDialogEvent.hasMaxParticipants !== false
                    ? `${(detailDialogEvent.participants ?? []).length} / ${detailDialogEvent.maxParticipants ?? 0} preenchidas`
                    : `${(detailDialogEvent.participants ?? []).length} participantes (sem limite)`}
                </p>
              </div>
              {detailDialogEvent.hasMaxParticipants !== false && (detailDialogEvent.participants ?? []).length > 0 && (
                <div>
                  <Label className="text-slate-500 text-xs">Participantes</Label>
                  <ul className="mt-1 text-sm text-slate-700 space-y-1 max-h-40 overflow-y-auto">
                    {(detailDialogEvent.participants ?? []).map((p) => (
                      <li key={p.studentId ?? p.student?.id}>{p.student?.name ?? 'Aluno'}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setDetailDialogEvent(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
