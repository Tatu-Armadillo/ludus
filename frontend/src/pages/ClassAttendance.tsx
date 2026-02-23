import React, { useState, useEffect } from 'react';
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
import { format } from "date-fns";

const ATTENDANCE_OPTIONS = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'PRESENTE', label: 'Presente' },
  { value: 'RECUSADO', label: 'Recusado' },
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

  useEffect(() => {
    if (!dancingClass?.id) {
      navigate(createPageUrl('student-attendance'), { replace: true });
      return;
    }
    loadAttendance();
  }, [dancingClass?.id, attendanceDate, navigate]);

  const loadAttendance = async () => {
    if (!dancingClass?.id) return;
    setLoading(true);
    try {
      const list = await ludusApi.getAttendanceByClassAndDate(dancingClass.id, attendanceDate);
      setRows(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error loading attendance:', error);
      setRows([]);
    } finally {
      setLoading(false);
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
                            disabled={updatingId === row.studentId}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
