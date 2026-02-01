import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, inMemoryPersistence } from "./firebase";
import { createSession } from "./session";

export const login = async (email: string, password: string) => {
  await auth.setPersistence(inMemoryPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();
  await createSession({ idToken });
};
