import { useUser } from "@/context/UserContext";

export default function Terminal() {
  const { user, logout } = useUser();

  if (!user) {
    return (
      <>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
        <p>Loading...</p>
      </>
    );
  }

  return (
    <div>
      <h1>Welcome, {user.full_name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
