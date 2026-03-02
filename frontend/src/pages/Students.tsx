import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Users, 
  Search, 
  Trash2,
  Pencil,
  Loader2,
  User,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  CreditCard
} from "lucide-react";
import { ludusApi } from "@/components/api/ludusApi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function maskCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  if (rest.length <= 5) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    cpf: '',
    birth: '',
    email: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    contact: '',
    cpf: '',
    birth: '',
    email: ''
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await ludusApi.getStudents(0, 100);
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ludusApi.createStudent(formData);
      setDialogOpen(false);
      setFormData({ name: '', contact: '', cpf: '', birth: '', email: '' });
      loadStudents();
    } catch (error) {
      console.error('Error creating student:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name ?? '',
      contact: student.contact ? maskPhone(student.contact) : '',
      cpf: student.cpf ? maskCPF(student.cpf) : '',
      birth: student.birth ? String(student.birth).slice(0, 10) : '',
      email: student.email ?? ''
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditSubmitting(true);
    try {
      await ludusApi.updateStudent(editingStudent.id, {
        name: editFormData.name,
        contact: editFormData.contact,
        birth: editFormData.birth,
        email: editFormData.email,
      });
      setEditDialogOpen(false);
      setEditingStudent(null);
      setEditFormData({
        name: '',
        contact: '',
        cpf: '',
        birth: '',
        email: ''
      });
      loadStudents();
    } catch (error) {
      console.error('Error updating student:', error);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este aluno?')) return;
    try {
      await ludusApi.deleteStudent(id);
      loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.cpf?.includes(searchTerm)
  );

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
            <Users className="w-8 h-8 text-violet-500" />
            Alunos
          </h1>
          <p className="text-slate-500 mt-1">Gerencie os alunos cadastrados</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/30">
              <Plus className="w-5 h-5 mr-2" />
              Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Cadastrar Aluno</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-500" />
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Digite o nome"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-violet-500" />
                  Contato
                </Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: maskPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-violet-500" />
                  CPF
                </Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-violet-500" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth" className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-violet-500" />
                  Data de Nascimento
                </Label>
                <Input
                  id="birth"
                  type="date"
                  value={formData.birth}
                  onChange={(e) => setFormData({ ...formData, birth: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Cadastrar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditingStudent(null);
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Editar Aluno</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-500" />
                  Nome Completo
                </Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Digite o nome"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-violet-500" />
                  Contato
                </Label>
                <Input
                  id="edit-contact"
                  value={editFormData.contact}
                  onChange={(e) => setEditFormData({ ...editFormData, contact: maskPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cpf" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-violet-500" />
                  CPF
                </Label>
                <Input
                  id="edit-cpf"
                  value={editFormData.cpf}
                  readOnly
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-violet-500" />
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-birth" className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-violet-500" />
                  Data de Nascimento
                </Label>
                <Input
                  id="edit-birth"
                  type="date"
                  value={editFormData.birth}
                  onChange={(e) => setEditFormData({ ...editFormData, birth: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={editSubmitting}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600"
                >
                  {editSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar alterações'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-white border-slate-200 focus:border-violet-400"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg shadow-violet-500/5 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium">Nenhum aluno encontrado</p>
                <p className="text-sm">Cadastre o primeiro aluno para começar</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold">Nome</TableHead>
                    <TableHead className="font-semibold">Contato</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">CPF</TableHead>
                    <TableHead className="font-semibold">Nascimento</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-violet-50/50 transition-colors"
                      >
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.contact ? maskPhone(student.contact) : '-'}</TableCell>
                        <TableCell>{student.email || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">{student.cpf ? maskCPF(student.cpf) : '-'}</TableCell>
                        <TableCell>
                          {student.birth 
                            ? format(new Date(student.birth), 'dd/MM/yyyy')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={student.active ? 'default' : 'secondary'}
                            className={student.active 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                              : 'bg-slate-100 text-slate-600'
                            }
                          >
                            {student.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(student)}
                              className="text-violet-500 hover:text-violet-600 hover:bg-violet-50"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(student.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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