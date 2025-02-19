import { format, addMinutes, parse, isWithinInterval } from 'date-fns';
import { supabase } from './supabase';
import type { Service } from '../types';
import { services } from '../data/services';

const BUSINESS_HOURS = {
  start: '09:00',
  end: '18:00',
  interval: 30, // Reduzido para 30 minutos para mais flexibilidade
};

export async function getAvailableTimeSlots(date: string, service: Service) {
  try {
    // Buscar todos os agendamentos do dia que não estão cancelados
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', date)
      .neq('status', 'cancelado');

    if (error) throw error;

    // Gerar todos os horários possíveis do dia
    const allTimeSlots: string[] = [];
    let currentTime = parse(BUSINESS_HOURS.start, 'HH:mm', new Date());
    const endTime = parse(BUSINESS_HOURS.end, 'HH:mm', new Date());

    while (currentTime < endTime) {
      allTimeSlots.push(format(currentTime, 'HH:mm'));
      currentTime = addMinutes(currentTime, BUSINESS_HOURS.interval);
    }

    // Filtrar horários disponíveis
    return allTimeSlots.filter((timeSlot) => {
      const slotStart = parse(timeSlot, 'HH:mm', new Date());
      const slotEnd = addMinutes(slotStart, service.duration);

      // Verificar se o horário não ultrapassa o horário de fechamento
      if (slotEnd > endTime) {
        return false;
      }

      // Verificar conflitos com outros agendamentos
      return !appointments?.some((appointment) => {
        const appointmentStart = parse(appointment.time, 'HH:mm', new Date());
        const appointmentService = services.find(s => s.id === appointment.service_id);
        
        if (!appointmentService) {
          console.error(`Serviço não encontrado para o agendamento: ${appointment.service_id}`);
          return false;
        }

        const appointmentEnd = addMinutes(appointmentStart, appointmentService.duration);

        // Verifica todas as possíveis sobreposições
        const hasOverlap = (
          // O início do novo agendamento está dentro de um agendamento existente
          (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
          // O fim do novo agendamento está dentro de um agendamento existente
          (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
          // O novo agendamento engloba completamente um agendamento existente
          (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
        );

        if (hasOverlap) {
          console.log(`Conflito detectado: ${timeSlot} conflita com agendamento existente ${appointment.time}`);
        }

        return hasOverlap;
      });
    });
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error);
    throw new Error('Não foi possível carregar os horários disponíveis');
  }
}