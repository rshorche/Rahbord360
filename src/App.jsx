import AppRoutes from "./routes/AppRoutes";
import useSession from "./features/auth/hooks/useSession";

export default function App() {
  useSession();

  return <AppRoutes />;
}