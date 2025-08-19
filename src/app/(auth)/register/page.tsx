import RegisterForm from "@/components/Auth/Register";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Créer un compte | Section Dashboard",
  description: "Créez votre compte pour accéder aux fonctionnalités du tableau de bord",
};

export default function Register() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Partie gauche avec l'image de l'enseignant */}
      <div className="hidden h-screen w-1/2 md:block">
        <div className="relative h-full w-full">
          <Image 
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070"
            alt="Enseignant avec des étudiants"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
          <div className="absolute bottom-10 px-8 text-center text-white z-10 w-full">
            <h2 className="mb-2 text-3xl font-bold">Enseignez avec passion</h2>
            <p className="text-lg">Rejoignez notre plateforme éducative et partagez votre expertise</p>
          </div>
        </div>
      </div>
      
      {/* Partie droite avec le formulaire */}
      <div className="flex h-screen w-full flex-col justify-between bg-white p-4 dark:bg-gray-dark md:w-1/2 md:p-8">
        <div className="mx-auto w-full max-w-md py-12">
          <div className="mb-8">
            <Link className="mb-6 inline-block" href="/">
              <Image
                className="hidden dark:block"
                src={"/images/logo/logo.svg"}
                alt="Logo"
                width={150}
                height={28}
              />
              <Image
                className="dark:hidden"
                src={"/images/logo/logo-dark.svg"}
                alt="Logo"
                width={150}
                height={28}
              />
            </Link>
            <h2 className="mb-2 text-2xl font-bold text-dark dark:text-white sm:text-3xl">
              Créez votre compte
            </h2>
            <p className="text-dark-6 dark:text-dark-4">
              Rejoignez notre plateforme et commencez à enseigner avec les meilleurs outils
            </p>
          </div>
          <RegisterForm />

        </div>
      </div>
    </div>
  );
}
