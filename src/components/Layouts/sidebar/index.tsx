"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";
import { titulaireApi, userApi } from "@/api";
import * as Icons from "./icons";
import { title } from "process";

interface MenuItem {
  label: string;
  items: Array<{
    title: string;
    icon?: any;
    url?: string;
    items?: Array<{
      title?: string;
      icon?: any;
      url: string;
    }>
  }>
}

export function Sidebar() {
    const pathname = usePathname();
    const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const isMenuLoaded = useRef(false);

    const toggleExpanded = (title: string) => {
      setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));
    };

    // Cette fonction charge directement les données du titulaire et met à jour le menu
    const loadTitulaireData = async () => {
      try {
        const response = await titulaireApi.initTitulaire();
        console.log("Titulaire Data:", response);
        
        if (!response || !response.success) {
          console.error("Failed to fetch titulaire data");
          return;
        }
        
        const { charges, jurys } = response.data;
        localStorage.setItem("charges", JSON.stringify(charges));
        localStorage.setItem("jurys", JSON.stringify(jurys));
        
        // Création des items de menu
        const chargesMenuItem: MenuItem = {
          label: 'CHARGES HORAIRES',
          items: charges.map((charge: {id: number, filiaire: string, ecue: string, annee: string}) => ({
            title: `${charge.ecue} (${charge.filiaire} ${charge.annee})`,
            icon: Icons.FourCircle,
            items: [
              { title: "Fiche de cotation", url: `/fiches/${charge.id}` },
              { title: "Séances", url: `/seances/${charge.id}` },
              { title: "Travaux", url: `/travaux/${charge.id}` },
            ]
          }))
        };
        
        const jurysMenuItem: MenuItem = {
          label: 'JURYS',
          items: jurys.map((jury: {id: number, designation: string}) => ({
            title: jury.designation,
            icon: Icons.Calendar,
            items: [
              { title: "Grilles", url: `/grilles/${jury.id}` },
              { title: "Palmares", url: `/palmares/${jury.id}` },
              { title: "Recours", url: `/recours/${jury.id}` }
            ]
          }))
        };
        
        // Mise à jour du menu avec les nouvelles données
        setMenuItems(prevMenuItems => {
          // Filtrer les items existants pour éviter les doublons
          const filteredItems = prevMenuItems.filter(item => 
            item.label !== 'CHARGES HORAIRES' && item.label !== 'JURYS'
          );
          
          return [
            {
              label: "TITULAIRE",
              items: [
                {
                  title: "Tableau de bord",
                  url: "/",
                  icon: Icons.HomeIcon,
                }
              ],
            },
            ...filteredItems,
            chargesMenuItem,
            jurysMenuItem
          ];
        });
      } catch (error) {
        console.error("Error loading titulaire data:", error);
      }
    };

    const fetchPrivileges = async () => {
      try {
        // Initialiser avec les données statiques
        setMenuItems(NAV_DATA);
        
        // Vérifier si l'utilisateur est connecté
        const userDataStr = localStorage.getItem("user");
        if (!userDataStr) {
          console.log("No user data found");
          return;
        }
        
        const userData = JSON.parse(userDataStr);
        if (!userData || !userData.id) {
          console.log("Invalid user data");
          return;
        }
        
        // Récupérer les privilèges
        const privileges = await userApi.getPrivileges(userData.id);
        console.log("User privileges:", privileges);
        
        if (!Array.isArray(privileges)) {
          console.log("Privileges is not an array");
          return;
        }
        
        // Traiter les privilèges
        const roles = privileges
          .filter(item => item && item.privilege)
          .map(item => item.privilege);
          
        console.log("User roles:", roles);
        
        // Charger les données du titulaire si nécessaire
        if (roles.includes('Titulaire') && !isMenuLoaded.current) {
          isMenuLoaded.current = true;
          await loadTitulaireData();
        }
        
        // Traiter d'autres rôles si nécessaire
        // ...
        
      } catch (error) {
        console.error("Error fetching privileges:", error);
      }
    };

    useEffect(() => {
      // Initialiser avec les données statiques et charger les privilèges
      fetchPrivileges();
      
      // Cleanup
      return () => {
        isMenuLoaded.current = false;
      };
    }, []);

    useEffect(() => {
      // Maintenir ouvert l'élément correspondant à la page active
      menuItems.forEach(section => {
        if (!section.items) return;
        
        section.items.forEach(item => {
          if (!item || !item.items) return;
          
          item.items.forEach(subItem => {
            if (subItem.url === pathname && !expandedItems.includes(item.title)) {
              toggleExpanded(item.title);
            }
          });
        });
      });
    }, [pathname, menuItems]);

    return (
      <>
        {/* Mobile Overlay */}
        {isMobile && isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={cn(
            "max-w-[290px] overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark",
            isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
            isOpen ? "w-full" : "w-0",
          )}
          aria-label="Main navigation"
          aria-hidden={!isOpen}
          inert={!isOpen}
        >
          <div className="flex h-full flex-col py-10 pl-[25px] pr-[7px]">
            <div className="relative pr-4.5">
              <Link
                href={"/"}
                onClick={() => isMobile && toggleSidebar()}
                className="px-0 py-2.5 min-[850px]:py-0"
              >
                <Logo />
              </Link>

              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
                >
                  <span className="sr-only">Close Menu</span>

                  <ArrowLeftIcon className="ml-auto size-7" />
                </button>
              )}
            </div>

            {/* Navigation */}
            <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
              {menuItems.map((section, uniqueIndex) => (
                <div key={`${section.label}-${uniqueIndex}`} className="mb-6">
                  <h2 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                    {section.label}
                  </h2>

                  <nav role="navigation" aria-label={section.label}>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={`${item.title}-${itemIndex}`}>
                          {item && item.items && item.items.length > 0 ? (
                            <div>
                              <MenuItem
                                isActive={item.items.some(
                                  ({ url }) => url === pathname,
                                )}
                                onClick={() => toggleExpanded(item.title)}
                              >
                                {item.icon && (
                                  <item.icon
                                    className="size-6 shrink-0"
                                    aria-hidden="true"
                                  />
                                )}

                                <span>{item.title}</span>

                                <ChevronUp
                                  className={cn(
                                    "ml-auto rotate-180 transition-transform duration-200",
                                    expandedItems.includes(item.title) &&
                                      "rotate-0",
                                  )}
                                  aria-hidden="true"
                                />
                              </MenuItem>

                              {expandedItems.includes(item.title) && (
                                <ul
                                  className="ml-9 mr-0 space-y-1.5 pb-[15px] pr-0 pt-2"
                                  role="menu"
                                >
                                  {item.items.map((subItem, subIndex) => (
                                    <li key={`${subItem.title}-${subIndex}`} role="none">
                                      <MenuItem
                                        as="link"
                                        href={subItem.url || '#'}
                                        isActive={pathname === subItem.url}
                                      >
                                        <span>{subItem.title}</span>
                                      </MenuItem>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ) : (
                            (() => {
                              const href = item.url || 
                                "/" + item.title.toLowerCase().split(" ").join("-");

                              return (
                                <MenuItem
                                  className="flex items-center gap-3 py-3"
                                  as="link"
                                  href={href}
                                  isActive={pathname === href}
                                >
                                  {item.icon && (
                                    <item.icon
                                      className="size-6 shrink-0"
                                      aria-hidden="true"
                                    />
                                  )}

                                  <span>{item.title}</span>
                                </MenuItem>
                              );
                            })()
                          )}
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </>
    );
}
