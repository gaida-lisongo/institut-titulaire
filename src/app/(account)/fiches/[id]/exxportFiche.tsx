"use client";

import ficheCotation from '@/services/generatExcel';
import { Student } from "@/types/jury";
import { useState } from "react";

type CourseInfo = {
  code: string;
  ecue: string;
  filiaire: string;
  credit: number;
  annee: string;
  statut: string;
};

type ExportButtonProps = {
  students: Student[];
  courseInfo: CourseInfo;
};

const ExportButton = ({ students, courseInfo }: ExportButtonProps) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return; // Éviter les clics multiples

    try {
      setExporting(true);

      // Vérifier que les données requises sont présentes
      if (!students || students.length === 0) {
        alert("Aucun étudiant à exporter.");
        setExporting(false);
        return;
      }

      if (!courseInfo || !courseInfo.code || !courseInfo.ecue) {
        alert("Informations du cours incomplètes.");
        setExporting(false);
        return;
      }
      if (!students) return;
      const success = await ficheCotation.generateAndDownloadExcel(
        students,
        courseInfo,
      );

      if (!success) {
        alert(
          "Une erreur est survenue lors de la génération du fichier Excel.",
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Une erreur inattendue est survenue.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || students.length === 0}
      className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
      title={
        students.length === 0
          ? "Aucun étudiant à exporter"
          : "Exporter les notes en Excel"
      }
    >
      {exporting ? (
        <>
          <span>Génération en cours...</span>
          <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Exporter en Excel
        </>
      )}
    </button>
  );
};

export default ExportButton;