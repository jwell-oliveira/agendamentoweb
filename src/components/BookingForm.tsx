import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import { supabase } from '../lib/supabase';
import { getAvailableTimeSlots } from '../lib/timeSlots';

interface BookingFormProps {
  service: Service;
  onClose: () => void;
}

export function BookingForm({ service, onClose }: BookingFormProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (formData.date) {
      loadTimeSlots();
    }
  }, [formData.date, service]);

  const loadTimeSlots = async () => {
    setIsLoadingSlots(true);
    setError('');
    try {
      const slots = await getAvailableTimeSlots(formData.date, service);
      setAvailableTimeSlots(slots);
      if (!slots.includes(formData.time)) {
        setFormData(prev => ({ ...prev, time: '' }));
      }
    } catch (err) {
      console.error('Erro ao carregar horários:', err);
      setError('Erro ao carregar horários disponíveis. Por favor, tente novamente.');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verificação dupla de disponibilidade
      const slots = await getAvailableTimeSlots(formData.date, service);
      
      if (!slots.includes(formData.time)) {
        throw new Error('Este horário não está mais disponível. Por favor, escolha outro horário.');
      }

      // Verificar se já existe agendamento para este horário
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', formData.date)
        .eq('time', formData.time)
        .neq('status', 'cancelado');

      if (existingAppointments && existingAppointments.length > 0) {
        throw new Error('Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro horário.');
      }

      const { error: insertError } = await supabase
        .from('appointments')
        .insert([
          {
            service_id: service.id,
            date: formData.date,
            time: formData.time,
            client_name: formData.name,
            client_email: formData.email,
            client_phone: formData.phone,
            status: 'pendente',
          },
        ]);

      if (insertError) throw insertError;

      alert('Agendamento realizado com sucesso!');
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao realizar agendamento. Por favor, tente novamente.');
      }
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">
          Agendar {service.name} ({service.duration} minutos)
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Horário</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                disabled={!formData.date || isLoadingSlots}
              >
                <option value="">
                  {isLoadingSlots 
                    ? 'Carregando horários...' 
                    : 'Selecione um horário'
                  }
                </option>
                {availableTimeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {formData.date && !isLoadingSlots && availableTimeSlots.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  Não há horários disponíveis nesta data
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input
                type="tel"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              disabled={loading || isLoadingSlots}
            >
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}