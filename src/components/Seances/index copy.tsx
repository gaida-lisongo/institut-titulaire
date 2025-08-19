"use client";
import { titulaireApi } from '@/api';
import React, { useEffect, useState, useMemo } from 'react'

type Seance = {
    id: string;
    contenu: string;
    duree: string;
    id_charge: string;
    lieu: string;
    materiel: string;
    objectif: string;
    url: string;
    type?: string;
    date_seance?: string;
    heure_debut?: string;
    heure_fin?: string;
    statut?: string;
    capacite_max?: number;
    nb_inscrits?: number;
};

export default function Seances({
    id,
    onSave,
    onEdit,
    onDelete
} : {
    id: string;
    onSave: (data: any) => any;
    onEdit: (data: any) => any;
    onDelete: (id: string) => any;
}) {
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInscriptionsModal, setShowInscriptionsModal] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState<Seance | null>(null);

  const fetchSeances = async () => {
    try {
        const request = await titulaireApi.fetchSeancesByCharge(id);
        if (request.success) {
            console.log("Seances fetched:", request.data);
            setSeances(request.data);
        } else {
            console.error("Error fetching seances:", request.message);
        }
    } catch (error) {
        console.error("Error fetching seances:", error);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchSeances();
  }, [id]);

  // Filtrage des séances basé sur la recherche
  const filteredSeances = useMemo(() => {
    if (!searchTerm) return seances;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return seances.filter(seance => 
      seance.contenu.toLowerCase().includes(lowerSearchTerm) ||
      seance.objectif.toLowerCase().includes(lowerSearchTerm) ||
      seance.lieu.toLowerCase().includes(lowerSearchTerm) ||
      seance.materiel.toLowerCase().includes(lowerSearchTerm) ||
      (seance.type && seance.type.toLowerCase().includes(lowerSearchTerm))
    );
  }, [seances, searchTerm]);

  const openInscriptionsModal = (seance: Seance) => {
    setSelectedSeance(seance);
    setShowInscriptionsModal(true);
  };

  const getTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'cours':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z" />
          </svg>
        );
      case 'tp':
      case 'travaux pratiques':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'td':
      case 'travaux dirigés':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'conférence':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'cours':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case 'tp':
      case 'travaux pratiques':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case 'td':
      case 'travaux dirigés':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case 'conférence':
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // Format HH:MM
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          <p className="mt-4 text-lg">Chargement des séances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark">
      {/* Header avec recherche */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-dark dark:text-white">
            Séances programmées
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredSeances.length} séance{filteredSeances.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par contenu, objectif, lieu, matériel ou type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Contenu principal */}
      {filteredSeances.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stroke py-16 dark:border-dark-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mb-2 text-xl font-medium text-dark dark:text-white">
            {searchTerm ? "Aucune séance trouvée" : "Aucune séance programmée"}
          </p>
          <p className="text-body-color dark:text-dark-6">
            {searchTerm ? "Essayez un autre terme de recherche" : "Les séances de votre charge apparaîtront ici"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSeances.map((seance) => (
            <div 
              key={seance.id} 
              className="group relative rounded-lg border border-stroke bg-gray-50 p-6 transition-all hover:shadow-lg dark:border-dark-3 dark:bg-dark-2"
            >
              {/* Header de la carte */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center rounded-lg p-2 ${getTypeColor(seance.type)}`}>
                    {getTypeIcon(seance.type)}
                  </div>
                  <div>
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(seance.type)}`}>
                      {seance.type || 'Séance'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button 
                    onClick={() => openInscriptionsModal(seance)}
                    className="rounded-full p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    title="Voir les inscriptions"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => onEdit(seance)}
                    className="rounded-full p-2 text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    title="Modifier"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => onDelete(seance.id)}
                    className="rounded-full p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="mb-4">
                <h3 className="mb-2 text-lg font-semibold text-dark dark:text-white line-clamp-2">
                  {seance.contenu}
                </h3>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {seance.objectif}
                </p>
              </div>

              {/* Informations de la séance */}
              <div className="space-y-2 text-sm">
                {seance.date_seance && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(seance.date_seance)}
                  </div>
                )}

                {(seance.heure_debut || seance.heure_fin) && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(seance.heure_debut)} - {formatTime(seance.heure_fin)}
                    {seance.duree && ` (${seance.duree})`}
                  </div>
                )}

                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {seance.lieu}
                </div>

                {seance.materiel && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    {seance.materiel}
                  </div>
                )}

                {/* Indicateur de capacité/inscriptions */}
                {(seance.capacite_max || seance.nb_inscrits) && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-xs text-gray-500">Inscriptions</span>
                    <span className={`text-xs font-medium ${
                      seance.nb_inscrits && seance.capacite_max && seance.nb_inscrits >= seance.capacite_max
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {seance.nb_inscrits || 0}
                      {seance.capacite_max && ` / ${seance.capacite_max}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Lien vers le document */}
              {seance.url && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <a 
                    href={seance.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    Document de la séance
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal des inscriptions - Placeholder pour l'instant */}
      {showInscriptionsModal && selectedSeance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl dark:bg-dark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dark dark:text-white">
                Inscriptions à la séance: {selectedSeance.contenu}
              </h3>
              <button 
                onClick={() => setShowInscriptionsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex h-32 items-center justify-center text-gray-500">
              <p>Composant des inscriptions à implémenter...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
