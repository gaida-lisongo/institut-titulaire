"use client";

import { useState, useEffect } from "react";
import { titulaireApi } from "@/api";
import EtudiantsTravail from './modal';

type Travail = {
  id: number;
  titre: string;
  description: string;
  date_fin: string;
  ponderation: number;
  statut: "OK" | "PENDING" | "NO" | "À faire" | "En cours" | "Terminé";
  url?: string;
  id_charge?: number;
  type?: string;
  montant?: number;
  date_created?: string;
};

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

type TravauxProps = {
  chargeId: number;
  travaux: Travail[];
  onUpdate: () => void;
};

const Travaux = ({ chargeId, travaux: initialTravaux, onUpdate }: TravauxProps) => {
  const [travaux, setTravaux] = useState<Travail[]>(initialTravaux);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [currentTravail, setCurrentTravail] = useState<Travail | null>(null);
  const [students, setStudents] = useState<Etudiant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [editingField, setEditingField] = useState<{id: number, field: string} | null>(null);
  const [uploadingFile, setUploadingFile] = useState<{travailId?: number, isNew?: boolean} | null>(null);
  
  // État pour le nouveau travail
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    date_fin: new Date().toISOString().split('T')[0],
    ponderation: 10,
    statut: "À faire" as const,
    url: ""
  });

  // Fonction d'upload pour un travail existant
  const handleUploadForExistingTravail = async (e: React.ChangeEvent<HTMLInputElement>, travailId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile({ travailId });
    
    try {
      console.log("Uploading file for travail:", travailId);
      const response = await titulaireApi.uploadPdf(file);
      console.log("Upload response:", response);
      
      if (response.success && response.data?.url) {
        // Mettre à jour l'URL dans la base de données
        await handleFieldUpdate(travailId, 'url', response.data.url);
        console.log("File uploaded and URL updated successfully");
      } else {
        console.error("Error uploading file:", response.message);
        alert(`Erreur lors de l'upload: ${response.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Une erreur est survenue lors de l'upload du fichier");
    } finally {
      setUploadingFile(null);
      // Réinitialiser l'input file
      e.target.value = '';
    }
  };

  // Fonction d'upload pour un nouveau travail
  const handleUploadForNewTravail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile({ isNew: true });
    
    try {
      console.log("Uploading file for new travail");
      const response = await titulaireApi.uploadPdf(file);
      console.log("Upload response:", response);
      
      if (response.success && response.data?.url) {
        // Mettre à jour l'URL dans le formulaire
        setFormData(prev => ({
          ...prev,
          url: response.data.url
        }));
        console.log("File uploaded successfully, URL:", response.data.url);
      } else {
        console.error("Error uploading file:", response.message);
        alert(`Erreur lors de l'upload: ${response.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Une erreur est survenue lors de l'upload du fichier");
    } finally {
      setUploadingFile(null);
      // Réinitialiser l'input file
      e.target.value = '';
    }
  };
  
  useEffect(() => {
    // Convertir les statuts du serveur vers l'affichage
    const convertedTravaux = initialTravaux.map(travail => ({
      ...travail,
      statut: travail.statut === "PENDING" ? "À faire" as const :
              travail.statut === "OK" ? "En cours" as const :
              travail.statut === "NO" ? "Terminé" as const : "À faire" as const,
      ponderation: typeof travail.ponderation === 'string' ? parseFloat(travail.ponderation) : travail.ponderation
    }));
    setTravaux(convertedTravaux);
  }, [initialTravaux]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Fonction pour la mise à jour dynamique d'un champ
  const handleFieldUpdate = async (travailId: number, fieldName: string, newValue: any) => {
    setEditingField({ id: travailId, field: fieldName });
    
    try {
      // Convertir le statut si nécessaire
      let serverValue = newValue;
      if (fieldName === 'statut') {
        serverValue = newValue === "À faire" ? "PENDING" :
                    newValue === "En cours" ? "OK" :
                    newValue === "Terminé" ? "NO" : "PENDING";
      }
      
      const response = await titulaireApi.updateTravail({
        id: travailId,
        col: fieldName,
        value: serverValue
      });
      
      if (response.success) {
        // Mettre à jour l'état local immédiatement
        setTravaux(prev => prev.map(t => 
          t.id === travailId 
            ? { ...t, [fieldName]: newValue }
            : t
        ));
        console.log(`Champ ${fieldName} mis à jour avec succès`);
      } else {
        console.error(`Erreur lors de la mise à jour du champ ${fieldName}:`, response.message);
        alert(`Erreur: ${response.message}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du champ ${fieldName}:`, error);
      alert("Une erreur est survenue lors de la mise à jour");
    } finally {
      setEditingField(null);
    }
  };
  
  // Fonction pour récupérer les étudiants d'un travail
  const fetchStudentsForTravail = async (travailId: number) => {
    setLoadingStudents(true);
    try {
      const response = await titulaireApi.fetchCmdTravaux(travailId);
      console.log("Students fetched for travail:", response);
      if (response.success) {
        setStudents(response.data || []);
      } else {
        console.error("Erreur lors de la récupération des étudiants:", response.message);
        setStudents([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des étudiants:", error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };
  
  const openStudentsModal = (travail: Travail) => {
    setCurrentTravail(travail);
    setShowStudentsModal(true);
  };
  
  const resetForm = () => {
    setFormData({
      titre: "",
      description: "",
      date_fin: new Date().toISOString().split('T')[0],
      ponderation: 10,
      statut: "À faire",
      url: ""
    });
  };
  
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };
  
  const openDeleteModal = (travail: Travail) => {
    setCurrentTravail(travail);
    setShowDeleteModal(true);
  };
  
  const handleAddTravail = async () => {
    try {
      setLoading(true);
      
      const travailData = {
        titre: formData.titre,
        description: formData.description,
        type: "Devoir",
        date_fin: formData.date_fin,
        montant: 1500,
        id_charge: chargeId,
        ponderation: formData.ponderation,
        ...(formData.url && { url: formData.url })
      };
      
      console.log("Adding travail:", travailData);
      const response = await titulaireApi.addTravail(travailData);
      
      if (response.success) {
        const newTravail: Travail = {
          id: response.id,
          ...travailData,
          statut: "À faire"
        };
        
        setTravaux([...travaux, newTravail]);
        setShowAddModal(false);
        resetForm();
        onUpdate();
      } else {
        console.error("Erreur lors de l'ajout du travail:", response.message);
        alert(`Erreur: ${response.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du travail:", error);
      alert("Une erreur est survenue lors de l'ajout du travail");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteTravail = async () => {
    if (!currentTravail) return;
    
    try {
      setLoading(true);
      
      console.log("Deleting travail with ID:", currentTravail.id);
      const response = await titulaireApi.deleteTravail(currentTravail.id);
      
      console.log("Delete response:", response);
      
      if (response.success) {
        setTravaux(prev => prev.filter(t => t.id !== currentTravail.id));
        setShowDeleteModal(false);
        setCurrentTravail(null);
        onUpdate();
        console.log("Travail supprimé avec succès");
      } else {
        console.error("Erreur lors de la suppression du travail:", response.message);
        alert(`Erreur: ${response.message || 'Erreur inconnue lors de la suppression'}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du travail:", error);
      alert("Une erreur est survenue lors de la suppression du travail");
    } finally {
      setLoading(false);
    }
  };
  
  const getStatutClass = (statut: string) => {
    switch (statut) {
      case "À faire":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "En cours":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Terminé":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Composant pour un champ éditable
  const EditableField = ({ travail, fieldName, type = "text", options = null }: {
    travail: Travail;
    fieldName: keyof Travail;
    type?: string;
    options?: string[] | null;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(travail[fieldName] || '');
    const isUpdating = editingField?.id === travail.id && editingField?.field === fieldName;

    const handleSave = async () => {
      if (value !== travail[fieldName]) {
        await handleFieldUpdate(travail.id, fieldName, value);
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setValue(travail[fieldName] || '');
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
      if (options) {
        return (
          <select
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="w-full rounded border border-primary bg-white px-2 py-1 text-sm focus:outline-none dark:bg-dark-2"
            autoFocus
            disabled={isUpdating}
          >
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      }

      if (type === "textarea") {
        return (
          <textarea
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="w-full rounded border border-primary bg-white px-2 py-1 text-sm focus:outline-none dark:bg-dark-2"
            autoFocus
            disabled={isUpdating}
            rows={2}
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
          autoFocus
          disabled={isUpdating}
        />
      );
    }

    return (
      <div 
        className="group relative cursor-pointer rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-dark-3"
        onClick={() => setIsEditing(true)}
      >
        <span className={isUpdating ? "opacity-50" : ""}>
          {fieldName === 'date_fin' ? formatDate(value as string) : 
           fieldName === 'ponderation' ? `${value}%` :
           String(value)}
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

  // Composant pour l'upload de fichier
  const FileUploadButton = ({ travail }: { travail: Travail }) => {
    const isUploading = uploadingFile?.travailId === travail.id;

    return (
      <div className="flex items-center space-x-2">
        <label className="relative cursor-pointer">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleUploadForExistingTravail(e, travail.id)}
            className="hidden"
            disabled={isUploading}
          />
          <div className={`flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-all ${
            travail.url 
              ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            {isUploading ? (
              <>
                <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border border-solid border-current border-t-transparent"></span>
                Upload...
              </>
            ) : travail.url ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Changer fichier
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Ajouter fichier
              </>
            )}
          </div>
        </label>
        
        {travail.url && (
          <a 
            href={travail.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:hover:bg-gray-900/50"
            title="Télécharger le fichier"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </a>
        )}
      </div>
    );
  };
  
  return (
    <div className="mb-6 rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Travaux et devoirs</h2>
        
        <button 
          onClick={openAddModal}
          className="flex items-center rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primary/90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un travail
        </button>
      </div>
      
      {travaux.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stroke py-16 dark:border-dark-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="mb-2 text-xl font-medium text-dark dark:text-white">Aucun travail</p>
          <p className="text-body-color dark:text-dark-6">
            Ajoutez des travaux et devoirs pour vos étudiants
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {travaux.map(travail => (
            <div 
              key={travail.id} 
              className="group flex flex-col rounded-lg border border-stroke bg-gray-50 p-5 transition-all hover:shadow-md dark:border-dark-3 dark:bg-dark-2"
            >
              <div className="mb-4 flex items-center justify-between">
                <EditableField 
                  travail={travail} 
                  fieldName="statut" 
                  type="select" 
                  options={["À faire", "En cours", "Terminé"]}
                />
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => openStudentsModal(travail)}
                    className="rounded-full p-1 text-blue-500 opacity-0 transition-opacity hover:bg-blue-100 hover:text-blue-700 group-hover:opacity-100 dark:hover:bg-blue-900/30"
                    title="Voir les étudiants"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => openDeleteModal(travail)}
                    className="rounded-full p-1 text-red-500 opacity-0 transition-opacity hover:bg-red-100 hover:text-red-700 group-hover:opacity-100 dark:hover:bg-red-900/30"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-dark dark:text-white">
                  <EditableField travail={travail} fieldName="titre" />
                </h3>
              </div>
              
              <div className="mb-4 flex-grow">
                <EditableField travail={travail} fieldName="description" type="textarea" />
              </div>
              
              <div className="mt-auto space-y-3">
                <div className="flex items-center text-sm text-body-color dark:text-dark-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 012 2h2a2 2 0 002-2z" />
                  </svg>
                  <span>Date de remise: </span>
                  <EditableField travail={travail} fieldName="date_fin" type="date" />
                </div>
                
                <div className="flex items-center text-sm text-body-color dark:text-dark-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Pondération: </span>
                  <EditableField travail={travail} fieldName="ponderation" type="number" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-body-color dark:text-dark-6">Fichier:</span>
                  <FileUploadButton travail={travail} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal d'ajout de travail */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-dark">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-medium text-dark dark:text-white">
                Ajouter un travail
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-dark-6 hover:text-dark dark:text-dark-4 dark:hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Titre du travail
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  placeholder="Ex: Devoir de mi-session"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
                  required
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Décrivez le travail et les consignes..."
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Date de remise
                </label>
                <input
                  type="date"
                  name="date_fin"
                  value={formData.date_fin}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
                  required
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Pondération (%)
                </label>
                <input
                  type="number"
                  name="ponderation"
                  value={formData.ponderation}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
                  required
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Fichier du travail (optionnel)
                </label>
                <div className="flex items-center space-x-3">
                  <label className="relative cursor-pointer flex-1">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleUploadForNewTravail}
                      className="hidden"
                      disabled={uploadingFile?.isNew}
                    />
                    <div className={`flex items-center justify-center rounded-lg border-2 border-dashed px-4 py-3 transition-all ${
                      formData.url 
                        ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-300'
                        : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-primary hover:bg-primary/5 dark:border-dark-3 dark:bg-dark-2 dark:text-gray-300'
                    } ${uploadingFile?.isNew ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      {uploadingFile?.isNew ? (
                        <>
                          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border border-solid border-current border-t-transparent"></span>
                          Upload en cours...
                        </>
                      ) : formData.url ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Fichier uploadé - Cliquez pour changer
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Cliquez pour uploader un fichier
                        </>
                      )}
                    </div>
                  </label>
                  
                  {formData.url && (
                    <a 
                      href={formData.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center rounded-lg bg-primary/10 px-3 py-2 text-primary hover:bg-primary/20"
                      title="Voir le fichier"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </a>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Formats acceptés: PDF, DOC, DOCX, TXT
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-stroke bg-transparent px-4 py-2 font-medium text-dark transition hover:border-primary hover:bg-opacity-10 dark:border-dark-3 dark:text-white dark:hover:border-primary"
              >
                Annuler
              </button>
              <button 
                onClick={handleAddTravail}
                disabled={loading || !formData.titre || !formData.description}
                className="flex items-center rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    Ajout en cours...
                    <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
                  </>
                ) : (
                  "Ajouter le travail"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmation de suppression */}
      {showDeleteModal && currentTravail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-dark">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-medium text-dark dark:text-white">
                Confirmer la suppression
              </h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-dark-6 hover:text-dark dark:text-dark-4 dark:hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              
              <p className="mb-2 text-center text-lg font-medium text-dark dark:text-white">
                Êtes-vous sûr de vouloir supprimer ce travail ?
              </p>
              
              <p className="text-center text-body-color dark:text-dark-6">
                <span className="font-medium">{currentTravail.titre}</span> sera définitivement supprimé. Cette action est irréversible.
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-stroke bg-transparent px-6 py-3 font-medium text-dark transition hover:border-primary hover:bg-opacity-10 dark:border-dark-3 dark:text-white dark:hover:border-primary"
              >
                Annuler
              </button>
              
              <button 
                onClick={handleDeleteTravail}
                disabled={loading}
                className="flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700 disabled:opacity-70"
              >
                {loading ? (
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

      {/* Modal des étudiants */}
      {showStudentsModal && currentTravail && (
        <EtudiantsTravail
          travailId={currentTravail.id}
          travailTitre={currentTravail.titre}
          isOpen={showStudentsModal}
          onClose={() => setShowStudentsModal(false)}
        />
      )}
    </div>
  );
};

export default Travaux;