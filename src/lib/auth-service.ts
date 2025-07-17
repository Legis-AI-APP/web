import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, inMemoryPersistence } from "./firebase";
import { apiUrl } from "./api";

export const login = async (email: string, password: string) => {
  try {
    await auth.setPersistence(inMemoryPersistence);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    const response = await fetch(`${apiUrl}/api/auth/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ idToken }),
    });
    if (response.status === 401) {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};
