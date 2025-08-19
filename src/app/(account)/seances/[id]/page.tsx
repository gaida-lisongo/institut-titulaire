"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { titulaireApi } from "@/api";
import Banner from "@/components/Banner";
import Travaux from "@/components/Travaux";
import Seances from "@/components/Seances";

export default function SeanceDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [fiche, setFiche] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [seances, setSeances] = useState<any[]>([]);

  // Ajouter cette fonction dans votre composant FicheDetail
  const handleBannerEdit = (editedFiche: any) => {
    console.log("Banner edited with new data:", editedFiche);
    setFiche(editedFiche);
  };

  const fetchFicheData = async () => {
    try {
      const charges = localStorage.getItem("charges");
      setLoading(true);
      if (charges) {
        const parsedCharges = JSON.parse(charges);
        const charge = parsedCharges.find((c: { id: number }) => c.id === Number(id));
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

  const handleAddSeance = async ({
    contenu,
    duree,
    id_charge,
    lieu,
    materiel,
    objectif,
    url
  }: {    
    id: string;
    contenu: string;
    duree: string;
    id_charge: string;
    lieu: string;
    materiel: string;
    objectif: string;
    url: string;
  }) => {
    const newSeance = {
      contenu,
      duree,
      id_charge,
      lieu,
      materiel,
      objectif,
      url
    };
    
    try {
      const response = await titulaireApi.createSeance(newSeance);
      if (response.success) {
        console.log("Séance ajoutée avec succès:", response.data);
        return response.data;
      } else {
        console.error("Erreur lors de l'ajout de la séance:", response.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la séance:", error);
    }
  };

  const handleChangeSeance = async ({
    id,
    col,
    value
  } : {
    id: string;
    col: string;
    value: any;
  }) => {
    try {
      const response = await titulaireApi.updateSeance({ id : parseInt(id), col, value });
      if (response.success) {
        console.log("Séance mise à jour avec succès:", response);
      } else {
        console.error("Erreur lors de la mise à jour de la séance:", response.message);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la séance:", error);
    }
  };

  const handleDeleteSeance = async (id: string) => {
    try {
      const response = await titulaireApi.deleteSeance(parseInt(id));
      if (response.success) {
        setSeances((prevSeances) => prevSeances.filter((seance) => seance.id !== id));
        console.log("Séance supprimée avec succès:", response);
      } else {
        console.error("Erreur lors de la suppression de la séance:", response.message);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la séance:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchFicheData();
    }
  }, [id]);

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
          <h2 className="mb-4 text-xl font-semibold text-red-700 dark:text-red-400">Erreur</h2>
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
          <h2 className="mb-4 text-xl font-semibold text-yellow-700 dark:text-yellow-400">Fiche non trouvée</h2>
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
      
      {/* Ajouter le composant Seance */}
      <Seances
        id={id}
        onSave={(data) => handleAddSeance(data)}
        onEdit={(data) => handleChangeSeance(data)}
        onDelete={(id) => handleDeleteSeance(id)}
      />
    </div>
  );
}