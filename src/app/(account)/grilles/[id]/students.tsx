"use client";
import { Student, Unite } from '@/types/jury';
import React, { useState } from 'react';
import StudentDetailView from "./studentDetailView"; // Nouveau composant

type StudentsProps = {
  etudiants: Student[];
  unites: Unite[];
};

export default function Students({ etudiants, unites }: StudentsProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"nom" | "matricule" | "grade">("nom");

  // Si un étudiant est sélectionné, afficher sa page de détails
  if (selectedStudent) {
    return (
      <StudentDetailView
        student={selectedStudent}
        unites={unites}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  // Filtrer et trier les étudiants
  const filteredStudents =
    etudiants &&
    etudiants
      .filter(
        (student) =>
          student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.matricule.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        if (sortBy === "nom") return a.nom.localeCompare(b.nom);
        if (sortBy === "matricule")
          return a.matricule.localeCompare(b.matricule);
        if (sortBy === "grade") return a.grade.localeCompare(b.grade);
        return 0;
      });

  // Générer les initiales à partir du nom
  const getInitials = (name: string) => {
    const names = name.split(" ");
    return names.map((n) => n.charAt(0).toUpperCase()).join("");
  };

  // Obtenir une couleur pour l'avatar basée sur la première lettre du nom
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Barre de recherche et tri */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Rechercher un étudiant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex">
          <select
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "nom" | "matricule" | "grade")
            }
          >
            <option value="nom">Trier par nom</option>
            <option value="matricule">Trier par matricule</option>
            <option value="grade">Trier par grade</option>
          </select>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary dark:bg-primary/20">
            {filteredStudents?.length || 0} étudiant
            {filteredStudents && filteredStudents.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grille des étudiants */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredStudents && filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="flex cursor-pointer items-start rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Avatar */}
              <div
                className={`h-12 w-12 flex-shrink-0 ${getAvatarColor(student.nom)} mr-3 flex items-center justify-center rounded-full font-bold text-white`}
              >
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt={student.nom}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(student.nom)
                )}
              </div>

              {/* Informations étudiant */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {student.nom}
                </h3>
                <div className="mt-1 flex flex-col text-xs text-gray-500 dark:text-gray-400">
                  <div className="mb-1 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1 h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                    <span className="truncate">{student.matricule}</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1 h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span>{student.grade}</span>
                  </div>
                </div>
              </div>

              {/* Badge */}
              <div className="ml-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    student.sexe === "M"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300"
                      : "bg-pink-100 text-pink-800 dark:bg-pink-800/20 dark:text-pink-300"
                  }`}
                >
                  {student.sexe === "M" ? "H" : "F"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Aucun étudiant trouvé
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Essayez d'autres termes de recherche"
                : "Aucun étudiant n'est inscrit dans ce semestre"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}