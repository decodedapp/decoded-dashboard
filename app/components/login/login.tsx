import { useState, useEffect } from "react";
import { networkManager } from "@/network/network";
import { usePathname } from "next/navigation";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { jwtToAddress } from "@mysten/zklogin";
import { hash } from "@/utils/util";

interface CustomJwtPayload extends JwtPayload {
  email: string;
}
interface AdminLoginProps {
  setIsLoading: (isLoading: boolean) => void;
  onLogin: () => void;
}

export default function AdminLogin({ setIsLoading, onLogin }: AdminLoginProps) {
  const [error, setError] = useState<string | null>(null);

  const pathName = usePathname();

  useEffect(() => {
    const hashTag = window.location.hash;
    const login = async (token: string) => {
      setIsLoading(true);
      const decoded_jwt = jwtDecode<CustomJwtPayload>(token);
      const sub = decoded_jwt.sub;
      const iss = decoded_jwt.iss;
      const aud = decoded_jwt.aud;
      if (sub && iss && aud) {
        const token_hash = hash(sub + iss + aud);
        try {
          const res = await networkManager.request(
            `user/login?type=admin`,
            "POST",
            {
              token: token_hash,
              email: decoded_jwt.email,
              agreement: {
                marketing: true,
                notification: false,
                tracking: false,
              },
            }
          );

          localStorage.setItem("access_token", res.data.access_token);
          const sui_acc = jwtToAddress(token, res.data.salt);
          const user_doc_id = res.data.doc_id;
          window.sessionStorage.setItem("USER_DOC_ID", user_doc_id);
          window.sessionStorage.setItem("SUI_ACCOUNT", sui_acc);
          onLogin();
        } catch (err) {
          alert(err);
        } finally {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    };
    if (hashTag) {
      const params = new URLSearchParams(hashTag.substring(1));
      const token = params.get("id_token");
      if (token) {
        login(token);
      }
    }
  }, [pathName]);

  const handleGoogleLogin = async () => {
    const { sk, randomness, exp, url } =
      await networkManager.openIdConnectUrl();
    window.sessionStorage.setItem("EPK_SECRET", sk);
    window.sessionStorage.setItem("RANDOMNESS", randomness);
    window.sessionStorage.setItem("EXPIRED_AT", exp.toString());
    window.location.replace(url);
  };

  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            className={
              "w-full flex items-center justify-center px-4 py-2.5 rounded-md shadow-sm bg-[#1A1A1A] hover:bg-[#EAFD66] transition-colors duration-200"
            }
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-400">로그인</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
