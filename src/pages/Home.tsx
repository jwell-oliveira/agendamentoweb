import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { services } from '../data/services';
import { ServiceCard } from '../components/ServiceCard';
import { BookingForm } from '../components/BookingForm';
import { Service } from '../types';

export function Home() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <div className="min-h-screen bg-primary-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-primary-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                ANDRESA ALVES BEAUTY
              </h1>
            </div>
            <a
              href="/admin"
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              Área Administrativa
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Nossos Serviços
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Escolha o serviço desejado e agende seu horário
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={setSelectedService}
            />
          ))}
        </div>

        {selectedService && (
          <BookingForm
            service={selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}
      </main>
    </div>
  );
}