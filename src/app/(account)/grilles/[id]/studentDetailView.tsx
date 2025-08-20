"use client";
import { titulaireApi } from '@/api';
import { Student, Unite } from '@/types/jury';
import React, { useState, useEffect } from 'react';
import { useParams } from "next/navigation";

type StudentDetailViewProps = {
  student: Student;
  unites: Unite[];
  onBack: () => void;
};

// Type pour les notes d'un étudiant
type Notes = {
  [elementId: number]: number;
};

// Type pour la modal d'édition des notes
type EditNoteModalProps = {
  isOpen: boolean;
  element: any;
  noteInfo: {
    id: number;
    date_created: string;
    cmi: number;
    examen: number;
    rattrapage: number;
  } | null;
  onClose: () => void;
  onSave: (
    elementId: number,
    cmi: number,
    examen: number,
    rattrapage: number,
    password: string,
  ) => void;
};

// Modal pour éditer les notes
function EditNoteModal({
  isOpen,
  element,
  noteInfo,
  onClose,
  onSave,
}: EditNoteModalProps) {
  const [cmi, setCmi] = useState(0);
  const [examen, setExamen] = useState(0);
  const [rattrapage, setRattrapage] = useState(0);
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (noteInfo) {
      setCmi(noteInfo.cmi);
      setExamen(noteInfo.examen);
      setRattrapage(noteInfo.rattrapage);
    } else {
      setCmi(0);
      setExamen(0);
      setRattrapage(0);
    }
    setPassword("");
  }, [noteInfo, isOpen]);

  const handleSave = async () => {
    if (!password.trim()) {
      alert("Veuillez saisir le mot de passe de délibération");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(element.id, cmi, examen, rattrapage, password);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const totalPrincipal = cmi + examen;
  const noteFinale = Math.max(totalPrincipal, rattrapage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Modifier les notes
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 py-4">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
            <h4 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
              {element?.designation || `Élément ${element?.id}`}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {element?.credit} crédit{element?.credit > 1 ? "s" : ""}
            </p>
            {/* Afficher l'ID de la note si elle existe */}
            {noteInfo?.id && (
              <p className="mt-1 text-xs text-gray-400">
                Note ID: {noteInfo.id}
              </p>
            )}
          </div>

          {/* Notes CMI */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Note CMI (Contrôle continu)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={cmi}
              onChange={(e) => setCmi(parseFloat(e.target.value) || 0)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Note sur 20"
            />
          </div>

          {/* Notes Examen */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Note Examen
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={examen}
              onChange={(e) => setExamen(parseFloat(e.target.value) || 0)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Note sur 20"
            />
          </div>

          {/* Notes Rattrapage */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Note Rattrapage
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={rattrapage}
              onChange={(e) => setRattrapage(parseFloat(e.target.value) || 0)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Note sur 20"
            />
          </div>

          {/* Calcul automatique */}
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Total principal (CMI + Examen):
              </span>
              <span className="font-medium">
                {totalPrincipal.toFixed(2)}/20
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Note rattrapage:
              </span>
              <span className="font-medium">{rattrapage.toFixed(2)}/20</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-blue-200 pt-2 text-sm font-bold dark:border-blue-800">
              <span className="text-gray-900 dark:text-white">
                Note finale:
              </span>
              <span
                className={`${noteFinale >= 10 ? "text-green-600" : "text-red-600"}`}
              >
                {noteFinale.toFixed(2)}/20
              </span>
            </div>
          </div>

          {/* Mot de passe de délibération */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mot de passe de délibération *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Saisissez le mot de passe"
              required
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !password.trim()}
            className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg
                  className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentDetailView({
  student,
  unites,
  onBack,
}: StudentDetailViewProps) {
  const [expandedUnites, setExpandedUnites] = useState<number[]>([]);
  const [notes, setNotes] = useState<Notes>({});
  const [isSaving, setIsSaving] = useState(false);
  const [notesInfo, setNotesInfo] = useState<{
    [elementId: number]: {
      date_created: string;
      cmi: number;
      examen: number;
      rattrapage: number;
      id: number;
    } | null;
  }>({});
  const [loading, setLoading] = useState(true);
  const id = useParams().id;
  // États pour la modal d'édition
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any>(null);

  const fetchNote = async ({
    id_etudiant,
    id_element,
    id_annee,
  }: {
    id_etudiant: number;
    id_element: number;
    id_annee: number;
  }) => {
    try {
      const request = await titulaireApi.fetchNote({
        id_etudiant,
        id_element,
        id_annee,
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
  };

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

    unites.forEach((unite) => {
      if (!unite.elements || !unite.id_annee) {
        return;
      }

      unite.elements.forEach((element) => {
        const promise = fetchNote({
          id_etudiant: student.id_etudiant,
          id_element: element.id,
          id_annee: unite.id_annee,
        })
          .then((noteData) => {
            if (noteData && noteData.length > 0) {
              const { id, date_created, cmi, examen, rattrapage } = noteData[0];

              const cmiValue = parseFloat(cmi ?? "0");
              const examenValue = parseFloat(examen ?? "0");
              const rattrapageValue = parseFloat(rattrapage ?? "0");

              const totalPrincipal = cmiValue + examenValue;
              const totalRattrapage = rattrapageValue;

              setNotesInfo((prev) => ({
                ...prev,
                [element.id]: {
                  id,
                  date_created,
                  cmi: cmiValue,
                  examen: examenValue,
                  rattrapage: rattrapageValue,
                },
              }));

              simulatedNotes[element.id] =
                totalPrincipal >= totalRattrapage
                  ? totalPrincipal
                  : totalRattrapage;
              setNotes((prevNotes) => ({
                ...prevNotes,
                [element.id]:
                  totalPrincipal >= totalRattrapage
                    ? totalPrincipal
                    : totalRattrapage,
              }));
            } else {
              simulatedNotes[element.id] = 0;
              setNotes((prevNotes) => ({
                ...prevNotes,
                [element.id]: 0,
              }));
            }
          })
          .catch((error) => {
            console.error(
              `Erreur lors du chargement de la note pour l'élément ${element.id}:`,
              error,
            );
            simulatedNotes[element.id] = 0;
            setNotes((prevNotes) => ({
              ...prevNotes,
              [element.id]: 0,
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
      .catch((error) => {
        console.error("Erreur lors du chargement des notes:", error);
        setLoading(false);
      });
  }, [unites, student]);

  // Calcul de la moyenne d'une UE
  const calculateUniteMoyenne = (
    unite: Unite,
  ): { moyenne: number; valide: boolean } => {
    if (!unite.elements || unite.elements.length === 0)
      return { moyenne: 0, valide: false };

    let totalPoints = 0;
    let totalCredits = 0;

    unite.elements.forEach((element) => {
      const note = notes[element.id] || 0;
      totalPoints += note * element.credit;
      totalCredits += element.credit;
    });

    const moyenne = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return {
      moyenne,
      valide: moyenne >= 10,
    };
  };

  // Toggle l'expansion d'une unité
  const toggleUnite = (uniteId: number) => {
    setExpandedUnites((prev) =>
      prev.includes(uniteId)
        ? prev.filter((id) => id !== uniteId)
        : [...prev, uniteId],
    );
  };

  // Ouvrir la modal d'édition
  const openEditModal = (element: any) => {
    setSelectedElement(element);
    setEditModalOpen(true);
  };

  // Mise à jour d'une note
  const updateNote = (elementId: number, value: number) => {
    const clampedValue = Math.min(20, Math.max(0, value));
    setNotes((prev) => ({
      ...prev,
      [elementId]: clampedValue,
    }));
  };

  // Sauvegarder les notes
  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const savePromises = Object.entries(notes).map(
        async ([elementIdStr, noteValue]) => {
          const elementId = parseInt(elementIdStr);
          const noteInfo = notesInfo[elementId];

          if (noteInfo) {
            console.log(
              `Mise à jour de la note ${noteInfo.id} pour l'élément ${elementId}: ${noteValue}`,
            );
          } else {
            console.log(
              `Création d'une note pour l'élément ${elementId}: ${noteValue}`,
            );
          }
        },
      );

      await Promise.all(savePromises);
      console.log("Notes sauvegardées avec succès:", notes);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Sauvegarder les notes depuis la modal
  const handleSaveNote = async (
    elementId: number,
    cmi: number,
    examen: number,
    rattrapage: number,
    password: string,
  ) => {
    try {
      const noteInfo = notesInfo[elementId];
      const noteId = noteInfo?.id || null; // Récupérer l'ID de la note existante

      // Ici tu peux ajouter la logique d'API pour sauvegarder avec le mot de passe
      console.log("Sauvegarde note:", {
        noteId, // ID de la note (null si nouvelle note)
        elementId,
        cmi,
        examen,
        rattrapage,
        password,
        studentId: student.id_etudiant,
      });

      const request = await titulaireApi.checkAutorizationJury({
        id: parseFloat(Array.isArray(id) ? id[0] : id || "0"),
        code: password,
      });

      console.log("Autorisation jury:", request);
      if (request.success) {
        const response = request.data;

        if (response.length > 0) {
          // Get the old note info for this element
          const oldNote = notesInfo[elementId];

          if (oldNote) {
            // Compare each field with old values to detect changes
            const changes: Record<
              string,
              { old: number; new: number; changed: boolean }
            > = {
              cmi: { old: oldNote.cmi, new: cmi, changed: oldNote.cmi !== cmi },
              examen: {
                old: oldNote.examen,
                new: examen,
                changed: oldNote.examen !== examen,
              },
              rattrapage: {
                old: oldNote.rattrapage,
                new: rattrapage,
                changed: oldNote.rattrapage !== rattrapage,
              },
            };

            // Log which values changed
            Promise.all(
              Object.entries(changes).map(async ([field, value]) => {
                if (value.changed) {
                  console.log(
                    `${field} was modified from ${value.old} to ${value.new}`,
                  );

                  if (noteId !== null) {
                    const changedNote = await titulaireApi.updateNoteCharge({
                      cmdId: noteId,
                      col: field,
                      value: value.new,
                    });

                    if (changedNote.success) {
                      const data = changedNote.data;

                      if (data.affectedRows) {
                        // Mettre à jour les notes localement
                        const totalPrincipal = cmi + examen;
                        const noteFinale = Math.max(totalPrincipal, rattrapage);

                        setNotes((prev) => ({
                          ...prev,
                          [elementId]: noteFinale,
                        }));

                        setNotesInfo((prev) => ({
                          ...prev,
                          [elementId]: {
                            id: noteId || Date.now(), // Utiliser l'ID existant ou générer un temporaire
                            date_created:
                              noteInfo?.date_created ||
                              new Date().toISOString(),
                            cmi,
                            examen,
                            rattrapage,
                          },
                        }));

                        // Appeler ton API avec l'ID de la note
                        if (noteId) {
                          // Mise à jour d'une note existante
                          console.log(`Mise à jour de la note ID: ${noteId}`);
                          // await titulaireApi.updateNote({ noteId, cmi, examen, rattrapage, password });
                        } else {
                          // Création d'une nouvelle note
                          console.log("Création d'une nouvelle note");
                          // await titulaireApi.createNote({ elementId, studentId: student.id_etudiant, cmi, examen, rattrapage, password });
                        }

                        alert("Note sauvegardée avec succès");
                      }
                    }
                  }
                }
              }),
            );
          } else {
            // This is a new note
            console.log("Creating new note with values:", {
              cmi,
              examen,
              rattrapage,
            });
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde");
      throw error;
    }
  };

  // Calcul du résultat global
  const calculateOverallResult = () => {
    let totalMoyenne = 0;
    let validCount = 0;
    let totalUnites = 0;

    unites.forEach((unite) => {
      const { moyenne, valide } = calculateUniteMoyenne(unite);
      totalMoyenne += moyenne;
      if (valide) validCount++;
      totalUnites++;
    });

    const overallMoyenne = totalUnites > 0 ? totalMoyenne / totalUnites : 0;
    const passed = validCount === totalUnites;

    return {
      moyenne: overallMoyenne,
      status: passed ? "Admis" : "Ajourné",
      validCount,
      totalUnites,
    };
  };

  const result = calculateOverallResult();

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Retour à la liste
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Résultats de {student.nom}
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Chargement des notes...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Informations étudiant - colonne de gauche */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <div className="mb-6 flex flex-col items-center">
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt={student.nom}
                    className="h-24 w-24 rounded-full border-4 border-primary/20 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
                    {student.nom.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="mt-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
                  {student.nom}
                </h2>
                <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="mr-2">{student.matricule}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      student.sexe === "M"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300"
                        : "bg-pink-100 text-pink-800 dark:bg-pink-800/20 dark:text-pink-300"
                    }`}
                  >
                    {student.sexe === "M" ? "Homme" : "Femme"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-3 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Grade: <span className="font-medium">{student.grade}</span>
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-3 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Nationalité:{" "}
                    <span className="font-medium">{student.nationalite}</span>
                  </span>
                </div>
                {student.date_naissance && (
                  <div className="flex items-center text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-3 h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Né(e) le:{" "}
                      <span className="font-medium">
                        {new Date(student.date_naissance).toLocaleDateString(
                          "fr-FR",
                        )}
                      </span>
                    </span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-3 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Tél:{" "}
                    <span className="font-medium">{student.telephone}</span>
                  </span>
                </div>
              </div>

              {/* Résultat global */}
              <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Résultat global
                </h4>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Moyenne générale:
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {result.moyenne.toFixed(2)}/20
                  </span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Unités validées:
                  </span>
                  <span className="font-semibold">
                    {result.validCount}/{result.totalUnites}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Résultat:
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      result.status === "Admis"
                        ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Accordéon des UE et éléments - 2 colonnes à droite */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="mb-6 text-lg font-medium text-gray-900 dark:text-white">
                Unités d'enseignement
              </h3>

              <div className="space-y-3">
                {unites.map((unite) => {
                  const { moyenne, valide } = calculateUniteMoyenne(unite);
                  const isExpanded = expandedUnites.includes(unite.id);

                  return (
                    <div
                      key={unite.id}
                      className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      {/* En-tête de l'UE (accordéon) */}
                      <button
                        onClick={() => toggleUnite(unite.id)}
                        className="flex w-full items-center justify-between bg-gray-50 p-4 text-left transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                      >
                        <div className="flex items-center">
                          <div
                            className={`mr-3 h-2 w-2 rounded-full ${valide ? "bg-green-500" : "bg-red-500"}`}
                          ></div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {unite.code} - {unite.intitule}
                            </h4>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {unite.elements?.length || 0} élément
                              {(unite.elements?.length || 0) > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              valide
                                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"
                            } mr-3`}
                          >
                            {valide ? "Validée" : "Non validée"}
                          </span>
                          <span className="mr-3 text-sm font-bold text-gray-900 dark:text-white">
                            {moyenne.toFixed(2)}/20
                          </span>
                          <svg
                            className={`h-5 w-5 transform text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>

                      {/* Contenu de l'UE (éléments constitutifs) */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                          {unite.elements && unite.elements.length > 0 ? (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                              {unite.elements.map((element) => (
                                <div
                                  key={element.id}
                                  className="flex items-center justify-between py-3"
                                >
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {element.designation ||
                                        `Élément ${element.id}`}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                      {element.credit} crédit
                                      {element.credit > 1 ? "s" : ""}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    {/* Affichage de la note */}
                                    <div className="text-center">
                                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {(notes[element.id] || 0).toFixed(2)}
                                      </span>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        /20
                                      </span>
                                    </div>

                                    {/* Badge de réussite */}
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                        (notes[element.id] || 0) >= 10
                                          ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300"
                                          : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"
                                      }`}
                                    >
                                      {(notes[element.id] || 0) >= 10
                                        ? "Réussi"
                                        : "Échoué"}
                                    </span>

                                    {/* Bouton modifier */}
                                    <button
                                      onClick={() => openEditModal(element)}
                                      className="inline-flex items-center rounded-md border border-primary bg-white px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mr-1 h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                      </svg>
                                      Modifier
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="py-2 text-center text-sm text-gray-500 dark:text-gray-400">
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

      {/* Modal d'édition des notes */}
      <EditNoteModal
        isOpen={editModalOpen}
        element={selectedElement}
        noteInfo={selectedElement ? notesInfo[selectedElement.id] : null}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedElement(null);
        }}
        onSave={handleSaveNote}
      />
    </div>
  );
}