"use client";

import { useState } from "react";
import Image from "next/image";
import BannerEditModal from "./modal";
import { titulaireApi } from "@/api";

type BannerProps = {
  fiche: any;
  onEdit?: (editedFiche: any) => void;
};

const Banner = ({ fiche, onEdit }: BannerProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedFiche, setEditedFiche] = useState<any>(null);
  const [savingChanges, setSavingChanges] = useState(false);

  const handleEditClick = () => {
    setEditedFiche({ ...fiche });
    setShowEditModal(true);
  };

  const handleEditChange = ({col, value} : {col: string, value: any}) => {

    // Mettre d'abord à jour l'état local
    setEditedFiche((prev: any | null) => ({
      ...prev,
      [col]: value
    }));

    
    // Pas besoin d'appeler l'API ici - nous le ferons lors de la sauvegarde finale
    // pour éviter de faire trop d'appels API pendant que l'utilisateur tape
  };

  const saveChanges = async () => {
    try {
      setSavingChanges(true);
      
      // Récupérer les champs modifiés en comparant avec la fiche originale
      const changedFields = Object.keys(editedFiche).filter(key => 
        editedFiche[key] !== fiche[key]
      );
      
      console.log("Changed fields:", changedFields);
      
      // Effectuer les appels API pour chaque champ modifié
      const updatePromises = changedFields.map(col => 
        titulaireApi.updateFiche({
          id: fiche.id,
          col,
          value: editedFiche[col]
        })
      );
      
      // Attendre que toutes les requêtes soient terminées
      const results = await Promise.all(updatePromises);
      
      // Vérifier si toutes les mises à jour ont réussi
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        // Mettre à jour le localStorage
        const charges = localStorage.getItem("charges");
        if (charges) {
          const parsedCharges = JSON.parse(charges);
          const updatedCharges = parsedCharges.map((c: { id: number }) => 
            c.id === fiche.id ? editedFiche : c
          );
          localStorage.setItem("charges", JSON.stringify(updatedCharges));
        }
        
        // Notifier le parent de la modification
        if (onEdit) {
          onEdit(editedFiche);
        }
        
        // Fermer la modale
        setShowEditModal(false);
      } else {
        console.error("Certaines mises à jour ont échoué");
        // Vous pourriez ajouter une notification d'erreur ici
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des modifications:", error);
    } finally {
      setSavingChanges(false);
    }
  };

  return (
    <>
      <div className="relative mb-8 overflow-hidden rounded-xl shadow-xl">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/students-banner.jpg"
            alt="Étudiants en classe"
            width={1200}
            height={500}
            className="h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60 backdrop-blur-sm"></div>
        </div>
        
        <div className="relative z-10 p-8">
          {/* En-tête avec bouton de retour */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Fiche de cours</h1>
            </div>
            <div className="flex gap-3">
              {/* Bouton d'édition */}
              <button 
                onClick={handleEditClick}
                className="flex items-center rounded-lg bg-white/20 px-4 py-2 text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </button>
              <button 
                onClick={() => window.history.back()}
                className="flex items-center rounded-lg bg-white/20 px-4 py-2 text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour
              </button>
            </div>
          </div>
          
          {/* Titre et informations principales */}
          <div className="mb-8">
            <h2 className="mb-4 text-4xl font-bold text-white">{fiche.ecue || "N/A"}</h2>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-white">
              <div className="flex items-center">
                <span className="mr-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">{fiche.code || "N/A"}</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">{fiche.credit} crédits</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{fiche.filiaire || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{fiche.annee || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="flex items-center">
                  <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${fiche.statut === "VU" ? "bg-green-400" : "bg-yellow-400"}`}></span>
                  Statut: {fiche.statut || "N/A"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Informations détaillées - organisation en grille */}
          <div className="grid grid-cols-1 gap-6 rounded-lg bg-white/10 p-6 backdrop-blur-md md:grid-cols-2">
            {/* Colonne 1 */}
            <div className="space-y-4 text-white">
              <div>
                <h3 className="mb-1 font-semibold">Objectif du cours</h3>
                <p className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                  {fiche.objectif || "Aucun objectif spécifié"}
                </p>
              </div>
              
              <div>
                <h3 className="mb-1 font-semibold">Contenu</h3>
                <p className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                  {fiche.contenu || "Aucun contenu spécifié"}
                </p>
              </div>
              
              <div>
                <h3 className="mb-1 font-semibold">Méthodes d'enseignement</h3>
                <p className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                  {fiche.enseignement || "Aucune méthode d'enseignement spécifiée"}
                </p>
              </div>
            </div>
            
            {/* Colonne 2 */}
            <div className="space-y-4 text-white">
              <div>
                <h3 className="mb-1 font-semibold">Horaire</h3>
                <p className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                  {fiche.horaire || "Aucun horaire spécifié"}
                </p>
              </div>
              
              <div>
                <h3 className="mb-1 font-semibold">Disponibilité</h3>
                <p className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                  {fiche.disponibilite || "Aucune information de disponibilité"}
                </p>
              </div>
              
              <div>
                <h3 className="mb-1 font-semibold">Pénalités</h3>
                <p className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                  {fiche.penalites || "Aucune pénalité spécifiée"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition de la fiche */}
      {showEditModal && editedFiche && (
        <BannerEditModal
          editedFiche={editedFiche}
          onClose={() => setShowEditModal(false)}
          onSave={saveChanges}
          onChange={handleEditChange}
          saving={savingChanges}
        />
      )}
    </>
  );
};

export default Banner;