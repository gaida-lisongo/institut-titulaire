"use client";
import React, { useState, useMemo } from 'react';
import * as ExcelJS from 'exceljs';

type SeanceCommande = {
  id: number;
  id_etudiant: number;
  id_seance: number;
  statut: "PRESENT" | "ABSENT" | "PENDING";
  nom: string;
  prenom: string | null;
  matricule: string;
  grade: string;
  nationalite: string;
  date_naissance: string | null;
  e_mail: string;
  frais_acad: string;
  frais_connexe: string;
  photo: string | null;
}

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

type InscriptionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  seanceDetails: Seance; // Changé pour recevoir toutes les infos de la séance
  inscriptions: SeanceCommande[];
  onStatusChange: (id: number, newStatus: "PRESENT" | "ABSENT" | "PENDING") => Promise<void>;
  loading?: boolean;
};

const InscriptionsModal: React.FC<InscriptionsModalProps> = ({
  isOpen,
  onClose,
  seanceDetails,
  inscriptions,
  onStatusChange,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT" | "PENDING">("ALL");
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [exporting, setExporting] = useState(false);

  // Filtrage des inscriptions
  const filteredInscriptions = useMemo(() => {
    let filtered = inscriptions;

    // Filtre par recherche
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(inscription => 
        inscription.nom.toLowerCase().includes(lowerSearchTerm) ||
        (inscription.prenom && inscription.prenom.toLowerCase().includes(lowerSearchTerm)) ||
        inscription.matricule.toLowerCase().includes(lowerSearchTerm) ||
        inscription.e_mail.toLowerCase().includes(lowerSearchTerm) ||
        inscription.grade.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Filtre par statut
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(inscription => inscription.statut === statusFilter);
    }

    return filtered;
  }, [inscriptions, searchTerm, statusFilter]);

  // Statistiques
  const stats = useMemo(() => {
    const total = inscriptions.length;
    const present = inscriptions.filter(i => i.statut === "PRESENT").length;
    const absent = inscriptions.filter(i => i.statut === "ABSENT").length;
    const pending = inscriptions.filter(i => i.statut === "PENDING").length;
    
    return { total, present, absent, pending };
  }, [inscriptions]);

  // Fonction d'export Excel
  const exportToExcel = async () => {
    setExporting(true);
    
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Liste de Présence');

      // Métadonnées du document
      workbook.creator = 'Système de Gestion des Séances';
      workbook.lastModifiedBy = 'Système de Gestion des Séances';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Configuration de la page
      worksheet.pageSetup = {
        paperSize: 9, // A4
        orientation: 'portrait',
        margins: {
          left: 0.7,
          right: 0.7,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3,
        },
      };

      // Titre principal
      worksheet.mergeCells('A1:H1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LISTE DE PRÉSENCE';
      titleCell.font = { bold: true, size: 16, color: { argb: 'FF000000' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6E6' }
      };

      // Titre de la séance
      worksheet.addRow([]);
      worksheet.mergeCells('A3:H3');
      const seanceTitleCell = worksheet.getCell('A3');
      seanceTitleCell.value = seanceDetails.contenu;
      seanceTitleCell.font = { bold: true, size: 14, color: { argb: 'FF000000' } };
      seanceTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Espace
      worksheet.addRow([]);
      worksheet.addRow([]);

      // En-têtes du tableau
      const headerRow = worksheet.addRow([
        'N°',
        'Matricule',
        'Nom',
        'Prénom',
        'Grade',
        'Email',
        'Nationalité',
        'Statut'
      ]);

      // Style des en-têtes
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF366092' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Données des étudiants
      inscriptions.forEach((inscription, index) => {
        const row = worksheet.addRow([
          index + 1,
          inscription.matricule,
          inscription.nom,
          inscription.prenom || '',
          inscription.grade,
          inscription.e_mail,
          inscription.nationalite,
          inscription.statut === 'PRESENT' ? 'Présent' :
          inscription.statut === 'ABSENT' ? 'Absent' : 'En attente'
        ]);

        // Style des cellules
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle' };

          // Coloration selon le statut
          if (colNumber === 8) { // Colonne statut
            switch (inscription.statut) {
              case 'PRESENT':
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFD4F6D4' }
                };
                cell.font = { color: { argb: 'FF0F7B0F' } };
                break;
              case 'ABSENT':
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFDE2E2' }
                };
                cell.font = { color: { argb: 'FFB91C1C' } };
                break;
              case 'PENDING':
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFEF3C7' }
                };
                cell.font = { color: { argb: 'FFD97706' } };
                break;
            }
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        });
      });

      // Ajustement automatique des colonnes
      worksheet.columns = [
        { width: 5 },   // N°
        { width: 15 },  // Matricule
        { width: 20 },  // Nom
        { width: 20 },  // Prénom
        { width: 15 },  // Grade
        { width: 30 },  // Email
        { width: 15 },  // Nationalité
        { width: 12 }   // Statut
      ];

      // Ligne de signature
      worksheet.addRow([]);
      worksheet.addRow([]);
      worksheet.addRow(['', '', '', '', '', '', 'Date:', new Date().toLocaleDateString('fr-FR')]);

      // Génération du fichier
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Téléchargement
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nom du fichier avec date et heure
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `Liste_Presence_${seanceDetails.contenu.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}_${timeStr}.xlsx`;
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Export Excel terminé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      alert('Erreur lors de l\'export Excel. Veuillez réessayer.');
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = async (inscriptionId: number, newStatus: "PRESENT" | "ABSENT" | "PENDING") => {
    setUpdatingIds(prev => new Set(prev).add(inscriptionId));
    
    try {
      await onStatusChange(inscriptionId, newStatus);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(inscriptionId);
        return newSet;
      });
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'PRESENT':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'ABSENT':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'PENDING':
        return (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-6xl rounded-lg bg-white shadow-xl dark:bg-dark max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-dark-3 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-dark dark:text-white">
                Inscriptions à la séance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {seanceDetails.contenu}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 dark:bg-dark-2 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-dark dark:text-white">{stats.total}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-green-700 dark:text-green-400">{stats.present}</div>
              <div className="text-xs text-green-600 dark:text-green-400">Présents</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-red-700 dark:text-red-400">{stats.absent}</div>
              <div className="text-xs text-red-600 dark:text-red-400">Absents</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">{stats.pending}</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">En attente</div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="border-b border-gray-200 dark:border-dark-3 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, matricule, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filtre par statut */}
            <div className="min-w-[200px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "ALL" | "PRESENT" | "ABSENT" | "PENDING")}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PRESENT">Présents</option>
                <option value="ABSENT">Absents</option>
                <option value="PENDING">En attente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des inscriptions */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
              <span className="ml-2">Chargement...</span>
            </div>
          ) : filteredInscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <svg className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-medium">
                {searchTerm || statusFilter !== "ALL" ? "Aucun résultat trouvé" : "Aucune inscription"}
              </p>
              <p className="text-sm">
                {searchTerm || statusFilter !== "ALL" ? "Essayez un autre terme de recherche ou modifiez les filtres" : "Cette séance n'a pas encore d'inscriptions"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInscriptions.map((inscription) => (
                <div 
                  key={inscription.id} 
                  className="rounded-lg border border-gray-200 bg-white p-4 dark:border-dark-3 dark:bg-dark-2"
                >
                  <div className="flex items-center justify-between">
                    {/* Informations étudiant */}
                    <div className="flex items-center space-x-4">
                      {/* Photo ou initiales */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                        {inscription.photo ? (
                          <img 
                            src={inscription.photo} 
                            alt={`${inscription.nom} ${inscription.prenom || ''}`}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {inscription.nom.charAt(0)}{inscription.prenom?.charAt(0) || ''}
                          </span>
                        )}
                      </div>

                      {/* Détails */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-dark dark:text-white">
                            {inscription.nom} {inscription.prenom || ''}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inscription.statut)}`}>
                            {getStatusIcon(inscription.statut)}
                            <span className="ml-1">
                              {inscription.statut === 'PRESENT' ? 'Présent' : 
                               inscription.statut === 'ABSENT' ? 'Absent' : 'En attente'}
                            </span>
                          </span>
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>#{inscription.matricule}</span>
                          <span>{inscription.grade}</span>
                          <span>{inscription.e_mail}</span>
                          {inscription.date_naissance && (
                            <span>Né(e) le {formatDate(inscription.date_naissance)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions de changement de statut */}
                    <div className="flex items-center space-x-2">
                      {updatingIds.has(inscription.id) ? (
                        <div className="flex items-center text-primary">
                          <svg className="h-4 w-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-xs">Mise à jour...</span>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStatusChange(inscription.id, 'PRESENT')}
                            disabled={inscription.statut === 'PRESENT'}
                            className={`rounded-full p-2 transition ${
                              inscription.statut === 'PRESENT'
                                ? 'bg-green-100 text-green-600 cursor-not-allowed'
                                : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
                            }`}
                            title="Marquer présent"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleStatusChange(inscription.id, 'ABSENT')}
                            disabled={inscription.statut === 'ABSENT'}
                            className={`rounded-full p-2 transition ${
                              inscription.statut === 'ABSENT'
                                ? 'bg-red-100 text-red-600 cursor-not-allowed'
                                : 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
                            }`}
                            title="Marquer absent"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleStatusChange(inscription.id, 'PENDING')}
                            disabled={inscription.statut === 'PENDING'}
                            className={`rounded-full p-2 transition ${
                              inscription.statut === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-600 cursor-not-allowed'
                                : 'text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                            }`}
                            title="Marquer en attente"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-dark-3 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredInscriptions.length} inscription{filteredInscriptions.length > 1 ? 's' : ''} affichée{filteredInscriptions.length > 1 ? 's' : ''}
              {filteredInscriptions.length !== inscriptions.length && ` sur ${inscriptions.length} au total`}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportToExcel}
                disabled={exporting || inscriptions.length === 0}
                className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Export en cours...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exporter Excel
                  </>
                )}
              </button>
              <button 
                onClick={onClose}
                className="rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primary/90"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscriptionsModal;