import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import type { ReactNode } from "react";

export type MockRole =
    | "CANDIDATO"
    | "TESTIGO"
    | "AUDITOR"
    | "DELEGADO_CNE"
    | "FISCALIA"
    | null;

interface MockAuthContextType {
    role: MockRole;
    setRole: (role: MockRole) => void;
    logout: () => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(
    undefined,
);

export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState<MockRole>(() => {
        return (localStorage.getItem("mockRole") as MockRole) || null;
    });

    useEffect(() => {
        if (role) {
            localStorage.setItem("mockRole", role);
        } else {
            localStorage.removeItem("mockRole");
        }
    }, [role]);

    const logout = () => setRole(null);

    return (
        <MockAuthContext.Provider value={{ role, setRole, logout }}>
            {children}
        </MockAuthContext.Provider>
    );
};

export const useMockAuth = () => {
    const context = useContext(MockAuthContext);
    if (context === undefined) {
        throw new Error("useMockAuth must be used within a MockAuthProvider");
    }
    return context;
};
