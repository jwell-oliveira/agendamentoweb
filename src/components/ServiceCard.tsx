import React from 'react';
import { Clock, DollarSign } from 'lucide-react';
import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
      <p className="text-gray-600 mb-4">{service.description}</p>
      <div className="flex items-center justify-between text-gray-700">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <span>{service.duration} min</span>
        </div>
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1" />
          <span>R$ {service.price}</span>
        </div>
      </div>
      <button
        onClick={() => onSelect(service)}
        className="mt-4 w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
      >
        Agendar
      </button>
    </div>
  );
}