"use client";
import * as React from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CopyButton from "@/components/CopyButton";
import { Profile, User, Group } from "@/../types/staff/groups";
import { Loader2 } from "lucide-react";
import { group } from "console";

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const { data: session } = useSession();
  const token = session?.accessToken;
  const fetchGroups = React.useCallback(async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/proxy/staff/groups", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`APIエラー: ${res.status}`);
      }

      const data = (await res.json()) as Group[];
      console.log("🔥 Laravelから届いたグループ・連絡先データ:", data);

      setGroups(data || []);
    } catch (err) {
      console.error("連絡先の取得に失敗しました:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);
  React.useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      await fetchGroups();
    };

    loadData();
  }, [token, fetchGroups]);
  return (
    <div className="w-full mx-auto p-6 space-y-6 pb-20">
      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-bold text-primary">連絡先一覧</h1>
      </div>
      {isLoading ? (
        <div className="flex h-screen justify-center items-center">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <div className="text-muted-foreground">読み込み中</div>
        </div>
      ) : (
        <div className="justify-center">
          {groups.map((group, i) => {
            const previousGroup = i > 0 ? groups[i - 1] : null;

            const isCategoryChanged =
              previousGroup && previousGroup.category !== group.category;

            return (
              <React.Fragment key={i}>
                {isCategoryChanged && (
                  <hr className="my-6 border-t border-slate-200" />
                )}
                <div>{group.name}</div>
              </React.Fragment>
            );
          })}
          <Accordion
            type="single"
            collapsible
            defaultValue=""
            className="w-full"
          >
            <AccordionItem
              value="0"
              className="bg-white rounded-md px-2 text-primary"
            >
              <AccordionTrigger>全体</AccordionTrigger>
              <AccordionContent className="h-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 px-1">
                  <Card className="p-4 border shadow-none bg-white">
                    <div className="font-bold text-slate-800 text-sm mb-2">
                      連絡先1
                    </div>
                    {/* 横並びにするために grid (2カラム) を使用 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                      {/* メールアドレス部門 */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                          メールアドレス
                        </div>
                        {[
                          "eee1@eeee.com",
                          "eee2@eeee.com",
                          "eee3@eeee.com",
                        ].map((email, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between group bg-slate-50/50 p-1.5 px-2 rounded border border-slate-100"
                          >
                            <span className="truncate">{email}</span>
                            {/* 💡 コピーボタンを配置！ */}
                            <CopyButton text={email} />
                          </div>
                        ))}
                      </div>

                      {/* 電話番号部門 */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                          電話番号
                        </div>
                        {["000-000-0001", "000-000-0002", "000-000-0003"].map(
                          (phone, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between group bg-slate-50/50 p-1.5 px-2 rounded border border-slate-100"
                            >
                              <span className="tabular-nums">{phone}</span>
                              {/* 💡 電話番号の横にも配置できちゃいます！ */}
                              <CopyButton text={phone} />
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </Card>
                  <Card className="p-2">連絡先2</Card>
                  <Card className="p-2">連絡先3</Card>
                  <Card className="p-2">連絡先4</Card>
                  <Card className="p-2">連絡先5</Card>
                </div>
              </AccordionContent>
            </AccordionItem>
            <hr className="my-2" />
            <AccordionItem
              value="1"
              className="bg-white rounded-md px-2 text-primary"
            >
              <AccordionTrigger>全体</AccordionTrigger>
              <AccordionContent className="h-auto">
                <div className="flex flex-col gap-2 pt-2 px-1">
                  <Card className="p-2">連絡先1</Card>
                  <Card className="p-2">連絡先2</Card>
                  <Card className="p-2">連絡先3</Card>
                  <Card className="p-2">連絡先4</Card>
                  <Card className="p-2">連絡先5</Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
