import { useState, useEffect } from "react";

import type { ReactNode } from "react";
import type { MockRole } from "./mock-auth-context";
import { MockAuthContext } from "./mock-auth-context";

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
