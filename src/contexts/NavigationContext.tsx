import React, { createContext, useContext, ReactNode } from "react";

type Module =
  | "dashboard"
  | "inventory"
  | "orders"
  | "customers"
  | "fulfillment"
  | "analytics"
  | "oms"
  | "settings";

interface NavigationContextType {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
  activeModule: Module;
  setActiveModule: (module: Module) => void;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  activeModule,
  setActiveModule,
}) => {
  return (
    <NavigationContext.Provider value={{ activeModule, setActiveModule }}>
      {children}
    </NavigationContext.Provider>
  );
};
