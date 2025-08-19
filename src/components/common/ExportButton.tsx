"use client";

import { useState } from "react";
import * as ExcelJS from "exceljs";

type ExportData = {
  id: number;
  matricule: string;
  nom: string;
  prenom?: string;
  e_mail?: string;
  date_created?: string;
  note?: string;
  observation?: string;
  [key: string]: any;
};

type ExportButtonProps = {
  data: ExportData[];
  filename?: string;
  sheetName?: string;
  title?: string;
  className?: string;
  variant?: "primary" | "secondary" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children?: React.ReactNode;
};

const ExportButton = ({
  data,
  filename = "export",
  sheetName = "Données",
  title = "Rapport d'exportation",
  className = "",
  variant = "success",
  size = "md",
  disabled = false,
  children
}: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-primary text-white hover:bg-primary/90";
      case "secondary":
        return "bg-gray-500 text-white hover:bg-gray-600";
      case "success":
        return "bg-green-600 text-white hover:bg-green-700";
      default:
        return "bg-primary text-white hover:bg-primary/90";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "md":
        return "px-4 py-2 text-sm";
      case "lg":
        return "px-6 py-3 text-base";
      default:
        return "px-4 py-2 text-sm";
    }
  };

  const exportToExcel = async () => {
    if (data.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }

    setIsExporting(true);

    try {
      // Créer un nouveau classeur
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // Métadonnées du fichier
      workbook.creator = "Section App";
      workbook.created = new Date();
      workbook.modified = new Date();

      // Configuration des colonnes
      worksheet.columns = [
        { header: "Matricule", key: "matricule", width: 15 },
        { header: "Nom", key: "nom", width: 20 },
        { header: "Prénom", key: "prenom", width: 20 },
        { header: "Email", key: "e_mail", width: 25 },
        { header: "Date d'inscription", key: "date_created", width: 18 },
        { header: "Note (/20)", key: "note", width: 12 },
        { header: "Observations", key: "observation", width: 40 }
      ];

      // Ajouter un titre
      worksheet.mergeCells('A1:G1');
      const titleRow = worksheet.getCell('A1');
      titleRow.value = title;
      titleRow.font = { 
        size: 16, 
        bold: true, 
        color: { argb: 'FF2563EB' } 
      };
      titleRow.alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
      };
      titleRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' }
      };

      // Ajouter une ligne vide
      worksheet.addRow([]);

      // Ajouter les en-têtes avec style
      const headerRow = worksheet.addRow([
        "Matricule",
        "Nom", 
        "Prénom",
        "Email",
        "Date d'inscription",
        "Note (/20)",
        "Observations"
      ]);

      // Styliser les en-têtes
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2563EB' }
        };
        cell.alignment = { 
          vertical: 'middle', 
          horizontal: 'center' 
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Ajouter les données
      data.forEach((item) => {
        const row = worksheet.addRow([
          item.matricule || '',
          item.nom || '',
          item.prenom || '',
          item.e_mail || '',
          formatDate(item.date_created),
          item.note ? parseFloat(item.note) : '',
          item.observation || ''
        ]);

        // Styliser les lignes de données
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };

          // Colorer les notes selon leur valeur
          if (colNumber === 6 && item.note) { // Colonne Note
            const note = parseFloat(item.note);
            if (note >= 16) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
            } else if (note >= 14) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
            } else if (note >= 12) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
            } else if (note >= 10) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFED7AA' } };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFECACA' } };
            }
          }
        });
      });

      // Ajouter des statistiques à la fin
      worksheet.addRow([]);
      const statsRow = worksheet.addRow([
        '',
        'Statistiques:',
        `Total: ${data.length}`,
        `Notés: ${data.filter(e => e.note).length}`,
        `Non notés: ${data.filter(e => !e.note).length}`,
        `Moyenne: ${data.filter(e => e.note).length > 0 
          ? (data.filter(e => e.note).reduce((sum, e) => sum + parseFloat(e.note!), 0) / data.filter(e => e.note).length).toFixed(2)
          : 'N/A'
        }`,
        ''
      ]);

      // Styliser la ligne de statistiques
      statsRow.eachCell((cell, colNumber) => {
        if (colNumber >= 2 && colNumber <= 6) {
          cell.font = { bold: true, color: { argb: 'FF1F2937' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF3F4F6' }
          };
        }
      });

      // Figer la première ligne (titre + en-têtes)
      worksheet.views = [{ state: 'frozen', ySplit: 3 }];

      // Générer le fichier
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Télécharger le fichier
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Export réussi!");
      
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Une erreur est survenue lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToExcel}
      disabled={disabled || isExporting || data.length === 0}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabled || data.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md active:scale-95'}
        ${className}
      `}
      title={data.length === 0 ? "Aucune donnée à exporter" : "Exporter vers Excel"}
    >
      {isExporting ? (
        <>
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Export...
        </>
      ) : (
        <>
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
              d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" 
            />
          </svg>
          {children || "Exporter Excel"}
        </>
      )}
    </button>
  );
};

export default ExportButton;