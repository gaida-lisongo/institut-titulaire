"use client";
import { titulaireApi } from '@/api';
import { Student, Unite } from '@/types/jury';
import React, { useState, useEffect } from 'react';

type StudentDetailViewProps = {
  student: Student;
  unites: Unite[];
  onBack: () => void;
};

// Type pour les notes d'un étudiant
type Notes = {
  [elementId: number]: number;
};

export default function StudentDetailView({ student, unites, onBack }: StudentDetailViewProps) {
  const [expandedUnites, setExpandedUnites] = useState<number[]>([]);
  const [notes, setNotes] = useState<Notes>({});
  const [isSaving, setIsSaving] = useState(false);
  const [notesInfo, setNotesInfo] = useState<{ [elementId: number]: { date_created: string; cmi: number; examen: number; rattrapage: number; id: number } | null }>({});
  const [loading, setLoading] = useState(true);

  const fetchNote = async ({
    id_etudiant,
    id_element,
    id_annee
  }: {
    id_etudiant: number;
    id_element: number;
    id_annee: number;
  }) => {
    try {
      const request = await titulaireApi.fetchNote({
        id_etudiant,
        id_element,
        id_annee
      });

      if (request.success) {
        console.log("Note fetched successfully:", request.data);
        return request.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching note:", error);
      return [];
    }
  }

  // Chargement des notes
  useEffect(() => {
    setLoading(true);
    const simulatedNotes: Notes = {};
    
    if (!student.id_etudiant) {
      console.log("Aucun id_etudiant trouvé pour l'étudiant:", student);
      setLoading(false);
      return;
    }

    const fetchPromises: Promise<void>[] = [];

    unites.forEach(unite => {
      if (!unite.elements || !unite.id_annee) {
        return;
      }

      unite.elements.forEach(element => {
        const promise = fetchNote({
          id_etudiant: student.id_etudiant,
          id_element: element.id,
          id_annee: unite.id_annee
        })
          .then(noteData => {
            if (noteData && noteData.length > 0) {
              const {
                id,
                date_created,
                cmi,
                examen,
                rattrapage
              } = noteData[0];

              const cmiValue = parseFloat(cmi ?? "0");
              const examenValue = parseFloat(examen ?? "0");
              const rattrapageValue = parseFloat(rattrapage ?? "0");

              const totalPrincipal = cmiValue + examenValue;
              const totalRattrapage = rattrapageValue;

              setNotesInfo(prev => ({
                ...prev,
                [element.id]: {
                  id,
                  date_created,
                  cmi: cmiValue,
                  examen: examenValue,
                  rattrapage: rattrapageValue
                }
              }));

              simulatedNotes[element.id] = totalPrincipal >= totalRattrapage ? totalPrincipal : totalRattrapage;
              setNotes(prevNotes => ({
                ...prevNotes,
                [element.id]: totalPrincipal >= totalRattrapage ? totalPrincipal : totalRattrapage
              }));
            } else {
              simulatedNotes[element.id] = 0;
              setNotes(prevNotes => ({
                ...prevNotes,
                [element.id]: 0
              }));
            }
          })
          .catch(error => {
            console.error(`Erreur lors du chargement de la note pour l'élément ${element.id}:`, error);
            simulatedNotes[element.id] = 0;
            setNotes(prevNotes => ({
              ...prevNotes,
              [element.id]: 0
            }));
          });

        fetchPromises.push(promise);
      });
    });

    Promise.all(fetchPromises)
      .then(() => {
        console.log("Toutes les notes ont été chargées");
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des notes:", error);
        setLoading(false);
      });
  }, [unites, student]);

  // Calcul de la moyenne d'une UE
  const calculateUniteMoyenne = (unite: Unite): { moyenne: number; valide: boolean } => {
    if (!unite.elements || unite.elements.length === 0) return { moyenne: 0, valide: false };
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    unite.elements.forEach(element => {
      const note = notes[element.id] || 0;
      totalPoints += note * element.credit;
      totalCredits += element.credit;
    });
    
    const moyenne = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return { 
      moyenne, 
      valide: moyenne >= 10 
    };
  };

  // Toggle l'expansion d'une unité
  const toggleUnite = (uniteId: number) => {
    setExpandedUnites(prev => 
      prev.includes(uniteId) 
        ? prev.filter(id => id !== uniteId) 
        : [...prev, uniteId]
    );
  };

  // Mise à jour d'une note
  const updateNote = (elementId: number, value: number) => {
    const clampedValue = Math.min(20, Math.max(0, value));
    setNotes(prev => ({
      ...prev,
      [elementId]: clampedValue
    }));
  };

  // Sauvegarder les notes
  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const savePromises = Object.entries(notes).map(async ([elementIdStr, noteValue]) => {
        const elementId = parseInt(elementIdStr);
        const noteInfo = notesInfo[elementId];
        
        if (noteInfo) {
          console.log(`Mise à jour de la note ${noteInfo.id} pour l'élément ${elementId}: ${noteValue}`);
        } else {
          console.log(`Création d'une note pour l'élément ${elementId}: ${noteValue}`);
        }
      });
      
      await Promise.all(savePromises);
      console.log('Notes sauvegardées avec succès:', notes);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Calcul du résultat global
  const calculateOverallResult = () => {
    let totalMoyenne = 0;
    let validCount = 0;
    let totalUnites = 0;
    
    unites.forEach(unite => {
      const { moyenne, valide } = calculateUniteMoyenne(unite);
      totalMoyenne += moyenne;
      if (valide) validCount++;
      totalUnites++;
    });
    
    const overallMoyenne = totalUnites > 0 ? totalMoyenne / totalUnites : 0;
    const passed = validCount === totalUnites;
    
    return {
      moyenne: overallMoyenne,
      status: passed ? 'Admis' : 'Ajourné',
      validCount,
      totalUnites
    };
  };

  const result = calculateOverallResult();

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à la liste
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Résultats de {student.nom}
          </h1>
        </div>
        <button
          onClick={handleSaveNotes}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enregistrement...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Enregistrer les notes
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des notes...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations étudiant - colonne de gauche */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col items-center mb-6">
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt={student.nom}
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                    {student.nom.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white text-center">
                  {student.nom}
                </h2>
                <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="mr-2">{student.matricule}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.sexe === 'M' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300' 
                    : 'bg-pink-100 text-pink-800 dark:bg-pink-800/20 dark:text-pink-300'
                  }`}>
                    {student.sexe === 'M' ? 'Homme' : 'Femme'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">Grade: <span className="font-medium">{student.grade}</span></span>
                </div>
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">Nationalité: <span className="font-medium">{student.nationalite}</span></span>
                </div>
                {student.date_naissance && (
                  <div className="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Né(e) le: <span className="font-medium">
                        {new Date(student.date_naissance).toLocaleDateString('fr-FR')}
                      </span>
                    </span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">Tél: <span className="font-medium">{student.telephone}</span></span>
                </div>
              </div>

              {/* Résultat global */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Résultat global</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Moyenne générale:</span>
                  <span className="text-lg font-bold text-primary">{result.moyenne.toFixed(2)}/20</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Unités validées:</span>
                  <span className="font-semibold">{result.validCount}/{result.totalUnites}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Résultat:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    result.status === 'Admis' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300'
                  }`}>
                    {result.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Accordéon des UE et éléments - 2 colonnes à droite */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Unités d'enseignement
              </h3>
              
              <div className="space-y-3">
                {unites.map(unite => {
                  const { moyenne, valide } = calculateUniteMoyenne(unite);
                  const isExpanded = expandedUnites.includes(unite.id);

                  return (
                    <div key={unite.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      {/* En-tête de l'UE (accordéon) */}
                      <button
                        onClick={() => toggleUnite(unite.id)}
                        className="w-full flex items-center justify-between p-4 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${valide ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {unite.code} - {unite.intitule}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {unite.elements?.length || 0} élément{(unite.elements?.length || 0) > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            valide ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300'
                          } mr-3`}>
                            {valide ? 'Validée' : 'Non validée'}
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white mr-3">
                            {moyenne.toFixed(2)}/20
                          </span>
                          <svg 
                            className={`h-5 w-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Contenu de l'UE (éléments constitutifs) */}
                      {isExpanded && (
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                          {unite.elements && unite.elements.length > 0 ? (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                              {unite.elements.map(element => (
                                <div key={element.id} className="py-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {element.designation || `Élément ${element.id}`}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {element.credit} crédit{element.credit > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.5"
                                      value={notes[element.id] || 0}
                                      onChange={(e) => updateNote(element.id, parseFloat(e.target.value))}
                                      className="w-16 py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md text-center focus:outline-none focus:ring-primary focus:border-primary text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">/20</span>
                                    <span className={`ml-4 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      (notes[element.id] || 0) >= 10 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300' 
                                        : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300'
                                    }`}>
                                      {(notes[element.id] || 0) >= 10 ? 'Réussi' : 'Échoué'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 py-2 text-center">
                              Aucun élément constitutif pour cette unité
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}