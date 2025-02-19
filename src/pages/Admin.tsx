import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, User, Mail, Phone } from 'lucide-react';

interface Appointment {
  id: string;
  service_id: string;
  date: string;
  time: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  status: string;
  created_at: string;
}

export function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchAppointments();
  }, [user, navigate]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;
      await fetchAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow p-6 space-y-4"
              >
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {format(new Date(appointment.date), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="w-5 h-5" />
                  <span>{appointment.client_name}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span>{appointment.client_email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{appointment.client_phone}</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <select
                    value={appointment.status}
                    onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}