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
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Music, 
  Trash2, 
  Loader2,
  Disc3
} from "lucide-react";
import { ludusApi } from "@/components/api/ludusApi";

const colors = [
  'from-violet-500 to-purple-600',
  'from-fuchsia-500 to-pink-600',
  'from-rose-500 to-red-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-cyan-500 to-blue-600',
  'from-indigo-500 to-violet-600',
];

export default function Beats() {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [beatName, setBeatName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBeats();
  }, []);

  const loadBeats = async () => {
    try {
      const data = await ludusApi.getBeats(0, 100);
      setBeats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading beats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!beatName.trim()) return;
    setSubmitting(true);
    try {
      await ludusApi.createBeat(beatName);
      setDialogOpen(false);
      setBeatName('');
      loadBeats();
    } catch (error) {
      console.error('Error creating beat:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este ritmo?')) return;
    try {
      await ludusApi.deleteBeat(id);
      loadBeats();
    } catch (error) {
      console.error('Error deleting beat:', error);
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
            <Music className="w-8 h-8 text-amber-500" />
            Ritmos
          </h1>
          <p className="text-slate-500 mt-1">Cadastre os estilos de dança disponíveis</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/30">
              <Plus className="w-5 h-5 mr-2" />
              Novo Ritmo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Cadastrar Ritmo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="beatName" className="flex items-center gap-2">
                  <Disc3 className="w-4 h-4 text-amber-500" />
                  Nome do Ritmo
                </Label>
                <Input
                  id="beatName"
                  value={beatName}
                  onChange={(e) => setBeatName(e.target.value)}
                  placeholder="Ex: Forró, Samba, Zouk..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-gradient-to-r from-amber-500 to-orange-600"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                  ) : (
                    'Cadastrar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Beats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : beats.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="text-center py-20 text-slate-500">
            <Music className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">Nenhum ritmo cadastrado</p>
            <p className="text-sm">Cadastre o primeiro ritmo para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {beats.map((beat, index) => (
              <motion.div
                key={beat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <CardContent className="p-0">
                    <div className={`h-24 bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center relative`}>
                      <Disc3 className="w-12 h-12 text-white/80" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(beat.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-red-200 hover:bg-white/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-bold text-slate-800 text-lg">{beat.name}</h3>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}