"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import type {
  ContactFieldKey,
  ContactErrors,
  LoadingField,
} from "@/../types/profile";

export default function ProfileContactsForm() {
  const [email1, setEmail1] = useState("");
  const [email2, setEmail2] = useState("");
  const [email3, setEmail3] = useState("");
  const [tel1, setTel1] = useState("");
  const [tel2, setTel2] = useState("");
  const [tel3, setTel3] = useState("");
  const { data: session,status } = useSession();
  const token = session?.accessToken;

  const [errors, setErrors] = useState<ContactErrors>({});
  const [successField, setSuccessField] = useState<LoadingField>(null);
  const [submittingField, setSubmittingField] = useState<LoadingField>(null);

  useEffect(() => {
    if (status === "loading" || !token) return;
    async function loadProfile() {
      try {
        const response = await fetch("/api/proxy/profile", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setEmail1(data.email1 || "");
          setEmail2(data.email2 || "");
          setEmail3(data.email3 || "");
          setTel1(data.tel1 || "");
          setTel2(data.tel2 || "");
          setTel3(data.tel3 || "");
        }
      } catch (error) {
        console.error("プロフィール読み込みエラー:", error);
      }
    }
    loadProfile();
  }, [token,status]);
  const handleUpdate = async (
    field: ContactFieldKey,
    value: string,
    isRequired = false,
  ) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSuccessField(null);
    if (isRequired && !value.trim()) {
      setErrors((prev) => ({ ...prev, [field]: "この項目は必須です" }));
      return;
    }

    setSubmittingField(field);

    try {
      const response = await fetch("/api/proxy/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        setSuccessField(field);
        setTimeout(() => setSuccessField(null), 3000);
        return;
      }

      if (response.status === 422) {
        const errorData = await response.json();
        setErrors((prev) => ({
          ...prev,
          [field]: errorData.errors?.[field]?.[0] || "入力内容に不備があります",
        }));
        return;
      }

      throw new Error("更新失敗");
    } catch (error) {
      console.error("更新エラー:", error);
      setErrors((prev) => ({
        ...prev,
        [field]: "更新に失敗しました。時間を置いて再度お試しください。",
      }));
    } finally {
      setSubmittingField(null);
    }
  };

  const renderField = (
    label: string,
    fieldKey: ContactFieldKey,
    value: string,
    setValue: (val: string) => void,
    isRequired = false,
    placeholder = "",
  ) => {
    const isSubmitting = submittingField === fieldKey;
    const isSuccess = successField === fieldKey;

    return (
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {label}
          {isRequired && (
            <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">
              必須
            </span>
          )}
        </label>
        <div className="flex gap-2">
          <input
            type={label.includes("メール") ? "email" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={submittingField !== null}
            placeholder={placeholder}
            className={`flex-1 p-2 border bg-white text-black rounded-md focus:outline-none focus:ring-2 ${
              errors[fieldKey]
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
          />
          <Button
            onClick={() => handleUpdate(fieldKey, value, isRequired)}
            disabled={submittingField !== null}
            className={`h-10 px-4 text-sm font-medium transition-colors min-w-[70px]`}
          >
            {isSubmitting ? "中..." : isSuccess ? "✓ 完了" : "更新"}
          </Button>
        </div>
        {errors[fieldKey] && (
          <p className="text-xs text-red-500 font-medium mt-1">
            {errors[fieldKey]}
          </p>
        )}
        {isSuccess && (
          <p className="text-xs text-green-600 font-medium mt-1">
            更新しました。
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="px-4 pb-20 flex flex-col items-center">
      <div className="w-full md:w-1/2 mt-2">
        <h2 className="underline text-primary font-bold">保護者連絡先編集</h2>
        <div className="my-8 text-primary">
          {renderField(
            "メールアドレス 1",
            "email1",
            email1,
            setEmail1,
            true,
            "example1@example.com",
          )}
          {renderField(
            "メールアドレス 2",
            "email2",
            email2,
            setEmail2,
            false,
            "example2@example.com",
          )}
          {renderField(
            "メールアドレス 3",
            "email3",
            email3,
            setEmail3,
            false,
            "example3@example.com",
          )}
          {renderField(
            "電話番号 1",
            "tel1",
            tel1,
            setTel1,
            true,
            "090-1234-5678",
          )}
          {renderField(
            "電話番号 2",
            "tel2",
            tel2,
            setTel2,
            false,
            "03-1234-5678",
          )}
          {renderField(
            "電話番号 3",
            "tel3",
            tel3,
            setTel3,
            false,
            "050-1234-5678",
          )}
        </div>
      </div>
    </div>
  );
}
