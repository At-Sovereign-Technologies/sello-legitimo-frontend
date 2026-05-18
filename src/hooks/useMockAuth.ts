import { useContext } from "react";
import { MockAuthContext } from "../contexts/mock-auth-context";

export const useMockAuth = () => {
    const context = useContext(MockAuthContext);
    if (context === undefined) {
        throw new Error("useMockAuth must be used within a MockAuthProvider");
    }
    return context;
};
