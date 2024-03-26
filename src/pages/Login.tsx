import { signInWithEmail, signInWithGoogle } from "@auth";
import React, { useState } from "react";

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <h1 className="text-white">Login</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={() => signInWithEmail(email, password)}>Sign in</button>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  );
}
