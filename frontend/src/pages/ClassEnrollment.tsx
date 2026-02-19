import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  UserPlus,
  Users,
  Loader2,
  GraduationCap,
  User,
  CheckCircle,
  UserCheck,
  Trash2,
} from "lucide-react";
import { ludusApi } from "@/components/api/ludusApi";

const ROLE_OPTIONS = [
  { value: 'CONDUCTOR', label: 'Condutor(a)' },
  { value: 'CONDUCTED', label: 'Conduzida(o)' },
];

function roleLabel(role: string) {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
}

export default function ClassEnrollment() {
  const navigate = useNavigate();
  const location = useLocation();
  const dancingClass = location.state?.dancingClass ?? null;

  const [students, setStudents] = useState([]);
  const [enrolledList, setEnrolledList] = useState<{ studentId: number; studentName: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Individual mode
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('CONDUCTED');

  // Batch mode
  const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);
  const [batchRole, setBatchRole] = useState<string>('CONDUCTED');

  useEffect(() => {
    if (!dancingClass) {
      navigate(createPageUrl('DancingClasses'), { replace: true });
      return;
    }
    loadStudents();
  }, [dancingClass, navigate]);

  const loadStudents = async () => {
    if (!dancingClass?.id) return;
    setLoading(true);
    try {
      const list = await ludusApi.getStudents(0, 500);
      setStudents(Array.isArray(list) ? list : []);
      const enrollments = dancingClass.enrollments ?? [];
      const listEnrolled = enrollments.map((e: { student: { id: number; name: string }; role: string }) => ({
        studentId: e.student?.id,
        studentName: e.student?.name ?? '',
        role: e.role ?? 'CONDUCTED',
      }));
      setEnrolledList(listEnrolled);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrolledIds = enrolledList.map((e) => e.studentId);
  const availableForEnroll = students.filter((s) => !enrolledIds.includes(s.id));
  const totalConductors = enrolledList.filter((e) => e.role === 'CONDUCTOR').length;
  const totalConducted = enrolledList.filter((e) => e.role === 'CONDUCTED').length;

  const handleEnrollIndividual = async () => {
    if (!dancingClass?.id || !selectedStudentId) return;
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      const id = Number(selectedStudentId);
      await ludusApi.registerStudents(dancingClass.id, [{ studentId: id, role: selectedRole }]);
      const student = students.find((s) => s.id === id);
      setEnrolledList((prev) => [...prev, { studentId: id, studentName: student?.name ?? '', role: selectedRole }]);
      setSelectedStudentId('');
      setSuccessMessage('Aluno matriculado com sucesso.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error enrolling student:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnrollBatch = async () => {
    if (!dancingClass?.id || selectedBatchIds.length === 0) return;
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      const enrollments = selectedBatchIds.map((studentId) => ({ studentId, role: batchRole }));
      await ludusApi.registerStudents(dancingClass.id, enrollments);
      const names = students.filter((s) => selectedBatchIds.includes(s.id));
      setEnrolledList((prev) => [
        ...prev,
        ...names.map((s) => ({ studentId: s.id, studentName: s.name ?? '', role: batchRole })),
      ]);
      setSelectedBatchIds([]);
      setSuccessMessage(`${selectedBatchIds.length} aluno(s) matriculado(s) com sucesso.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error enrolling students:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBatchStudent = (id: number) => {
    setSelectedBatchIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleRoleChange = async (studentId: number, newRole: string) => {
    if (!dancingClass?.id) return;
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      await ludusApi.registerStudents(dancingClass.id, [{ studentId, role: newRole }]);
      setEnrolledList((prev) =>
        prev.map((e) => (e.studentId === studentId ? { ...e, role: newRole } : e))
      );
      setSuccessMessage('Função atualizada.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (studentId: number) => {
    if (!dancingClass?.id || !confirm('Remover este aluno da turma?')) return;
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      await ludusApi.removeStudentFromClass(dancingClass.id, studentId);
      setEnrolledList((prev) => prev.filter((e) => e.studentId !== studentId));
      setSuccessMessage('Aluno removido da turma.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error removing student:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!dancingClass) {
    return null;
  }

  const classLabel = dancingClass.beat?.name || 'Turma';

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
            onClick={() => navigate(createPageUrl('DancingClasses'))}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-fuchsia-500" />
              Matricular Alunos
            </h1>
            <p className="text-slate-500 mt-1">
              Turma: <span className="font-semibold text-slate-700">{classLabel}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800"
        >
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Matrícula individual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg shadow-fuchsia-500/5 h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-fuchsia-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Matrícula individual</h2>
                    <p className="text-sm text-slate-500">Cadastre um aluno por vez nesta turma</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Selecione o aluno</Label>
                    <Select
                      value={selectedStudentId}
                      onValueChange={setSelectedStudentId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um aluno" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableForEnroll.map((student) => (
                          <SelectItem key={student.id} value={String(student.id)}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Função na turma</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600"
                    onClick={handleEnrollIndividual}
                    disabled={!selectedStudentId || submitting}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Matricular aluno
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Matrícula em lote */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg shadow-fuchsia-500/5 h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Matrícula em lote</h2>
                    <p className="text-sm text-slate-500">Selecione vários alunos e matricule de uma vez</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2 border rounded-lg p-3 bg-slate-50/50">
                    {availableForEnroll.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4 text-center">
                        Nenhum aluno disponível para matrícula
                      </p>
                    ) : (
                      availableForEnroll.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white transition-colors"
                        >
                          <Checkbox
                            id={`batch-${student.id}`}
                            checked={selectedBatchIds.includes(student.id)}
                            onCheckedChange={() => toggleBatchStudent(student.id)}
                          />
                          <label
                            htmlFor={`batch-${student.id}`}
                            className="flex-1 cursor-pointer text-sm font-medium text-slate-800"
                          >
                            {student.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Matricular todos como</Label>
                    <Select value={batchRole} onValueChange={setBatchRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                    onClick={handleEnrollBatch}
                    disabled={selectedBatchIds.length === 0 || submitting}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Matricular selecionados ({selectedBatchIds.length})
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Totalizadores */}
      <div className="flex flex-wrap gap-4">
        <Card className="bg-fuchsia-50 border-fuchsia-200">
          <CardContent className="p-4 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-fuchsia-600" />
            <div>
              <p className="text-sm text-slate-600">Condutor(a)</p>
              <p className="text-2xl font-bold text-fuchsia-700">{totalConductors}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-violet-50 border-violet-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-violet-600" />
            <div>
              <p className="text-sm text-slate-600">Conduzida(o)</p>
              <p className="text-2xl font-bold text-violet-700">{totalConducted}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-slate-600" />
            <div>
              <p className="text-sm text-slate-600">Total na turma</p>
              <p className="text-2xl font-bold text-slate-800">{enrolledList.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listagem de matriculados */}
      <Card className="bg-white/80 backdrop-blur border-0 shadow-lg shadow-fuchsia-500/5">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Alunos matriculados nesta turma</h2>
          {enrolledList.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">Nenhum aluno matriculado ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Função</TableHead>
                  <TableHead className="font-semibold text-right w-[140px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolledList.map((e) => (
                  <TableRow key={e.studentId}>
                    <TableCell className="font-medium">{e.studentName}</TableCell>
                    <TableCell>
                      <Select
                        value={e.role}
                        onValueChange={(value) => handleRoleChange(e.studentId, value)}
                        disabled={submitting}
                      >
                        <SelectTrigger className="h-8 w-[160px] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(e.studentId)}
                        disabled={submitting}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Remover da turma"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
