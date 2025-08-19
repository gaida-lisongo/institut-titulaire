import LoginForm from "@/components/Auth/Login";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Connexion | Section Dashboard",
  description: "Connectez-vous à votre compte Section Dashboard",
};

export default function Login() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Partie gauche avec l'image de l'enseignant */}
      <div className="hidden h-screen w-1/2 md:block">
        <div className="relative h-full w-full">
          <Image 
            src="https://images.unsplash.com/photo-1580894732930-0babd100d356?q=80&w=2070"
            alt="Enseignant en classe"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
          <div className="absolute bottom-10 px-8 text-center text-white z-10 w-full">
            <h2 className="mb-2 text-3xl font-bold">Accédez à votre espace</h2>
            <p className="text-lg">Connectez-vous pour retrouver vos cours et vos étudiants</p>
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
              Bon retour parmi nous
            </h2>
            <p className="text-dark-6 dark:text-dark-4">
              Connectez-vous pour accéder à votre tableau de bord pédagogique
            </p>
          </div>
          <LoginForm />

        </div>
      </div>
    </div>
  );
}
