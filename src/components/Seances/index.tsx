"use client";
import { titulaireApi } from '@/api';
import React, { useEffect, useState, useMemo, useCallback, use } from 'react'
import InscriptionsModal from './InscriptionsModal';

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

type SeanceFormData = {
    contenu: string;
    duree: string;
    id_charge: string;
    lieu: string;
    materiel: string;
    objectif: string;
    url: string;
    type: string;
    date_seance: string;
};

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

// Composant formulaire extrait en dehors du composant principal
const SeanceForm = ({ 
  formData, 
  onInputChange, 
  onSubmit, 
  onCancel, 
  saving, 
  isEdit 
}: {
  formData: SeanceFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
  isEdit: boolean;
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Colonne gauche */}
      <div className="space-y-4">
        <div>
          <label htmlFor="contenu" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contenu de la séance *
          </label>
          <input
            type="text"
            id="contenu"
            name="contenu"
            value={formData.contenu}
            onChange={onInputChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            placeholder="Ex: Introduction aux bases de données"
          />
        </div>

        <div>
          <label htmlFor="objectif" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Objectif de la séance *
          </label>
          <textarea
            id="objectif"
            name="objectif"
            value={formData.objectif}
            onChange={onInputChange}
            required
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            placeholder="Décrivez l'objectif pédagogique de cette séance..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de séance *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={onInputChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            >
              <option value="cours">Cours</option>
              <option value="td">Travaux Dirigés</option>
              <option value="tp">Travaux Pratiques</option>
              <option value="conférence">Conférence</option>
            </select>
          </div>

          <div>
            <label htmlFor="duree" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durée
            </label>
            <input
              type="text"
              id="duree"
              name="duree"
              value={formData.duree}
              onChange={onInputChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              placeholder="Ex: 2h00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="lieu" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lieu *
          </label>
          <input
            type="text"
            id="lieu"
            name="lieu"
            value={formData.lieu}
            onChange={onInputChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            placeholder="Ex: Salle A101, Amphithéâtre..."
          />
        </div>
      </div>

      {/* Colonne droite */}
      <div className="space-y-4">
        <div>
          <label htmlFor="date_seance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date de la séance
          </label>
          <input
            type="date"
            id="date_seance"
            name="date_seance"
            value={formData.date_seance}
            onChange={onInputChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="materiel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Matériel requis
          </label>
          <textarea
            id="materiel"
            name="materiel"
            value={formData.materiel}
            onChange={onInputChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            placeholder="Ex: Ordinateur portable, calculatrice..."
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL du document
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={onInputChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            placeholder="https://exemple.com/document.pdf"
          />
        </div>
      </div>
    </div>

    {/* Boutons d'action - Uniquement pour la création */}
    {!isEdit && (
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-dark-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-lg bg-primary px-6 py-2 text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Création...
            </>
          ) : (
            'Créer la séance'
          )}
        </button>
      </div>
    )}

    {/* Indicateur de sauvegarde automatique pour l'édition */}
    {isEdit && saving && (
      <div className="flex items-center justify-center pt-4">
        <div className="flex items-center text-primary">
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Sauvegarde en cours...
        </div>
      </div>
    )}
  </form>
);

export default function Seances({
    id,
    onSave,
    onEdit,
    onDelete
} : {
    id: string;
    onSave: (data: any) => any;
    onEdit: (data: any) => any;
    onDelete: (id: string) => any;
}) {
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInscriptionsModal, setShowInscriptionsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState<Seance | null>(null);
  const [formData, setFormData] = useState<SeanceFormData>({
    contenu: '',
    duree: '',
    id_charge: id,
    lieu: '',
    materiel: '',
    objectif: '',
    url: '',
    type: 'cours',
    date_seance: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [seanceCommandes, setSeanceCommandes] = useState<SeanceCommande[]>([]);
  
  const fetchSeances = async () => {
    try {
        const request = await titulaireApi.fetchSeancesByCharge(id);
        if (request.success) {
            console.log("Seances fetched:", request.data);
            setSeances(request.data);
        } else {
            console.error("Error fetching seances:", request.message);
        }
    } catch (error) {
        console.error("Error fetching seances:", error);
    } finally {
        setLoading(false);
    }
  }
  
  const fetchSubscriptions = async (id : number) => {
    try {
      const request = await titulaireApi.fetchCommandesSeance(id);
      if (request.success) {
        console.log("Subscriptions fetched:", request.data);
        setSeanceCommandes(request.data);
      } else {
        console.error("Error fetching subscriptions:", request.message);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  }

  const changeStateCmd = async ({
    id, value
  }: {
    id: number;
    value: any;
  }) => {
    try {
      const request = await titulaireApi.updateCommandesSeance({id, col: "statut", value});
      if (request.success) {
        console.log("State changed successfully:", request);
        
        // Mettre à jour l'état local immédiatement après la persistance
        setSeanceCommandes(prev => 
          prev.map(cmd => 
            cmd.id === id 
              ? { ...cmd, statut: value }
              : cmd
          )
        );
        
        return true; // Indiquer le succès
      } else {
        console.error("Error changing state:", request.message);
        throw new Error(request.message);
      }
    } catch (error) {
      console.error("Error changing state:", error);
      throw error; // Re-throw pour que le composant modal puisse gérer l'erreur
    }
  }

  useEffect(() => {
    fetchSeances();
  }, [id]);

  useEffect(() => {
    if (selectedSeance && typeof selectedSeance.id === 'number') {
      fetchSubscriptions(selectedSeance.id);
    }
  }, [selectedSeance]);

  // Fonction de sauvegarde automatique avec debounce
  const autoSave = useCallback(async (data: SeanceFormData & { id: string }) => {
    try {
      setSaving(true);
      const response = await onEdit(data);
      if (response) {
        // Mettre à jour la séance dans la liste locale
        setSeances(prev => prev.map(seance => 
          seance.id === data.id ? { ...seance, ...data } : seance
        ));
        // Mettre à jour la séance sélectionnée
        if (selectedSeance && selectedSeance.id === data.id) {
          setSelectedSeance(prev => prev ? { ...prev, ...data } : null);
        }
        console.log('Séance sauvegardée automatiquement');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
    } finally {
      setSaving(false);
    }
  }, [onEdit, selectedSeance]);

  // Filtrage des séances basé sur la recherche
  const filteredSeances = useMemo(() => {
    if (!searchTerm) return seances;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return seances.filter(seance => 
      seance.contenu.toLowerCase().includes(lowerSearchTerm) ||
      seance.objectif.toLowerCase().includes(lowerSearchTerm) ||
      seance.lieu.toLowerCase().includes(lowerSearchTerm) ||
      seance.materiel.toLowerCase().includes(lowerSearchTerm) ||
      (seance.type && seance.type.toLowerCase().includes(lowerSearchTerm))
    );
  }, [seances, searchTerm]);

  const resetForm = () => {
    setFormData({
      contenu: '',
      duree: '',
      id_charge: id,
      lieu: '',
      materiel: '',
      objectif: '',
      url: '',
      type: 'cours',
      date_seance: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openSeanceDetails = (seance: Seance) => {
    console.log("Opening details for seance:", seance);
    setSelectedSeance(seance);
    setShowDetailsModal(true);
  };

  const openInscriptionsModal = (seance: Seance) => {
    setSelectedSeance(seance);
    setShowInscriptionsModal(true);
  };

  const handleEditFromModal = () => {
    if (selectedSeance) {
      setFormData({
        contenu: selectedSeance.contenu,
        duree: selectedSeance.duree,
        id_charge: selectedSeance.id_charge,
        lieu: selectedSeance.lieu,
        materiel: selectedSeance.materiel,
        objectif: selectedSeance.objectif,
        url: selectedSeance.url,
        type: selectedSeance.type || 'cours',
        date_seance: selectedSeance.date_seance || ''
      });
      setShowDetailsModal(false);
      setShowEditModal(true);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);

    // Sauvegarde automatique uniquement en mode édition
    if (showEditModal && selectedSeance) {
      // Annuler le timeout précédent s'il existe
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      await onEdit({
        id: selectedSeance.id,
        col: name,
        value
      });

      console.log("Sauvegarde automatique effectuée");
      //Update Current
      console.log(selectedSeance);
      const copySelectedSeance = {
        ...selectedSeance,
        [name]: value
      };

      const updatedSeances = seances.map(seance =>
        seance.id === selectedSeance.id ? copySelectedSeance : seance
      );

      setSeances(updatedSeances);

      console.log('Updated : ', copySelectedSeance)
      setSelectedSeance(
        copySelectedSeance
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Empêcher le submit en mode édition (sauvegarde automatique)
    if (showEditModal) {
      return;
    }

    setSaving(true);

    try {
      // Création uniquement
      const response = await onSave(formData);
      if (response) {
        setShowCreateModal(false);
        fetchSeances(); // Recharger les données
        console.log('Séance créée avec succès');
        resetForm();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Annuler le timeout de sauvegarde s'il existe
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }

    if (showEditModal) {
      setShowEditModal(false);
    } else {
      setShowCreateModal(false);
    }
    resetForm();
  };

  // Nettoyer le timeout au démontage du composant
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  const getTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'cours':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z" />
          </svg>
        );
      case 'tp':
      case 'travaux pratiques':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'td':
      case 'travaux dirigés':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'conférence':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'cours':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case 'tp':
      case 'travaux pratiques':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case 'td':
      case 'travaux dirigés':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case 'conférence':
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // Format HH:MM
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          <p className="mt-4 text-lg">Chargement des séances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-dark">
      {/* Header avec recherche et bouton de création */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-dark dark:text-white">
            Séances programmées
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredSeances.length} séance{filteredSeances.length > 1 ? 's' : ''}
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primary/90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle séance
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par contenu, objectif, lieu, matériel ou type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Contenu principal */}
      {filteredSeances.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stroke py-16 dark:border-dark-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mb-2 text-xl font-medium text-dark dark:text-white">
            {searchTerm ? "Aucune séance trouvée" : "Aucune séance programmée"}
          </p>
          <p className="text-body-color dark:text-dark-6 mb-4">
            {searchTerm ? "Essayez un autre terme de recherche" : "Commencez par créer votre première séance"}
          </p>
          {!searchTerm && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-white transition hover:bg-primary/90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer ma première séance
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSeances.map((seance) => (
            <div 
              key={seance.id} 
              className="group relative rounded-lg border border-stroke bg-gray-50 p-6 transition-all hover:shadow-lg dark:border-dark-3 dark:bg-dark-2 cursor-pointer"
              onClick={() => openSeanceDetails(seance)}
            >
              {/* Header de la carte */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center rounded-lg p-2 ${getTypeColor(seance.type)}`}>
                    {getTypeIcon(seance.type)}
                  </div>
                  <div>
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(seance.type)}`}>
                      {seance.type || 'Séance'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openInscriptionsModal(seance);
                    }}
                    className="rounded-full p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    title="Voir les inscriptions"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(seance.id);

                      const updatedSeances = seances.filter(s => s.id !== seance.id);
                      setSeances(updatedSeances);
                    }}
                    className="rounded-full p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="mb-4">
                <h3 className="mb-2 text-lg font-semibold text-dark dark:text-white line-clamp-2">
                  {seance.contenu}
                </h3>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {seance.objectif}
                </p>
              </div>

              {/* Informations de la séance */}
              <div className="space-y-2 text-sm">
                {seance.date_seance && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(seance.date_seance)}
                  </div>
                )}

                {(seance.heure_debut || seance.heure_fin) && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(seance.heure_debut)} - {formatTime(seance.heure_fin)}
                    {seance.duree && ` (${seance.duree})`}
                  </div>
                )}

                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {seance.lieu}
                </div>

                {/* Indicateur de capacité/inscriptions */}
                {(seance.capacite_max || seance.nb_inscrits) && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-xs text-gray-500">Inscriptions</span>
                    <span className={`text-xs font-medium ${
                      seance.nb_inscrits && seance.capacite_max && seance.nb_inscrits >= seance.capacite_max
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {seance.nb_inscrits || 0}
                      {seance.capacite_max && ` / ${seance.capacite_max}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl dark:bg-dark max-h-[90vh] overflow-hidden flex flex-col">
            <div className="border-b border-gray-200 dark:border-dark-3 p-6">
              <h3 className="text-xl font-semibold text-dark dark:text-white">
                Créer une nouvelle séance
              </h3>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <SeanceForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                saving={saving}
                isEdit={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification avec sauvegarde automatique */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl dark:bg-dark max-h-[90vh] overflow-hidden flex flex-col">
            <div className="border-b border-gray-200 dark:border-dark-3 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-dark dark:text-white">
                  Modifier la séance - Sauvegarde automatique
                </h3>
                <button 
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <SeanceForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                saving={saving}
                isEdit={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal des détails - reste identique */}
      {showDetailsModal && selectedSeance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl dark:bg-dark max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-dark-3 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center rounded-lg p-3 ${getTypeColor(selectedSeance.type)}`}>
                    {getTypeIcon(selectedSeance.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-dark dark:text-white">
                      {selectedSeance.contenu}
                    </h3>
                    <span className={`inline-block mt-1 rounded-full px-3 py-1 text-sm font-medium ${getTypeColor(selectedSeance.type)}`}>
                      {selectedSeance.type || 'Séance'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content - reste identique */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations principales */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-dark dark:text-white mb-3">
                      Informations générales
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Objectif</label>
                        <p className="mt-1 text-dark dark:text-white">{selectedSeance.objectif}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date</label>
                          <p className="mt-1 text-dark dark:text-white">
                            {selectedSeance.date_seance ? formatDate(selectedSeance.date_seance) : 'Non définie'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Durée</label>
                          <p className="mt-1 text-dark dark:text-white">
                            {selectedSeance.duree || 'Non définie'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Lieu</label>
                        <p className="mt-1 text-dark dark:text-white">{selectedSeance.lieu}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations complémentaires */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-dark dark:text-white mb-3">
                      Détails logistiques
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Matériel requis</label>
                        <p className="mt-1 text-dark dark:text-white">{selectedSeance.materiel || 'Aucun'}</p>
                      </div>

                      {selectedSeance.url && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Document</label>
                          <div className="mt-1">
                            <a 
                              href={selectedSeance.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary hover:underline"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                              </svg>
                              Télécharger le document
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer avec actions */}
            <div className="border-t border-gray-200 dark:border-dark-3 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => {
                      setShowDetailsModal(false);
                      openInscriptionsModal(selectedSeance);
                    }}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Voir les inscriptions
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setShowDetailsModal(false)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
                  >
                    Fermer
                  </button>
                  <button 
                    onClick={handleEditFromModal}
                    className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-white transition hover:bg-amber-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal des inscriptions - reste identique */}
      {showInscriptionsModal && selectedSeance && (
        <InscriptionsModal
          isOpen={showInscriptionsModal}
          onClose={() => setShowInscriptionsModal(false)}
          seanceDetails={selectedSeance} // Passer l'objet complet au lieu du titre seulement
          inscriptions={seanceCommandes}
          onStatusChange={async (id, value) => {
            await changeStateCmd({ id, value });
          }}
          loading={loading}
        />  
      )}
    </div>
  );
}