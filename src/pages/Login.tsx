import { useSignInWithGoogle } from "@auth";

export default function LoginPage(): JSX.Element {
  const { signIn } = useSignInWithGoogle();
  return (
    <div>
      <h1 className="text-white">Login</h1>
      <button onClick={signIn}>Sign in with Google</button>
    </div>
  );
}
