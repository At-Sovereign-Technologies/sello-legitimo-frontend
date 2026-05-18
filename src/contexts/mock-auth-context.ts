import { createContext } from "react";

export type MockRole =
    | "CANDIDATO"
    | "TESTIGO"
    | "AUDITOR"
    | "DELEGADO_CNE"
    | "FISCALIA"
    | "ADMIN_RNEC"
    | null;

export interface MockAuthContextType {
    role: MockRole;
    setRole: (role: MockRole) => void;
    logout: () => void;
}

export const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);
