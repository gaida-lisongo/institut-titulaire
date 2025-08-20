"use client";
import { Semestre } from '@/types/jury';
import Students from './students';

type SemestreViewProps = {
  semestre: Semestre;
};

export default function SemestreView({ semestre }: SemestreViewProps) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{semestre.semestre}</h2>
        <button className="rounded-lg bg-primary px-4 py-2 font-semibold text-white">
          Délibérer
        </button>
      </div>
      <Students etudiants={semestre.etudiants} unites={semestre.unites} />
    </div>
  );
}