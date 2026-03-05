import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { motion } from "framer-motion";
import { ArrowLeft, ClipboardCheck, Loader2, Calendar } from "lucide-react";
import { ludusApi } from "@/components/api/ludusApi";

const ATTENDANCE_OPTIONS = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'PRESENTE', label: 'Presente' },
  { value: 'RECUSADO', label: 'Ausente' },
];

function formatDateForInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function roleLabel(role: string): string {
  if (role === 'CONDUCTOR') return 'Condutor(a)';
  if (role === 'CONDUCTED') return 'Conduzida(o)';
  return role;
}

export default function ClassAttendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const dancingClass = location.state?.dancingClass ?? null;

  const today = formatDateForInput(new Date());
  const [attendanceDate, setAttendanceDate] = useState(today);
  const [rows, setRows] = useState<{ studentId: number; studentName: string; role: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [requestingAttendance, setRequestingAttendance] = useState(false);
  const [requestFeedback, setRequestFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const isEditableDate = attendanceDate === today;
  const dashboard = useMemo(() => {
    const summary = rows.reduce(
      (acc, row) => {
        if (row.status === 'PRESENTE') acc.present += 1;
        else if (row.status === 'RECUSADO') acc.absent += 1;
        else acc.pending += 1;

        // Balance of pairs must consider only students with confirmed presence.
        if (row.status === 'PRESENTE') {
          if (row.role === 'CONDUCTOR') acc.conductors += 1;
          else acc.conducted += 1;
        }
        return acc;
      },
      { present: 0, absent: 0, pending: 0, conductors: 0, conducted: 0 }
    );

    const possiblePairs = Math.min(summary.conductors, summary.conducted);
    const roleDifference = summary.conductors - summary.conducted;

    return {
      ...summary,
      possiblePairs,
      roleDifference,
    };
  }, [rows]);

  useEffect(() => {
    if (!dancingClass?.id) {
      navigate(createPageUrl('student-attendance'), { replace: true });
      return;
    }
    loadAttendance();
  }, [dancingClass?.id, attendanceDate, navigate]);

  useEffect(() => {
    if (!dancingClass?.id) return;
    const intervalId = setInterval(() => {
      loadAttendance(true);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [dancingClass?.id, attendanceDate]);

  const loadAttendance = async (silent = false) => {
    if (!dancingClass?.id) return;
    if (!silent) {
      setLoading(true);
    }
    try {
      const list = await ludusApi.getAttendanceByClassAndDate(dancingClass.id, attendanceDate);
      setRows(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error loading attendance:', error);
      if (!silent) {
        setRows([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleRequestAttendance = async () => {
    if (!dancingClass?.id) return;
    setRequestFeedback(null);
    setRequestingAttendance(true);
    try {
      const response = await ludusApi.sendAttendanceConfirmations(dancingClass.id);
      const attendanceDateLabel = response?.attendanceDate ?? today;
      setRequestFeedback({
        type: 'success',
        message: `Solicitação enviada para ${response?.sentMessages ?? 0} aluno(s) de ${response?.totalStudents ?? 0}. Data da solicitação: ${attendanceDateLabel}.`,
      });
      if (attendanceDate === attendanceDateLabel) {
        loadAttendance(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao solicitar confirmação de presença.';
      setRequestFeedback({ type: 'error', message });
    } finally {
      setRequestingAttendance(false);
    }
  };

  const handleStatusChange = async (studentId: number, newStatus: string) => {
    if (!dancingClass?.id) return;
    const previous = rows.find((r) => r.studentId === studentId)?.status ?? 'PENDENTE';
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r))
    );
    setUpdatingId(studentId);
    try {
      await ludusApi.updateAttendance({
        studentId,
        classId: dancingClass.id,
        attendanceDate,
        status: newStatus,
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      setRows((prev) =>
        prev.map((r) => (r.studentId === studentId ? { ...r, status: previous } : r))
      );
    } finally {
      setUpdatingId(null);
    }
  };

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
            onClick={() => navigate(createPageUrl('student-attendance'))}
            className="text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="w-7 h-7 text-cyan-500" />
              Presença — {dancingClass?.beat?.name ?? 'Turma'}
            </h1>
            <p className="text-slate-500 text-sm">Alterne o status na coluna Presença</p>
          </div>
        </div>
      </motion.div>

      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="space-y-1">
              <Label htmlFor="attendanceDate">Filtro: Data</Label>
              <Input
                id="attendanceDate"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full sm:w-[220px]"
              />
            </div>
            <Button
              onClick={handleRequestAttendance}
              disabled={requestingAttendance}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
            >
              {requestingAttendance ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Solicitar Presença
                </>
              )}
            </Button>
          </div>

          {requestFeedback && (
            <div
              className={`mb-4 rounded-lg border p-3 text-sm ${
                requestFeedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {requestFeedback.message}
            </div>
          )}

          {!isEditableDate && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 p-3 text-sm">
              A coluna Presença fica editável somente na data atual. Para datas passadas ou futuras, o modo é somente leitura.
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Nenhum aluno matriculado nesta turma.</p>
              <p className="text-sm mt-1">Adicione alunos em Turmas → Matricular Alunos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700">Presentes</p>
                  <p className="text-2xl font-bold text-emerald-800">{dashboard.present}</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs text-red-700">Ausentes</p>
                  <p className="text-2xl font-bold text-red-800">{dashboard.absent}</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs text-amber-700">Pendentes</p>
                  <p className="text-2xl font-bold text-amber-800">{dashboard.pending}</p>
                </div>
                <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                  <p className="text-xs text-cyan-700">Condutores</p>
                  <p className="text-2xl font-bold text-cyan-800">{dashboard.conductors}</p>
                </div>
                <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
                  <p className="text-xs text-violet-700">Conduzidas</p>
                  <p className="text-2xl font-bold text-violet-800">{dashboard.conducted}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-600">Pares possíveis</p>
                  <p className="text-2xl font-bold text-slate-800">{dashboard.possiblePairs}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 xl:col-span-2">
                  <p className="text-xs text-slate-600">Saldo de pares</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {dashboard.roleDifference === 0
                      ? 'Equilibrado'
                      : dashboard.roleDifference > 0
                        ? `${dashboard.roleDifference} condutor(es) a mais`
                        : `${Math.abs(dashboard.roleDifference)} conduzida(s) a mais`}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Nome</TableHead>
                      <TableHead className="font-semibold">Função</TableHead>
                      <TableHead className="font-semibold">Presença</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.studentId} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">{row.studentName}</TableCell>
                        <TableCell>{roleLabel(row.role)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={row.status}
                              onValueChange={(value) => handleStatusChange(row.studentId, value)}
                              disabled={!isEditableDate || updatingId === row.studentId}
                            >
                              <SelectTrigger className="w-[140px] bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ATTENDANCE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {updatingId === row.studentId && (
                              <Loader2 className="w-4 h-4 animate-spin text-cyan-500 shrink-0" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
