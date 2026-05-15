import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";

import type { ReactNode } from "react";

export type MockRole =
    | "CIUDADANO"
    | "VOTANTE"
    | "ADMINISTRADOR"
    | "SUPERADMIN"
    | "DELEGADO_CNE"
    | "AUDITOR"
    | "OPERADOR"
    | "MAGISTRADO"
    | "REGISTRADOR"
    | "CLAVERO"
    | null;

export const ROLE_LABELS: Record<string, string> = {
    CIUDADANO: "Ciudadano",
    VOTANTE: "Votante",
    ADMINISTRADOR: "Administrador RNEC",
    SUPERADMIN: "Super Administrador",
    DELEGADO_CNE: "Delegado CNE",
    AUDITOR: "Auditor",
    OPERADOR: "Operador de Mesa",
    MAGISTRADO: "Magistrado",
    REGISTRADOR: "Registrador Nacional",
    CLAVERO: "Clavero",
};

export const CIUDADANO_ROLES: MockRole[] = ["CIUDADANO", "VOTANTE"];

export const REGISTRADURIA_ROLES: MockRole[] = [
    "ADMINISTRADOR",
    "SUPERADMIN",
    "DELEGADO_CNE",
    "AUDITOR",
    "OPERADOR",
    "MAGISTRADO",
    "REGISTRADOR",
    "CLAVERO",
];

export function isCiudadanoRole(role: MockRole): boolean {
    return CIUDADANO_ROLES.includes(role);
}

export function isRegistraduriaRole(role: MockRole): boolean {
    return REGISTRADURIA_ROLES.includes(role);
}

interface MockAuthContextType {
    role: MockRole;
    setRole: (role: MockRole) => void;
    logout: () => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(
    undefined,
);

export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRoleState] = useState<MockRole>(() => {
        return (localStorage.getItem("mockRole") as MockRole) || null;
    });

    const setRole = (newRole: MockRole) => {
        if (newRole) {
            localStorage.setItem("mockRole", newRole);
        } else {
            localStorage.removeItem("mockRole");
        }
        setRoleState(newRole);
    };

    useEffect(() => {
        if (role) {
            localStorage.setItem("mockRole", role);
        } else {
            localStorage.removeItem("mockRole");
        }
    }, [role]);

    const logout = () => {
        setRole(null);
        localStorage.removeItem("mockRole");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_username");
        localStorage.removeItem("mockUserId");
    };

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