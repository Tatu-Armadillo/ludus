import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { ludusApi } from "@/components/api/ludusApi";

type ConfirmationInfo = {
  studentName: string;
  className: string;
  weekday: string;
  time: string;
};

export default function AttendanceConfirm() {
  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('token') ?? '').trim();
  }, []);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<ConfirmationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setError('Token não informado.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await ludusApi.getAttendanceConfirmation(token);
        setInfo(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Não foi possível validar o link.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const handleRespond = async (status: 'PRESENT' | 'ABSENT') => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await ludusApi.respondAttendanceConfirmation({ token, status });
      setSuccessMessage(status === 'PRESENT' ? 'Presença confirmada com sucesso!' : 'Ausência registrada com sucesso.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível registrar sua resposta.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl bg-white shadow-lg border-slate-200">
        <CardContent className="p-6 sm:p-8 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Confirmação de Presença</h1>
            <p className="text-sm text-slate-500 mt-1">
              Responda sua presença para a aula.
            </p>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
              {error}
            </div>
          ) : successMessage ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 p-3 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {successMessage}
            </div>
          ) : info ? (
            <>
              <div className="rounded-lg border border-slate-200 p-4 space-y-3 text-sm">
                <div><span className="text-slate-500">Aluno:</span> <span className="font-medium text-slate-800">{info.studentName}</span></div>
                <div><span className="text-slate-500">Turma:</span> <span className="font-medium text-slate-800">{info.className}</span></div>
                <div><span className="text-slate-500">Dia:</span> <span className="font-medium text-slate-800">{info.weekday}</span></div>
                <div><span className="text-slate-500">Horário:</span> <span className="font-medium text-slate-800">{info.time}</span></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-500"
                  onClick={() => handleRespond('PRESENT')}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Confirmar Presença
                </Button>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleRespond('ABSENT')}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Informar Ausência
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
