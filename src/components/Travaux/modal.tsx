"use client";

import { useState, useEffect, useMemo } from "react";
import { titulaireApi } from "@/api";
import ExportButton from "../common/ExportButton";

type Etudiant = {
  id: number;
  matricule: string;
  nom: string;
  prenom?: string;
  e_mail?: string;
  date_created?: string;
  note?: string;
  observation?: string;
  id_travail?: number;
  id_etudiant?: number;
};

type EtudiantsTravailProps = {
  travailId: number;
  travailTitre: string;
  isOpen: boolean;
  onClose: () => void;
};

const EtudiantsTravail = ({ travailId, travailTitre, isOpen, onClose }: EtudiantsTravailProps) => {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingField, setUpdatingField] = useState<{id: number, field: string} | null>(null);

  // Fonction pour récupérer les étudiants
  const fetchEtudiants = async () => {
    setLoading(true);
    try {
      const response = await titulaireApi.fetchCmdTravaux(travailId);
      if (response.success) {
        setEtudiants(response.data || []);
      } else {
        console.error("Erreur lors de la récupération des étudiants:", response.message);
        setEtudiants([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des étudiants:", error);
      setEtudiants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && travailId) {
      fetchEtudiants();
    }
  }, [isOpen, travailId]);

  // Fonction pour mettre à jour un champ
  const handleFieldUpdate = async (etudiantId: number, fieldName: string, newValue: any) => {
    setUpdatingField({ id: etudiantId, field: fieldName });
    
    try {
      const response = await titulaireApi.updateCmdTravail({
        id: etudiantId,
        col: fieldName,
        value: newValue
      });
      
      if (response) {
        // Mettre à jour l'état local
        setEtudiants((prev) =>
          prev.map((etudiant) =>
            etudiant.id === etudiantId
              ? { ...etudiant, [fieldName]: newValue }
              : etudiant,
          ),
        );
        console.log(`Champ ${fieldName} mis à jour avec succès`);
      } else {
        console.error(`Erreur lors de la mise à jour du champ ${fieldName}`);
        alert("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du champ ${fieldName}:`, error);
      alert("Une erreur est survenue lors de la mise à jour");
    } finally {
      setUpdatingField(null);
    }
  };

  // Filtrage des étudiants basé sur la recherche
  const filteredEtudiants = useMemo(() => {
    if (!searchTerm) return etudiants;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return etudiants.filter(etudiant => 
      etudiant.matricule.toLowerCase().includes(lowerSearchTerm) ||
      etudiant.nom.toLowerCase().includes(lowerSearchTerm) ||
      (etudiant.prenom && etudiant.prenom.toLowerCase().includes(lowerSearchTerm)) ||
      (etudiant.e_mail && etudiant.e_mail.toLowerCase().includes(lowerSearchTerm))
    );
  }, [etudiants, searchTerm]);

  // Composant pour un champ éditable
  const EditableField = ({ etudiant, fieldName, type = "text", placeholder = "" }: {
    etudiant: Etudiant;
    fieldName: keyof Etudiant;
    type?: string;
    placeholder?: string;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(etudiant[fieldName] || '');
    const isUpdating = updatingField?.id === etudiant.id && updatingField?.field === fieldName;

    const handleSave = async () => {
      if (value !== etudiant[fieldName]) {
        await handleFieldUpdate(etudiant.id, fieldName, value);
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setValue(etudiant[fieldName] || '');
      setIsEditing(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };

    if (isEditing) {
      if (type === "textarea") {
        return (
          <textarea
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="w-full rounded border border-primary bg-white px-2 py-1 text-sm focus:outline-none dark:bg-dark-2"
            placeholder={placeholder}
            autoFocus
            disabled={isUpdating}
            rows={3}
          />
        );
      }

      return (
        <input
          type={type}
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyPress}
          className="w-full rounded border border-primary bg-white px-2 py-1 text-sm focus:outline-none dark:bg-dark-2"
          placeholder={placeholder}
          autoFocus
          disabled={isUpdating}
          min={type === "number" ? "0" : undefined}
          max={type === "number" ? "20" : undefined}
          step={type === "number" ? "0.25" : undefined}
        />
      );
    }

    return (
      <div 
        className="group relative cursor-pointer rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-dark-3 min-h-[2rem] flex items-center"
        onClick={() => setIsEditing(true)}
      >
        <span className={`${isUpdating ? "opacity-50" : ""} ${!value ? "text-gray-400 italic" : ""}`}>
          {value || placeholder || "Cliquez pour ajouter"}
        </span>
        {isUpdating && (
          <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border border-solid border-primary border-t-transparent"></span>
        )}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="absolute -top-1 -right-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatutColor = (note?: string) => {
    if (!note) return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    
    const noteNum = parseFloat(note);
    if (noteNum >= 16) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (noteNum >= 14) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    if (noteNum >= 12) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    if (noteNum >= 10) return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-7xl rounded-lg bg-white shadow-xl dark:bg-dark max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-dark-3 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-dark dark:text-white">
                Étudiants inscrits au travail
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {travailTitre}
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
          
          {/* Barre de recherche */}
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par matricule, nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2"
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
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="flex items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent"></div>
                <span className="ml-3">Chargement des étudiants...</span>
              </div>
            </div>
          ) : filteredEtudiants.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-lg font-medium text-dark dark:text-white">
                {searchTerm ? "Aucun étudiant trouvé" : "Aucun étudiant inscrit"}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? "Essayez un autre terme de recherche" : "Aucun étudiant ne s'est encore inscrit à ce travail"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEtudiants.map((etudiant) => (
                <div 
                  key={etudiant.id} 
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-dark-3 dark:bg-dark-2"
                >
                  {/* Header de la carte étudiant */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-dark dark:text-white">
                        {etudiant.nom} {etudiant.prenom}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Matricule: {etudiant.matricule}
                      </p>
                      {etudiant.e_mail && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {etudiant.e_mail}
                        </p>
                      )}
                    </div>
                    
                    {/* Badge de note */}
                    <div className={`rounded-full px-3 py-1 text-xs font-medium ${getStatutColor(etudiant.note)}`}>
                      {etudiant.note ? `${etudiant.note}/20` : "Non noté"}
                    </div>
                  </div>

                  {/* Date d'inscription */}
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2z" />
                      </svg>
                      Inscrit le: {formatDate(etudiant.date_created)}
                    </span>
                  </div>

                  {/* Section Note */}
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Note (/20)
                    </label>
                    <EditableField 
                      etudiant={etudiant} 
                      fieldName="note" 
                      type="number"
                      placeholder="Entrer la note"
                    />
                  </div>

                  {/* Section Observations */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                      Observations
                    </label>
                    <EditableField 
                      etudiant={etudiant} 
                      fieldName="observation" 
                      type="textarea"
                      placeholder="Ajouter des observations..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer avec statistiques */}
        {filteredEtudiants.length > 0 && (
          <div className="border-t border-gray-200 dark:border-dark-3 p-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {filteredEtudiants.length} étudiant{filteredEtudiants.length > 1 ? 's' : ''} 
                {searchTerm && ` trouvé${filteredEtudiants.length > 1 ? 's' : ''}`}
              </span>
              
              <div className="flex items-center space-x-4">
                <span>
                  Notés: {filteredEtudiants.filter(e => e.note).length}
                </span>
                <span>
                  Non notés: {filteredEtudiants.filter(e => !e.note).length}
                </span>
              </div>
              
            
                {/* Bouton d'exportation */}
                <ExportButton
                    data={filteredEtudiants}
                    filename={`notes_${travailTitre.replace(/[^a-zA-Z0-9]/g, '_')}`}
                    title={`Notes et observations - ${travailTitre}`}
                    sheetName="Étudiants"
                    variant="success"
                    size="md"
                    className="flex-shrink-0"
                >
                    Exporter Excel
                </ExportButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EtudiantsTravail;