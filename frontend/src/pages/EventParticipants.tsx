import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  PartyPopper,
  Ticket,
  Users,
  Search,
  User,
} from "lucide-react";
import { ludusApi } from "@/components/api/ludusApi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type EventParticipant = {
  id?: number;
  studentId?: number;
  externalParticipantName?: string;
  amountPaid?: number;
  student?: { id: number; name: string };
};

type EventDetails = {
  id: number;
  name: string;
  eventDate: string;
  eventTime: string;
  hasMaxParticipants?: boolean;
  maxParticipants: number;
  status: string;
  participants?: EventParticipant[];
};

const EVENT_STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: 'Em andamento',
  FINISHED: 'Finalizado',
};

const getEventStatusLabel = (status: string) =>
  EVENT_STATUS_LABELS[status] ?? status;

type LocationState = {
  eventId?: number;
  event?: EventDetails;
};

export default function EventParticipants() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const initialEvent = state.event ?? null;
  const eventId = state.eventId ?? initialEvent?.id ?? null;

  const [event, setEvent] = useState<EventDetails | null>(initialEvent);
  const [loadingEvent, setLoadingEvent] = useState<boolean>(!initialEvent);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studentSearch, setStudentSearch] = useState('');
  const [studentOptions, setStudentOptions] = useState<{ id: number; name: string }[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const [externalParticipantName, setExternalParticipantName] = useState('');
  const [amountPaid, setAmountPaid] = useState<string>('');

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const number = Number(digits) / 100;
    return number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  };

  useEffect(() => {
    if (!eventId) {
      navigate(createPageUrl('events'), { replace: true });
      return;
    }
    if (!initialEvent) {
      loadEvent(eventId);
    }
  }, [eventId, initialEvent, navigate]);

  const loadEvent = async (id: number) => {
    setLoadingEvent(true);
    setError(null);
    try {
      const data = await ludusApi.getEvent(id);
      setEvent(data as EventDetails);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar evento.';
      setError(message);
    } finally {
      setLoadingEvent(false);
    }
  };

  const parseStudentList = (data: any): { id: number; name: string }[] => {
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data?._embedded?.students)
          ? data._embedded.students
          : [];
    return list.map((s: { id: number; name?: string }) => ({
      id: s.id,
      name: s.name ?? '',
    }));
  };

  useEffect(() => {
    let active = true;
    const loadInitialStudents = async () => {
      setStudentLoading(true);
      try {
        const data = await ludusApi.getStudentsForCombo(20);
        if (!active) return;
        setStudentOptions(parseStudentList(data));
      } catch (err) {
        if (active) {
          console.error('Error loading students:', err);
        }
      } finally {
        if (active) {
          setStudentLoading(false);
        }
      }
    };

    loadInitialStudents();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setStudentLoading(true);
      try {
        const search = studentSearch.trim();
        const data = search
          ? await ludusApi.searchStudentsByName(search, 0, 20)
          : await ludusApi.getStudentsForCombo(20);
        if (!active) return;
        setStudentOptions(parseStudentList(data));
      } catch (err) {
        if (active) {
          console.error('Error searching students:', err);
        }
      } finally {
        if (active) {
          setStudentLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [studentSearch]);

  const participants = useMemo<EventParticipant[]>(() => event?.participants ?? [], [event]);
  const registeredStudentIds = useMemo(
    () =>
      new Set(
        participants
          .map((p) => p.student?.id ?? p.studentId)
          .filter((id): id is number => typeof id === 'number')
      ),
    [participants]
  );
  const availableStudentOptions = useMemo(
    () => studentOptions.filter((s) => !registeredStudentIds.has(s.id)),
    [studentOptions, registeredStudentIds]
  );

  const totalPaidParticipants = useMemo(
    () => participants.filter((p) => (p.amountPaid ?? 0) > 0).length,
    [participants]
  );

  const totalAmount = useMemo(
    () => participants.reduce((sum, p) => sum + (p.amountPaid ?? 0), 0),
    [participants]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    const hasStudent = !!selectedStudentId;
    const hasExternal = !!externalParticipantName.trim();

    if (!hasStudent && !hasExternal) {
      setError('Selecione um aluno ou informe o nome de um participante externo.');
      return;
    }

    const numericAmount = amountPaid.replace(/[^\d]/g, '');
    const amount = Number(numericAmount) / 100;
    if (!amount || amount <= 0) {
      setError('Informe um valor pago válido (maior que zero).');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await ludusApi.addEventParticipant(
        eventId,
        hasStudent
          ? { studentId: Number(selectedStudentId), amountPaid: amount }
          : { externalParticipantName: externalParticipantName.trim(), amountPaid: amount }
      );
      await loadEvent(eventId);
      setSelectedStudentId('');
      setStudentSearch('');
      setStudentDropdownOpen(false);
      setExternalParticipantName('');
      setAmountPaid('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao incluir participante.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!eventId) {
    return null;
  }

  const formattedTotalAmount = totalAmount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl('events'))}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <PartyPopper className="w-8 h-8 text-violet-500" />
              Participantes do Evento
            </h1>
            {event && (
              <p className="text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-700">{event.name}</span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  {event.eventDate
                    ? format(new Date(event.eventDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : '—'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {event.eventTime?.substring?.(0, 5) ?? event.eventTime ?? '—'}
                </span>
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      {loadingEvent || !event ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        Incluir participante
                      </h2>
                      <p className="text-sm text-slate-500">
                        Cadastre alunos ou convidados externos com o valor pago.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Aluno</Label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          placeholder="Digite para buscar alunos"
                          className="pl-9"
                          value={studentSearch}
                          onChange={(e) => {
                            setStudentSearch(e.target.value);
                            setSelectedStudentId('');
                            setStudentDropdownOpen(true);
                          }}
                          onFocus={() => {
                            if (availableStudentOptions.length > 0) {
                              setStudentDropdownOpen(true);
                            }
                          }}
                          onBlur={() => {
                            // pequeno atraso para permitir clique nas opções
                            setTimeout(() => setStudentDropdownOpen(false), 150);
                          }}
                        />
                        {studentDropdownOpen && (
                          <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg max-h-56 overflow-y-auto">
                            {studentLoading && (
                              <div className="px-3 py-2 text-xs text-slate-500">
                                Buscando alunos...
                              </div>
                            )}
                            {!studentLoading && availableStudentOptions.length === 0 && (
                              <div className="px-3 py-2 text-xs text-slate-500">
                                Nenhum aluno encontrado
                              </div>
                            )}
                            {!studentLoading &&
                              availableStudentOptions.map((s) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${
                                    selectedStudentId === String(s.id)
                                      ? 'bg-violet-50 text-violet-700'
                                      : 'text-slate-700'
                                  }`}
                                  onMouseDown={(e) => {
                                    // evita blur antes do clique ser processado
                                    e.preventDefault();
                                  }}
                                  onClick={() => {
                                    setSelectedStudentId(String(s.id));
                                    setStudentSearch(s.name);
                                    setStudentDropdownOpen(false);
                                  }}
                                >
                                  {s.name}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Opcional. Caso o participante não seja aluno, preencha apenas o campo abaixo.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Participante externo</Label>
                      <Input
                        placeholder="Nome do participante (não aluno)"
                        value={externalParticipantName}
                        onChange={(e) => setExternalParticipantName(e.target.value)}
                      />
                      <p className="text-xs text-slate-400">
                        Use este campo para convidados que não estão cadastrados como alunos.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Valor pago (R$)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="Ex: R$ 50,00"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(formatCurrency(e.target.value))}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-gradient-to-r from-violet-500 to-purple-600"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 mr-2" />
                            Incluir participante
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 mb-2">
                    Resumo do evento
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 flex items-center gap-3">
                      <Users className="w-6 h-6 text-violet-600" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Participantes pagantes
                        </p>
                        <p className="text-2xl font-bold text-slate-800">
                          {totalPaidParticipants}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-center gap-3">
                      <Ticket className="w-6 h-6 text-emerald-600" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Total arrecadado
                        </p>
                        <p className="text-2xl font-bold text-slate-800">
                          {formattedTotalAmount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      Status e vagas
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <Badge variant="outline" className="border-violet-200 text-violet-700">
                        {getEventStatusLabel(event.status)}
                      </Badge>
                      {event.hasMaxParticipants !== false ? (
                        <span>
                          {(event.participants ?? []).length} / {event.maxParticipants ?? 0} vagas preenchidas
                        </span>
                      ) : (
                        <span>{(event.participants ?? []).length} participantes (sem limite)</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                  Participantes cadastrados
                </h2>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {participants.length} registro(s)
                </Badge>
              </div>
              {participants.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">
                  Nenhum participante cadastrado ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor pago</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((p, idx) => {
                      const name = p.student?.name ?? p.externalParticipantName ?? 'Participante';
                      const typeLabel = p.student ? 'Aluno' : 'Externo';
                      const value =
                        p.amountPaid != null
                          ? p.amountPaid.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })
                          : '—';
                      return (
                        <TableRow key={p.id ?? `${name}-${idx}`}>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell>{typeLabel}</TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

