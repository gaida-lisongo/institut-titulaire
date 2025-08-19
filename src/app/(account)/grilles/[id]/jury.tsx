"use client";
import { Promotions, Semestres, Unite } from '@/types/jury';
import React, { useState } from 'react'

type PromotionsDetailsProps = {
  promotions: Promotions[];
  fetchPromotion: (unites : Unite[]) => Promise<void>;
  jury: string | null;
  fetchSemestre: (semestre : Semestres) => Promise<void>;
}

export default function PromotionsDetails({ promotions, fetchPromotion, jury, fetchSemestre }: PromotionsDetailsProps) {
  const [selectedPromotion, setSelectedPromotion] = useState<{ promotion: string; semestres: Semestres[] } | null>(null);
  const [showUnitsModal, setShowUnitsModal] = useState(false);
  const [loadingGrille, setLoadingGrille] = useState<string | null>(null);

  // Fonction pour compter les unités par semestre pour une promotion
  const getUnitesStatsBySemestre = (semestres: Semestres[]) => {
    const stats: { [semestre: string]: { count: number; unites: Unite[] } } = {};
    
    semestres.forEach((semestreData) => {
      stats[semestreData.semestre] = {
        count: semestreData.unites?.length || 0,
        unites: semestreData.unites || []
      };
    });
    
    return stats;
  };

  // Fonction pour récupérer toutes les unités d'une promotion
  const getAllUnites = (semestres: Semestres[]): Unite[] => {
    const allUnites: Unite[] = [];
    semestres.forEach(semestre => {
      if (semestre.unites) {
        allUnites.push(...semestre.unites);
      }
    });
    return allUnites;
  };

  const handleCardClick = (promotionData: { promotion: string; semestres: Semestres[] }) => {
    setSelectedPromotion(promotionData);
    setShowUnitsModal(true);
  };

  // Fonction pour gérer la grille d'une promotion complète
  const handleShowGrille = async (promotionData: { promotion: string; semestres: Semestres[] }) => {
    const buttonId = `promotion-${promotionData.promotion}`;
    setLoadingGrille(buttonId);
    try {
      const allUnites = getAllUnites(promotionData.semestres);
      console.log("Afficher grille pour:", promotionData.promotion, "avec", allUnites.length, "unités");
      await fetchPromotion(allUnites);
    } catch (error) {
      console.error("Erreur lors du chargement de la grille:", error);
    } finally {
      setLoadingGrille(null);
    }
  };

  // Fonction pour gérer la grille d'un semestre spécifique - MODIFIÉE
  const handleShowSemestreGrille = async (semestre: Semestres, promotionName: string) => {
    const buttonId = `semestre-${promotionName}-${semestre.semestre}`;
    setLoadingGrille(buttonId);
    try {
      console.log("Afficher grille pour le semestre:", semestre.semestre, "de", promotionName);
      await fetchSemestre(semestre); // Utilise fetchSemestre au lieu de fetchPromotion
    } catch (error) {
      console.error("Erreur lors du chargement de la grille du semestre:", error);
    } finally {
      setLoadingGrille(null);
    }
  };

  const handleExportRecours = (promotionData: { promotion: string; semestres: Semestres[] }) => {
    console.log("Exporter recours pour:", promotionData.promotion);
    // TODO: Implémenter l'export de recours
  };

  const handleExportPalmares = (promotionData: { promotion: string; semestres: Semestres[] }) => {
    console.log("Exporter palmarès pour:", promotionData.promotion);
    // TODO: Implémenter l'export du palmarès
  };

  const closeModal = () => {
    setShowUnitsModal(false);
    setSelectedPromotion(null);
  };

  if (!promotions || promotions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stroke py-16 dark:border-dark-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="mb-2 text-xl font-medium text-dark dark:text-white">
          Aucune promotion disponible
        </p>
        <p className="text-body-color dark:text-dark-6">
          Les promotions apparaîtront ici une fois configurées
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">
          {jury}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {promotions.length} promotion{promotions.length > 1 ? 's' : ''} disponible{promotions.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Grille des promotions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {promotions.map((promotionData, index) => {
          const unitesStats = getUnitesStatsBySemestre(promotionData.semestres);
          const totalUnites = Object.values(unitesStats).reduce((sum, stat) => sum + stat.count, 0);
          const totalSemestres = Object.keys(unitesStats).length;
          const isPromotionLoading = loadingGrille === `promotion-${promotionData.promotion}`;

          return (
            <div 
              key={`${promotionData.promotion}-${index}`} 
              className="group relative rounded-xl border border-stroke bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:cursor-pointer dark:border-dark-3 dark:bg-dark-2"
              onClick={() => handleCardClick(promotionData)}
            >
              {/* Header de la carte */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-dark dark:text-white">
                      {promotionData.promotion}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cliquer pour voir les unités
                    </p>
                  </div>
                </div>

                {/* Statistiques globales */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                      {totalSemestres}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Semestre{totalSemestres > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                      {totalUnites}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      UE Total
                    </div>
                  </div>
                </div>
              </div>

              {/* Détail par semestre avec boutons individuels */}
              <div className="mb-6 space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Unités par semestre
                </h4>
                
                {Object.entries(unitesStats).length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Aucun semestre configuré
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(unitesStats).map(([semestre, stat]) => {
                      const semestreData = promotionData.semestres.find(s => s.semestre === semestre);
                      const isSemestreLoading = loadingGrille === `semestre-${promotionData.promotion}-${semestre}`;
                      
                      return (
                        <div 
                          key={semestre}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-3 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-sm font-medium text-dark dark:text-white">
                              {semestre}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {stat.count} UE
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (semestreData) {
                                  handleShowSemestreGrille(semestreData, promotionData.promotion);
                                }
                              }}
                              disabled={isSemestreLoading || stat.count === 0}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              {isSemestreLoading ? (
                                <>
                                  <svg className="mr-1 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  ...
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                                  </svg>
                                  Grille
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                {/* Bouton principal - Afficher la grille complète */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowGrille(promotionData);
                  }}
                  disabled={isPromotionLoading}
                  className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-white transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPromotionLoading ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Chargement...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                      </svg>
                      Grille complète
                    </>
                  )}
                </button>

                {/* Boutons secondaires */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportRecours(promotionData);
                    }}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-6-6" />
                    </svg>
                    Recours
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportPalmares(promotionData);
                    }}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Palmarès
                  </button>
                </div>
              </div>

              {/* Badge de statut */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  Actif
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal des unités - reste identique */}
      {showUnitsModal && selectedPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl dark:bg-dark max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-dark-3 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-dark dark:text-white">
                    Unités d'enseignement
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedPromotion.promotion}
                  </p>
                </div>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {selectedPromotion.semestres.map((semestre, index) => (
                  <div key={index} className="border border-gray-200 dark:border-dark-3 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-dark dark:text-white flex items-center">
                        <span className="w-3 h-3 bg-primary rounded-full mr-3"></span>
                        {semestre.semestre}
                        <span className="ml-3 text-sm font-normal text-gray-600 dark:text-gray-400">
                          {semestre.unites?.length || 0} unité{(semestre.unites?.length || 0) > 1 ? 's' : ''}
                        </span>
                      </h4>
                      
                      {/* Bouton grille pour ce semestre dans la modal */}
                      <button
                        onClick={() => handleShowSemestreGrille(semestre, selectedPromotion.promotion)}
                        disabled={loadingGrille === `semestre-${selectedPromotion.promotion}-${semestre.semestre}` || !semestre.unites || semestre.unites.length === 0}
                        className="inline-flex items-center px-3 py-1 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {loadingGrille === `semestre-${selectedPromotion.promotion}-${semestre.semestre}` ? (
                          <>
                            <svg className="mr-1 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Chargement...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                            </svg>
                            Grille du semestre
                          </>
                        )}
                      </button>
                    </div>
                    
                    {semestre.unites && semestre.unites.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {semestre.unites.map((unite) => (
                          <div 
                            key={unite.id}
                            className="border border-gray-100 dark:border-dark-3 rounded-lg p-3 bg-gray-50 dark:bg-dark-2"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-dark dark:text-white text-sm">
                                {unite.code}
                              </h5>
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                {unite.categorie}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {unite.intitule}
                            </p>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <p><strong>Évaluation:</strong> {unite.evaluation}</p>
                              <p><strong>Pédagogie:</strong> {unite.pedagogie}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        Aucune unité configurée pour ce semestre
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-dark-3 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {getAllUnites(selectedPromotion.semestres).length} unité{getAllUnites(selectedPromotion.semestres).length > 1 ? 's' : ''} au total
                </div>
                <button 
                  onClick={closeModal}
                  className="rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primary/90"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}