import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { profile, vbucks, token, logout } = useAuth();

  const isLogged = !!token;

  const shortName = profile?.email
    ? profile.email.split("@")[0]
    : "Usuário";

  return (
    <header className="border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-medium">
          Fortnite Cosmetics
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/cosmetics" className="hover:underline">
            Cosméticos
          </Link>

          {isLogged ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  {shortName.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs text-gray-300">
                  <div>
                    Bem-vindo,{" "}
                    <strong className="text-white">{shortName}</strong>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    V-Bucks: {vbucks?.toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate("/auth");
                }}
                className="text-red-400 hover:text-red-300 underline text-sm"
              >
                Sair
              </button>
            </>
          ) : (
            <Link to="/auth" className="hover:underline">
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
