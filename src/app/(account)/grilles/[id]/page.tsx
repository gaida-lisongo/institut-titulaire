"use client";
import { titulaireApi } from '@/api';
import { Promotions, Semestre, Student, Unite } from '@/types/jury';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Students from './students';

export default function Page() {
  const params = useParams();
  const id = params?.id as string;
  const [promotions, setPromotions] = useState<Promotions | []>([]);
  const [loading, setLoading] = useState(true);
  const [jury, setJury] = useState<any>(null);
  const [selectedSemestre, setSelectedSemestre] = useState<Semestre | null>(null);
  const [showStudents, setShowStudents] = useState(false);

  // Charger les données du jury
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await titulaireApi.fetchJury(parseInt(id));
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch jury details');
      }

      console.log("Data Jury:", response.data);
      setPromotions(response.data);
    } catch (error) {
      console.error("Error fetching grille details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les étudiants d'un semestre
  const handleSemestreSelect = async (semestre: Semestre, promotionName: string) => {
    try {
      console.log(`Chargement des étudiants pour: ${promotionName} - ${semestre.semestre}`);
      
      // Requête API pour récupérer les étudiants du semestre
      const response = await titulaireApi.fetchStudent({
        id: jury.id, 
        semestre: semestre.semestre
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch students');
      }
      
      // Créer une copie du semestre avec les étudiants
      const semestreWithStudents: Semestre = {
        ...semestre,
        etudiants: response.data
      };
      
      setSelectedSemestre(semestreWithStudents);
      setShowStudents(true);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Revenir à la liste des promotions
  const handleBackToPromotions = () => {
    setSelectedSemestre(null);
    setShowStudents(false);
  };

  useEffect(() => {
    // Récupérer les informations du jury depuis le localStorage
    const jurys = JSON.parse(localStorage.getItem("jurys") || "[]");
    const findJury = jurys.find((j: any) => j.id == id);
    if (findJury) {
      setJury(findJury);
    }

    fetchData();
  }, [id]);

  if (loading || !jury) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {!showStudents ? (
        // Vue des promotions et semestres
        <div className="space-y-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {jury.designation}
          </h1>
          
          {promotions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucune promotion disponible</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Les promotions apparaîtront ici une fois configurées.</p>
            </div>
          ) : (
            // Affichage des promotions
            <div className="space-y-8">
              {promotions.map((promotion, promotionIndex) => (
                <div key={`${promotion.promotion}-${promotionIndex}`} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {/* En-tête de la promotion */}
                  <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{promotion.promotion}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {promotion.semestres.length} semestre{promotion.semestres.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {/* Liste des semestres */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {promotion.semestres.map((semestre, semestreIndex) => {
                      // Calculer le nombre total d'unités et d'éléments
                      const totalUnites = semestre.unites.length;
                      const totalElements = semestre.unites.reduce((sum, unite) => 
                        sum + (unite.elements?.length || 0), 0);
                      
                      return (
                        <div key={`${semestre.semestre}-${semestreIndex}`} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <div className="flex items-center justify-between">
                            {/* Informations du semestre */}
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{semestre.semestre}</h3>
                              <div className="flex items-center mt-2 space-x-6">
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{totalUnites}</span>
                                  <span className="text-xs text-gray-400 dark:text-gray-500">UE</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{totalElements}</span>
                                  <span className="text-xs text-gray-400 dark:text-gray-500">Éléments</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Boutons d'action */}
                            <div className="flex items-center space-x-3">
                              {/* Bouton pour délibérer */}
                              <button
                                onClick={() => handleSemestreSelect(semestre, promotion.promotion)}
                                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Délibérer
                              </button>
                              
                              {/* Bouton pour recours */}
                              <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Recours
                              </button>
                              
                              {/* Bouton pour palmarès */}
                              <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                                Palmarès
                              </button>
                            </div>
                          </div>
                          
                          {/* Liste des UE (en version condensée) */}
                          {semestre.unites.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {semestre.unites.slice(0, 4).map((unite) => (
                                <div key={unite.id} className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                                  <span className="font-medium">{unite.code}</span>
                                  <div className="text-gray-500 dark:text-gray-400 truncate">{unite.intitule}</div>
                                </div>
                              ))}
                              {semestre.unites.length > 4 && (
                                <div className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded flex items-center justify-center">
                                  <span className="text-gray-500 dark:text-gray-400">+{semestre.unites.length - 4} autres UE</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Vue des étudiants pour un semestre sélectionné
        <div>
          {/* En-tête avec bouton de retour */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackToPromotions}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux promotions
            </button>
            
            <h2 className="text-xl font-semibold">
              {selectedSemestre?.semestre} - Délibération
            </h2>
          </div>
          
          {/* Métriques du semestre */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Unités d'enseignement</h3>
              <p className="text-2xl font-bold text-primary mt-1">{selectedSemestre?.unites.length || 0}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Éléments constitutifs</h3>
              <p className="text-2xl font-bold text-primary mt-1">
                {selectedSemestre?.unites.reduce((sum, unite) => sum + (unite.elements?.length || 0), 0) || 0}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Étudiants</h3>
              <p className="text-2xl font-bold text-primary mt-1">{selectedSemestre?.etudiants.length || 0}</p>
            </div>
          </div>
          
          {/* Composant Students */}
          {selectedSemestre && (
            <Students 
              etudiants={selectedSemestre.etudiants} 
              unites={selectedSemestre.unites} 
            />
          )}
        </div>
      )}
    </div>
  );
}