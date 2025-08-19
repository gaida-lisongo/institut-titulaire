"use client";
import { useState } from "react";
import InputGroup from "../../FormElements/InputGroup";
import Link from "next/link";
import { userApi } from "@/api";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState({
    nom: "",
    post_nom: "",
    prenom: "",
    sexe: "",
    date_naissance: "",
    nationalite: "",
    e_mail: "",
    telephone: "",
    secure: "",
    confirmPassword: "",
    photo: null as File | null,
  });

  // État pour les modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false); // État spécifique pour le chargement de la photo
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    if (name === 'photo' && files && files.length > 0) {
      const file = files[0];
      setData({ ...data, photo: file });
      
      // Créer une URL pour la prévisualisation de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Indiquer que la photo est en cours de chargement
      setPhotoLoading(true);
      
      // Création d'un FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append('file', file, file.name);

      userApi.uploadFile(formData)
        .then((response) => {
          if (response.success) {
            const photoUrl = response.data;
            setData(prevData => ({ 
              ...prevData, 
              photo: photoUrl.secure_url 
            }));
            console.log("File uploaded successfully:", photoUrl);
          } else {
            console.error("Failed to upload file:", response.message);
            setErrorMessage(`Échec du téléchargement de la photo: ${response.message}`);
            setShowErrorModal(true);
          }
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          setErrorMessage("Une erreur est survenue lors du téléchargement de la photo.");
          setShowErrorModal(true);
        })
        .finally(() => {
          // Indiquer que le chargement de la photo est terminé
          setPhotoLoading(false);
        });
    } else {
      setData({ ...data, [name]: value });
    }
  };

  const nextStep = () => {
    setStep((prevStep) => Math.min(prevStep + 1, 3));
  };

  const prevStep = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (step < 3) {
      nextStep();
      return;
    }
    
    // Vérifier que les mots de passe correspondent
    if (data.secure !== data.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      setShowErrorModal(true);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Données d'inscription soumises:", data);
      const response = await userApi.createdAgent({
        nom: data.nom,
        post_nom: data.post_nom,
        prenom: data.prenom,
        sexe: data.sexe,
        date_naissance: data.date_naissance,
        nationalite: data.nationalite,
        e_mail: data.e_mail,
        secure: data.secure,
        photo: data.photo,
        telephone: data.telephone,
      });
      
      if (response.success) {
        console.log("Agent created successfully:", response.data);
        setShowSuccessModal(true);
        // La redirection se fera après la fermeture de la modal
      } else {
        setErrorMessage(response.message || "Échec de la création du compte.");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      setErrorMessage(error instanceof Error ? error.message : "Une erreur inconnue est survenue.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Gérer la redirection après succès
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/login");
  };

  // Barre de progression pour les étapes
  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="mb-4 flex justify-between">
          {['Identité', 'Coordonnées', 'Sécurité'].map((title, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center ${index < step ? 'text-primary' : 'text-gray-400'}`}
            >
              <div 
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${
                  index + 1 === step 
                    ? 'bg-primary text-white' 
                    : index + 1 < step 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500 dark:bg-dark-3'
                }`}
              >
                {index + 1 < step ? '✓' : index + 1}
              </div>
              <span className={`text-sm ${index + 1 === step ? 'font-medium' : ''}`}>
                {title}
              </span>
            </div>
          ))}
        </div>
        <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-dark-3">
          <div 
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${(step - 1) * 50}%` }}
          />
        </div>
      </div>
    );
  };

  // Étape 1: Identité
  const renderIdentityStep = () => {
    return (
      <>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Nom */}
          <InputGroup
            type="text"
            label="Nom"
            className="[&_input]:py-[15px]"
            placeholder="Entrez votre nom"
            name="nom"
            handleChange={handleChange}
            value={data.nom}
            required
          />
          
          {/* Post-nom (nom de famille) */}
          <InputGroup
            type="text"
            label="Post-nom"
            className="[&_input]:py-[15px]"
            placeholder="Entrez votre post-nom"
            name="post_nom"
            handleChange={handleChange}
            value={data.post_nom}
            required
          />
        </div>

        {/* Prénom */}
        <InputGroup
          type="text"
          label="Prénom"
          className="[&_input]:py-[15px]"
          placeholder="Entrez votre prénom"
          name="prenom"
          handleChange={handleChange}
          value={data.prenom}
          required
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Sexe */}
          <div className="space-y-3">
            <label className="block text-body-sm font-medium text-dark dark:text-white">
              Sexe
            </label>
            <select
              name="sexe"
              value={data.sexe}
              onChange={(e) => setData({ ...data, sexe: e.target.value })}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-[15px] outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-dark-3 dark:bg-dark-2"
              required
            >
              <option value="">Sélectionnez votre sexe</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>

          {/* Date de naissance */}
          <InputGroup
            type="date"
            label="Date de naissance"
            className="[&_input]:py-[15px]"
            placeholder="Sélectionnez votre date de naissance"
            name="date_naissance"
            handleChange={handleChange}
            value={data.date_naissance}
            required
          />
        </div>

        {/* Nationalité */}
        <InputGroup
          type="text"
          label="Nationalité"
          className="[&_input]:py-[15px]"
          placeholder="Entrez votre nationalité"
          name="nationalite"
          handleChange={handleChange}
          value={data.nationalite}
          required
        />
      </>
    );
  };

  // Étape 2: Coordonnées
  const renderContactStep = () => {
    return (
      <>
        {/* Email */}
        <InputGroup
          type="email"
          label="Email"
          className="[&_input]:py-[15px]"
          placeholder="Entrez votre adresse email"
          name="e_mail"
          handleChange={handleChange}
          value={data.e_mail}
          required
        />
        
        {/* Téléphone */}
        <InputGroup
          type="tel"
          label="Téléphone"
          className="mt-4 [&_input]:py-[15px]"
          placeholder="Entrez votre numéro de téléphone"
          name="telephone"
          handleChange={handleChange}
          value={data.telephone}
          required
        />

        {/* Photo */}
        <div className="space-y-3 mt-6">
          <label className="block text-body-sm font-medium text-dark dark:text-white">
            Photo de profil
          </label>
          
          <div className="flex flex-col items-center space-y-4">
            {/* Prévisualisation de l'image avec indicateur de chargement */}
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-primary">
              {photoPreview ? (
                <>
                  <img 
                    src={photoPreview} 
                    alt="Aperçu de la photo" 
                    className="h-full w-full object-cover"
                  />
                  {/* Overlay de chargement */}
                  {photoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-gray-400 dark:bg-dark-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Bouton de téléchargement avec indicateur d'état */}
            <label className={`flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed 
              ${photoLoading ? 'border-primary bg-primary/10' : 'border-stroke bg-gray-2'} 
              px-6 dark:border-dark-3 dark:bg-dark-2 ${photoLoading ? 'cursor-wait' : 'cursor-pointer'}`}
            >
              <input
                type="file"
                className="sr-only"
                name="photo"
                accept="image/*"
                onChange={handleChange}
                disabled={photoLoading}
              />
              <div className="flex items-center gap-2">
                {photoLoading && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent"></span>
                )}
                <span className={`text-sm font-medium ${photoLoading ? 'text-primary' : 'text-dark-6 dark:text-dark-4'}`}>
                  {photoLoading 
                    ? 'Téléchargement en cours...' 
                    : photoPreview 
                      ? 'Changer la photo' 
                      : 'Télécharger une photo'
                  }
                </span>
              </div>
            </label>
          </div>
        </div>
      </>
    );
  };

  // Étape 3: Sécurité
  const renderSecurityStep = () => {
    return (
      <>
        {/* Mot de passe */}
        <InputGroup
          type="password"
          label="Mot de passe"
          className="[&_input]:py-[15px]"
          placeholder="Créez un mot de passe"
          name="secure"
          handleChange={handleChange}
          value={data.secure}
          required
        />
        
        {/* Confirmation du mot de passe */}
        <InputGroup
          type="password"
          label="Confirmation du mot de passe"
          className="[&_input]:py-[15px] mt-4"
          placeholder="Confirmez votre mot de passe"
          name="confirmPassword"
          handleChange={handleChange}
          value={data.confirmPassword}
          required
        />
      </>
    );
  };

  // Boutons de navigation entre les étapes
  const renderNavButtons = () => {
    return (
      <div className="mt-6 flex justify-between gap-4">
        {step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            disabled={loading || photoLoading}
            className="w-full rounded-lg border border-stroke bg-transparent py-4 font-medium text-dark transition hover:border-primary hover:bg-opacity-10 dark:border-dark-3 dark:text-white dark:hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
        )}
        
        <button
          type="submit"
          disabled={loading || photoLoading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading || (step === 2 && photoLoading) ? (
            <>
              {step === 3 ? "Inscription en cours..." : "Veuillez patienter..."}
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
            </>
          ) : (
            step === 3 ? "S'inscrire" : "Suivant"
          )}
        </button>
      </div>
    );
  };

  // Modal de succès
  const SuccessModal = () => {
    if (!showSuccessModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-dark">
          <div className="mb-5 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h3 className="mb-2 text-center text-xl font-medium text-dark dark:text-white">
            Inscription réussie
          </h3>
          
          <p className="mb-6 text-center text-body-color dark:text-dark-6">
            Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion.
          </p>
          
          <button
            onClick={handleSuccessClose}
            className="flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white transition hover:bg-opacity-90"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  };

  // Modal d'erreur
  const ErrorModal = () => {
    if (!showErrorModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-dark">
          <div className="mb-5 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          
          <h3 className="mb-2 text-center text-xl font-medium text-dark dark:text-white">
            Erreur d'inscription
          </h3>
          
          <p className="mb-6 text-center text-body-color dark:text-dark-6">
            {errorMessage}
          </p>
          
          <button
            onClick={() => setShowErrorModal(false)}
            className="flex w-full items-center justify-center rounded-lg bg-red-500 px-6 py-3 text-base font-medium text-white transition hover:bg-opacity-90"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderProgressBar()}
        
        {/* Afficher l'étape correspondante */}
        {step === 1 && renderIdentityStep()}
        {step === 2 && renderContactStep()}
        {step === 3 && renderSecurityStep()}
        
        {renderNavButtons()}

        <div className="mt-6 text-center">
          <p>
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="text-primary">
              Se connecter
            </Link>
          </p>
        </div>
      </form>
      
      {/* Modals */}
      <SuccessModal />
      <ErrorModal />
    </>
  );
}
