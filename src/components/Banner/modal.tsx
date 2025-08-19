"use client";

type BannerEditModalProps = {
  editedFiche: any;
  onClose: () => void;
  onSave: () => void;
  onChange: ({col, value}: {col: string, value: any}) => void;
  saving: boolean;
};

const BannerEditModal = ({ editedFiche, onClose, onSave, onChange, saving }: BannerEditModalProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ col: name, value });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-h-[90vh] overflow-y-auto max-w-4xl rounded-lg bg-white p-6 shadow-xl dark:bg-dark">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-medium text-dark dark:text-white">
            Modifier la fiche de cours
          </h3>
          <button 
            onClick={onClose}
            className="text-dark-6 hover:text-dark dark:text-dark-4 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Informations de base */}
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Code du cours
            </label>
            <input
              type="text"
              name="code"
              value={editedFiche.code || ""}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Intitulé du cours
            </label>
            <input
              type="text"
              name="ecue"
              value={editedFiche.ecue || ""}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Filière
            </label>
            <input
              type="text"
              name="filiaire"
              value={editedFiche.filiaire || ""}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Crédits
            </label>
            <input
              type="number"
              name="credit"
              value={editedFiche.credit || ""}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Année académique
            </label>
            <input
              type="text"
              readOnly
              name="annee"
              value={editedFiche.annee || ""}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Statut
            </label>
            <select
              name="statut"
              value={editedFiche.statut || ""}
              disabled
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
            >
              <option value="EN COURS">EN COURS</option>
              <option value="VU">VU</option>
            </select>
          </div>
          
          {/* Objectifs et contenu */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Objectif du cours
            </label>
            <textarea
              name="objectif"
              rows={3}
              value={editedFiche.objectif || ""}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
            ></textarea>
          </div>
          
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Contenu du cours
            </label>
            <textarea
              name="contenu"
              rows={3}
              value={editedFiche.contenu || ""}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
            ></textarea>
          </div>
          
          {/* Méthodes et logistique */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Méthodes d'enseignement
            </label>
            <textarea
              name="enseignement"
              rows={3}
              value={editedFiche.enseignement || ""}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
            ></textarea>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Horaire
            </label>
            <textarea
              name="horaire"
              rows={3}
              value={editedFiche.horaire || ""}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
            ></textarea>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Disponibilité
            </label>
            <textarea
              name="disponibilite"
              rows={3}
              value={editedFiche.disponibilite || ""}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
            ></textarea>
          </div>
          
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Pénalités
            </label>
            <textarea
              name="penalites"
              rows={3}
              value={editedFiche.penalites || ""}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2"
            ></textarea>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="rounded-lg border border-stroke bg-transparent px-6 py-3 font-medium text-dark transition hover:border-primary hover:bg-opacity-10 dark:border-dark-3 dark:text-white dark:hover:border-primary"
          >
            Annuler
          </button>
          
          <button 
            onClick={onSave}
            disabled={saving}
            className="flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-70"
          >
            {saving ? (
              <>
                Enregistrement...
                <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></span>
              </>
            ) : (
              "Enregistrer les modifications"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerEditModal;