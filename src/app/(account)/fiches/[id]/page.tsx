"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { titulaireApi } from "@/api";
import Banner from "@/components/Banner";
import ExportButton from "./exxportFiche";
import { Student } from "@/types/jury";

export default function FicheDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [fiche, setFiche] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editedStudent, setEditedStudent] = useState<{
    id: number;
    cmi: number;
    examen: number | null;
    rattrapage: number | null;
  } | null>(null);
  const [savingStudentChanges, setSavingStudentChanges] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState(false);

  // Ajouter cette fonction dans votre composant FicheDetail
  const handleBannerEdit = (editedFiche: any) => {
    console.log("Banner edited with new data:", editedFiche);
    setFiche(editedFiche);
  };

  const fetchStudents = async () => {
    try {
      const request = await titulaireApi.fetchStudentsByCharge(id);
      console.log("Students fetched:", request);
      if (request.success) {
        setStudents(request.data);
      } else {
        setError(
          request.message || "Erreur lors de la récupération des étudiants",
        );
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchFicheData = async () => {
    try {
      const charges = localStorage.getItem("charges");
      setLoading(true);
      if (charges) {
        const parsedCharges = JSON.parse(charges);
        const charge = parsedCharges.find(
          (c: { id: number }) => c.id === Number(id),
        );
        console.log("Charge trouvée:", charge);
        if (charge) {
          setFiche(charge);
          setLoading(false);
        } else {
          setError("Fiche non trouvée");
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la fiche:", error);
      setError("Une erreur est survenue lors du chargement de la fiche");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchFicheData();
      fetchStudents();
    }
  }, [id]);

  const openStudentModal = (student: Student) => {
    setSelectedStudent(student);
    // S'assurer que tous les champs nécessaires sont présents dans editedStudent
    setEditedStudent({
      id: student.id,
      cmi: Number(student.cmi) || 0,
      examen: Number(student.examen) || 0,
      rattrapage: Number(student.rattrapage) || 0,
    });
    setShowStudentModal(true);
  };

  const confirmDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
    setDeleteConfirmation(true);
  };

  const deleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      setDeletingStudent(true);

      // Appel à l'API pour supprimer l'étudiant
      const request = await titulaireApi.deleteStudentFromCharge({
        id: studentToDelete.id,
      });

      if (request.success) {
        // Mettre à jour l'état local en retirant l'étudiant supprimé
        setStudents(
          students.filter((student) => student.id !== studentToDelete.id),
        );
        setDeleteConfirmation(false);
        setStudentToDelete(null);
      } else {
        console.error(
          "Erreur lors de la suppression de l'étudiant:",
          request.message,
        );
      }

      setDeletingStudent(false);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'étudiant:", error);
      setDeletingStudent(false);
    }
  };
  // Voici la fonction handleStudentChange corrigée
  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Mettre à jour l'état local d'abord
    setEditedStudent((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  // Fonction séparée pour envoyer les modifications à l'API
  const saveStudentNote = async (id: number, col: string, value: any) => {
    try {
      setSavingStudentChanges(true);

      const request = await titulaireApi.updateNoteCharge({
        cmdId: id,
        col,
        value,
      });

      console.log("Updating value", request);

      if (request.success) {
        // Mettre à jour la liste des étudiants après une modification réussie
        setStudents(
          students.map((student) =>
            student.id === id ? { ...student, [col]: value } : student,
          ),
        );

        setSavingStudentChanges(false);
        return true;
      } else {
        setSavingStudentChanges(false);
        return false;
      }
    } catch (error) {
      console.error("Error updating student note:", error);
      setSavingStudentChanges(false);
      return false;
    }
  };

  // Fonction pour calculer les différents totaux
  const calculateTotals = (
    cmi: string,
    examen: string | null,
    rattrapage: string | null,
    credit: number,
  ) => {
    const cmiValue = parseFloat(cmi) || 0;
    const examenValue = parseFloat(examen || "0") || 0;
    const rattrapageValue = parseFloat(rattrapage || "0") || 0;

    const totalAnnuel = cmiValue + examenValue;
    let totalObtenu = totalAnnuel;

    if (rattrapageValue > 0 && rattrapageValue > totalAnnuel) {
      totalObtenu = rattrapageValue;
    }

    const totalPond = totalObtenu * credit;

    return {
      totalAnnuel,
      totalObtenu,
      totalPond,
      mention: getMention(totalObtenu),
    };
  };

  // Fonction pour déterminer la mention
  const getMention = (total: number) => {
    if (total < 10) return "Échec";
    if (total < 12) return "Passable";
    if (total < 14) return "Assez Bien";
    if (total < 16) return "Bien";
    if (total < 18) return "Très Bien";
    return "Excellent";
  };

  // Fonction pour sauvegarder toutes les modifications
  const saveStudentChanges = async () => {
    if (!editedStudent || !selectedStudent) return;

    try {
      setSavingStudentChanges(true);

      // Vérifier quelles notes ont été modifiées et les sauvegarder
      const updates = [];

      if (editedStudent.cmi !== selectedStudent.cmi) {
        updates.push(
          saveStudentNote(editedStudent.id, "cmi", editedStudent.cmi),
        );
      }

      if (editedStudent.examen !== selectedStudent.examen) {
        updates.push(
          saveStudentNote(editedStudent.id, "examen", editedStudent.examen),
        );
      }

      if (editedStudent.rattrapage !== selectedStudent.rattrapage) {
        updates.push(
          saveStudentNote(
            editedStudent.id,
            "rattrapage",
            editedStudent.rattrapage,
          ),
        );
      }

      // Attendre que toutes les mises à jour soient terminées
      if (updates.length > 0) {
        await Promise.all(updates);
      }

      setShowStudentModal(false);
      setSavingStudentChanges(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des notes:", error);
      setSavingStudentChanges(false);
    }
  };

  const saveChanges = async () => {
    try {
      setSavingStudentChanges(true);

      // Simuler un délai d'appel API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Ici vous devriez appeler votre API pour sauvegarder les modifications
      // const response = await titulaireApi.updateFiche(id, editedFiche);

      // Pour l'instant, nous mettons simplement à jour l'état local
      setFiche(editedStudent);

      // Mettre à jour le localStorage
      const charges = localStorage.getItem("charges");
      if (charges) {
        const parsedCharges = JSON.parse(charges);
        const updatedCharges = parsedCharges.map((c: { id: number }) =>
          c.id === Number(id) ? editedStudent : c,
        );
        localStorage.setItem("charges", JSON.stringify(updatedCharges));
      }

      // Fermer la modale
      setShowStudentModal(false);
      setSavingStudentChanges(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des modifications:", error);
      setSavingStudentChanges(false);
      // Afficher un message d'erreur
    }
  };

  // Filtrer les étudiants en fonction des critères de recherche et du filtre de sexe
  const filteredStudents = students.filter((student) => {
    // Filtrer par terme de recherche (nom, prénom, matricule)
    const matchesSearch =
      searchTerm === "" ||
      student.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricule?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtrer par sexe
    const matchesGender = genderFilter === "" || student.sexe === genderFilter;

    return matchesSearch && matchesGender;
  });

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          <p className="mt-4 text-lg">Chargement de la fiche...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="max-w-lg rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20">
          <h2 className="mb-4 text-xl font-semibold text-red-700 dark:text-red-400">
            Erreur
          </h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!fiche) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="max-w-lg rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-900 dark:bg-yellow-900/20">
          <h2 className="mb-4 text-xl font-semibold text-yellow-700 dark:text-yellow-400">
            Fiche non trouvée
          </h2>
          <p className="text-yellow-600 dark:text-yellow-300">
            La fiche demandée n'existe pas ou a été supprimée.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Utiliser le composant Banner au lieu du JSX directement */}
      <Banner fiche={fiche} onEdit={handleBannerEdit} />

      {/* Section des étudiants inscrits */}
      <div className="mt-8">
        <div className="mb-6 rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark">
          <h2 className="mb-6 text-2xl font-bold">Étudiants inscrits</h2>

          {/* Métriques */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-dark-3 dark:bg-dark-2">
              <h3 className="mb-1 text-lg font-medium">Total d'étudiants</h3>
              <p className="text-3xl font-semibold text-primary">
                {students.length}
              </p>
            </div>

            <div className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-dark-3 dark:bg-dark-2">
              <h3 className="mb-1 text-lg font-medium">Hommes</h3>
              <p className="text-3xl font-semibold text-blue-500">
                {students.filter((student) => student.sexe === "M").length}
              </p>
            </div>

            <div className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-dark-3 dark:bg-dark-2">
              <h3 className="mb-1 text-lg font-medium">Femmes</h3>
              <p className="text-3xl font-semibold text-pink-500">
                {students.filter((student) => student.sexe === "F").length}
              </p>
            </div>

            <div className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-dark-3 dark:bg-dark-2">
              <h3 className="mb-1 text-lg font-medium">Taux de réussite</h3>
              <p className="text-3xl font-semibold text-green-500">
                {students.length > 0
                  ? `${Math.round(
                      (students.filter((s) => {
                        const cmiValue = parseFloat(String(s.cmi || "0")) || 0;
                        const examenValue = parseFloat(String(s.examen || "0")) || 0;
                        const rattrapageValue = parseFloat(String(s.rattrapage || "0")) || 0;

                        const totalAnnuel = cmiValue + examenValue;
                        let totalObtenu = totalAnnuel;

                        if (
                          rattrapageValue > 0 &&
                          rattrapageValue > totalAnnuel
                        ) {
                          totalObtenu = rattrapageValue;
                        }

                        return totalObtenu >= 10;
                      }).length /
                        students.length) *
                        100,
                    )}%`
                  : "0%"}
              </p>
            </div>
          </div>

          {/* Recherche et filtres */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou matricule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 pl-10 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-body-color h-5 w-5 dark:text-dark-6"
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
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
                >
                  <option value="">Tous les sexes</option>
                  <option value="M">Hommes</option>
                  <option value="F">Femmes</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setGenderFilter("");
                }}
                className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium transition hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-2"
              >
                Réinitialiser
              </button>
              {students.length > 0 && (
                <div className="mb-4">
                  <ExportButton
                    students={students}
                    courseInfo={{
                      code: fiche.code || "",
                      ecue: fiche.ecue || "",
                      filiaire: fiche.filiaire || "",
                      credit: Number(fiche.credit) || 0,
                      annee: fiche.annee || "",
                      statut: fiche.statut || "",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tableau des étudiants - Modifié avec des boutons d'action */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-dark-2">
                  <th className="px-4 py-4 font-medium text-dark dark:text-white">
                    Matricule
                  </th>
                  <th className="px-4 py-4 font-medium text-dark dark:text-white">
                    Nom
                  </th>
                  <th className="px-4 py-4 font-medium text-dark dark:text-white">
                    Prénom
                  </th>
                  <th className="px-4 py-4 font-medium text-dark dark:text-white">
                    Sexe
                  </th>
                  <th className="px-4 py-4 font-medium text-dark dark:text-white">
                    Nationalité
                  </th>
                  <th className="px-4 py-4 font-medium text-dark dark:text-white">
                    CMI
                  </th>
                  <th className="px-4 py-4 font-medium text-dark dark:text-white">
                    Examen
                  </th>
                  <th className="px-4 py-4 font-medium text-dark dark:text-white">
                    Rattrapage
                  </th>
                  <th className="px-4 py-4 font-medium text-dark dark:text-white">
                    Total obtenu
                  </th>
                  <th className="px-4 py-4 text-center font-medium text-dark dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => {
                    // Calcul des totaux pour chaque étudiant
                    const { totalObtenu } = calculateTotals(
                      String(student.cmi || '0'),
                      (student.examen || "0").toString(),
                      (student.rattrapage || "0").toString(),
                      (fiche.credit || "0").toString(),
                    );

                    return (
                      <tr
                        key={student.id}
                        className={`${index % 2 === 0 ? "bg-white dark:bg-dark" : "bg-gray-50 dark:bg-dark-2"}`}
                      >
                        <td className="border-b border-stroke px-4 py-3 dark:border-dark-3">
                          {student.matricule}
                        </td>
                        <td className="border-b border-stroke px-4 py-3 dark:border-dark-3">
                          {student.nom}
                        </td>
                        <td className="border-b border-stroke px-4 py-3 dark:border-dark-3">
                          {student.prenom}
                        </td>
                        <td className="border-b border-stroke px-4 py-3 dark:border-dark-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              student.sexe === "M"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                : "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
                            }`}
                          >
                            {student.sexe === "M" ? "Homme" : "Femme"}
                          </span>
                        </td>
                        <td className="border-b border-stroke px-4 py-3 dark:border-dark-3">
                          {student.nationalite}
                        </td>
                        <td className="border-b border-stroke px-4 py-3 dark:border-dark-3">
                          <span
                            className={`font-medium ${
                              parseFloat(String(student.cmi || "0")) >= 5
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {student.cmi || "N/A"}
                          </span>
                        </td>
                        <td className="border-b border-stroke px-4 py-3 dark:border-dark-3">
                          <span
                            className={`font-medium ${
                              parseFloat(String(student.examen || "0")) >= 5
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {student.examen || "N/A"}
                          </span>
                        </td>
                        <td className="border-b border-stroke px-4 py-3 dark:border-dark-3">
                          <span
                            className={`font-medium ${
                              parseFloat(String(student.rattrapage || "0")) >= 10
                                ? "text-green-600 dark:text-green-400"
                                : parseFloat(String(student.rattrapage || "0")) > 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            {student.rattrapage || "N/A"}
                          </span>
                        </td>
                        <td className="border-b border-stroke px-4 py-3 dark:border-dark-3">
                          <span
                            className={`font-medium ${
                              totalObtenu >= 10
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {totalObtenu.toFixed(1)}
                          </span>
                        </td>
                        <td className="border-b border-stroke px-4 py-3 dark:border-dark-3">
                          <div className="flex items-center justify-center space-x-3">
                            {/* Bouton œil pour afficher la modal */}
                            <button
                              onClick={() => openStudentModal(student)}
                              className="rounded-lg bg-blue-50 p-2 text-blue-500 transition hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                              title="Voir les détails"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>

                            {/* Bouton de suppression */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDeleteStudent(student);
                              }}
                              className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                              title="Supprimer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="border-b border-stroke px-4 py-5 text-center dark:border-dark-3"
                    >
                      {students.length === 0
                        ? "Aucun étudiant inscrit dans ce cours"
                        : "Aucun étudiant ne correspond aux critères de recherche"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination si nécessaire (pour de grandes listes) */}
          {filteredStudents.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-body-color text-sm dark:text-dark-6">
                Affichage de {Math.min(filteredStudents.length, 1)}-
                {filteredStudents.length} sur {students.length} étudiants
              </p>

              <div className="flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded border border-stroke text-dark hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3 dark:text-white dark:hover:border-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
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
                </button>

                <button className="flex h-8 w-8 items-center justify-center rounded border border-primary bg-primary text-white dark:border-primary">
                  1
                </button>

                <button className="flex h-8 w-8 items-center justify-center rounded border border-stroke text-dark hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3 dark:text-white dark:hover:border-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal des détails de l'étudiant et modification des notes */}
      {showStudentModal && selectedStudent && editedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-dark">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-medium text-dark dark:text-white">
                Détails de l'étudiant
              </h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-dark-6 hover:text-dark dark:text-dark-4 dark:hover:text-white"
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

            {/* Information de l'étudiant */}
            <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-start">
              <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-dark-2 sm:mb-0 sm:mr-6">
                {selectedStudent.photo ? (
                  <img
                    src={selectedStudent.photo}
                    alt={`${selectedStudent.prenom || ""} ${selectedStudent.nom}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-semibold text-gray-400 dark:text-gray-600">
                    {selectedStudent.prenom ? selectedStudent.prenom[0] : ""}
                    {selectedStudent.nom ? selectedStudent.nom[0] : ""}
                  </span>
                )}
              </div>

              <div>
                <h4 className="mb-1 text-lg font-semibold text-dark dark:text-white">
                  {selectedStudent.prenom} {selectedStudent.nom}
                </h4>
                <p className="text-body-color mb-2 dark:text-dark-6">
                  Matricule:{" "}
                  <span className="font-medium">
                    {selectedStudent.matricule}
                  </span>
                </p>
                <p className="text-body-color mb-2 dark:text-dark-6">
                  Nationalité:{" "}
                  <span className="font-medium">
                    {selectedStudent.nationalite}
                  </span>
                </p>
                <p className="text-body-color dark:text-dark-6">
                  Email:{" "}
                  <span className="font-medium">
                    {selectedStudent.e_mail || "Non renseigné"}
                  </span>
                </p>
              </div>
            </div>

            {/* Détails des notes et calculs */}
            <div className="mb-6 rounded-lg border border-stroke bg-gray-50 p-4 dark:border-dark-3 dark:bg-dark-2">
              <h4 className="mb-4 text-lg font-medium text-dark dark:text-white">
                Résumé des résultats
              </h4>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {/* Calcul des totaux pour affichage */}
                {(() => {
                  const cmiValue = editedStudent.cmi || 0;
                  const examenValue =
                    parseFloat(String(editedStudent.examen || "0")) || 0;
                  const rattrapageValue =
                    editedStudent.rattrapage || 0;

                  const totalAnnuel = cmiValue + examenValue;
                  let totalObtenu = totalAnnuel;

                  if (rattrapageValue > 0 && rattrapageValue > totalAnnuel) {
                    totalObtenu = rattrapageValue;
                  }

                  const totalPond = totalObtenu * fiche.credit;
                  const mention = getMention(totalObtenu);

                  return (
                    <>
                      <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-dark">
                        <p className="text-body-color text-sm dark:text-dark-6">
                          CMI
                        </p>
                        <p
                          className={`text-lg font-semibold ${cmiValue >= 5 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {cmiValue.toFixed(1)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-dark">
                        <p className="text-body-color text-sm dark:text-dark-6">
                          Examen
                        </p>
                        <p
                          className={`text-lg font-semibold ${examenValue >= 5 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {examenValue.toFixed(1)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-dark">
                        <p className="text-body-color text-sm dark:text-dark-6">
                          Rattrapage
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            rattrapageValue >= 10
                              ? "text-green-600 dark:text-green-400"
                              : rattrapageValue > 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {rattrapageValue > 0
                            ? rattrapageValue.toFixed(1)
                            : "N/A"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-dark">
                        <p className="text-body-color text-sm dark:text-dark-6">
                          Total annuel
                        </p>
                        <p
                          className={`text-lg font-semibold ${totalAnnuel >= 10 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {totalAnnuel.toFixed(1)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-dark">
                        <p className="text-body-color text-sm dark:text-dark-6">
                          Total obtenu
                        </p>
                        <p
                          className={`text-lg font-semibold ${totalObtenu >= 10 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {totalObtenu.toFixed(1)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-dark">
                        <p className="text-body-color text-sm dark:text-dark-6">
                          Total pondéré
                        </p>
                        <p
                          className={`text-lg font-semibold ${totalPond >= 10 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {totalPond.toFixed(1)}
                        </p>
                      </div>

                      <div className="col-span-full rounded-lg bg-white p-3 shadow-sm dark:bg-dark">
                        <p className="text-body-color text-sm dark:text-dark-6">
                          Mention
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            mention === "Échec"
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {mention}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Formulaire de modification des notes */}
            <div className="mb-6">
              <h4 className="mb-4 text-lg font-medium text-dark dark:text-white">
                Modifier les notes
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Champ CMI - Modifiable uniquement si statut différent de "VU" */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    CMI
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    name="cmi"
                    value={editedStudent.cmi}
                    onChange={handleStudentChange}
                    disabled={fiche.statut === "VU"}
                    className={`w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-dark-3 dark:bg-dark-2 dark:disabled:bg-dark-3`}
                  />
                  {fiche.statut === "VU" && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                      La note CMI ne peut pas être modifiée car le cours est
                      marqué comme "VU"
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Examen
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    name="examen"
                    value={editedStudent.examen || ""}
                    onChange={handleStudentChange}
                    disabled={fiche.statut !== "VU"}
                    className={`w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-dark-3 dark:bg-dark-2 dark:disabled:bg-dark-3`}
                  />
                  {fiche.statut !== "VU" && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                      La note d'examen ne peut être modifiée que si le cours est
                      marqué comme "VU"
                    </p>
                  )}
                </div>

                {/* Champ Rattrapage - Modifiable uniquement si statut est "VU" */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Rattrapage
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    name="rattrapage"
                    value={editedStudent.rattrapage || ""}
                    onChange={handleStudentChange}
                    disabled={fiche.statut !== "VU"}
                    className={`w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-dark-3 dark:bg-dark-2 dark:disabled:bg-dark-3`}
                  />
                  {fiche.statut !== "VU" && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                      La note de rattrapage ne peut être modifiée que si le
                      cours est marqué comme "VU"
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => setShowStudentModal(false)}
                className="rounded-lg border border-stroke bg-transparent px-6 py-3 font-medium text-dark transition hover:border-primary hover:bg-opacity-10 dark:border-dark-3 dark:text-white dark:hover:border-primary"
              >
                Fermer
              </button>

              {/* Bouton d'enregistrement - Actif uniquement si des modifications sont possibles */}
              {(fiche.statut !== "VU" || fiche.statut === "VU") && (
                <button
                  onClick={saveStudentChanges}
                  disabled={
                    savingStudentChanges ||
                    (fiche.statut === "VU" &&
                      editedStudent.examen === selectedStudent.examen &&
                      editedStudent.rattrapage ===
                        selectedStudent.rattrapage) ||
                    (fiche.statut !== "VU" &&
                      editedStudent.cmi === selectedStudent.cmi)
                  }
                  className="flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-70"
                >
                  {savingStudentChanges ? (
                    <>
                      Enregistrement...
                      <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
                    </>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteConfirmation && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-dark">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-medium text-dark dark:text-white">
                Confirmer la suppression
              </h3>
              <button
                onClick={() => {
                  setDeleteConfirmation(false);
                  setStudentToDelete(null);
                }}
                className="text-dark-6 hover:text-dark dark:text-dark-4 dark:hover:text-white"
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

            <div className="mb-6">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-500 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              <p className="mb-2 text-center text-lg font-medium text-dark dark:text-white">
                Êtes-vous sûr de vouloir supprimer cet étudiant ?
              </p>

              <p className="text-body-color text-center dark:text-dark-6">
                <span className="font-medium">
                  {studentToDelete.prenom} {studentToDelete.nom}
                </span>{" "}
                ({studentToDelete.matricule}) sera définitivement retiré de ce
                cours. Cette action est irréversible.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => {
                  setDeleteConfirmation(false);
                  setStudentToDelete(null);
                }}
                className="rounded-lg border border-stroke bg-transparent px-6 py-3 font-medium text-dark transition hover:border-primary hover:bg-opacity-10 dark:border-dark-3 dark:text-white dark:hover:border-primary"
              >
                Annuler
              </button>

              <button
                onClick={deleteStudent}
                disabled={deletingStudent}
                className="flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700 disabled:opacity-70"
              >
                {deletingStudent ? (
                  <>
                    Suppression...
                    <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
                  </>
                ) : (
                  "Supprimer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}