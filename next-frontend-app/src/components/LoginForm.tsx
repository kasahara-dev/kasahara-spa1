"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  role: "staff" | "parent";
}

export default function LoginForm({ role }: LoginFormProps) {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const title = role === "staff" ? "職員ログイン" : "保護者ログイン";
  const redirectPath = role === "staff" ? "/staff" : "/";
  const testAccount =
    role === "staff" ? "S2021001 / password" : "202401001 / password";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        loginId,
        password,
        role,
        redirect: false,
      });

      if (result?.error) {
        setError("ログインIDまたはパスワードが正しくありません");
      } else {
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err) {
      setError("ログイン中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-gray-100">
      <h1 className="text-2xl font-bold text-center mb-6 text-primary">
        {title}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="loginId"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            ログインID
          </label>
          <Input
            id="loginId"
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
            placeholder="IDを入力してください"
            className="rounded-xl"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            パスワード
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="rounded-xl"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-6 text-lg font-bold transition-all active:scale-95"
        >
          {isLoading ? "ログイン中..." : "ログイン"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400 bg-gray-50 py-2 rounded-full">
        テストアカウント: {testAccount}
      </p>
    </div>
  );
}
