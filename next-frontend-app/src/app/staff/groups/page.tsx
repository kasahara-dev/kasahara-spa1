"use client";
import * as React from "react";
import { useSession } from "next-auth/react";
import { useState, Fragment } from "react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CopyButton from "@/components/CopyButton";
import { Group } from "@/../types/staff/groups";
import Loading from "@/components/Loading"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const { data: session, status } = useSession();
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
  if (status === "loading" || isLoading) {
    return (
      <Loading />
    );
  }
  return (
    <div className="w-full mx-auto p-6 space-y-6 pb-20">
      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-bold text-primary">連絡先一覧</h1>
      </div>
      <div className="justify-center">
        <Accordion type="single" collapsible defaultValue="" className="w-full">
          {groups.map((group, i) => {
            const previousGroup = i > 0 ? groups[i - 1] : null;
            const categoryChanged =
              previousGroup && previousGroup.category !== group.category;
            return (
              <Fragment key={group.id}>
                {categoryChanged && <hr className="my-2" />}
                <AccordionItem
                  value={String(group.id)}
                  className="bg-white rounded-md px-2 m-1 text-primary"
                >
                  <AccordionTrigger>
                    {group.name}({group.users.length}名)
                  </AccordionTrigger>
                  <AccordionContent className="h-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 px-1">
                      {group.users.map((user) => {
                        return (
                          <Fragment key={user.id}>
                            <Card className="p-4 border shadow-none bg-white">
                              <div className="font-bold text-slate-800 text-sm">
                                {user.name}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                                {/* メールアドレス部門 */}
                                <div className="space-y-1.5">
                                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                    メールアドレス
                                  </div>
                                  {user.profile?.email1 && (
                                    <div className="flex items-center justify-between group bg-slate-50/50 p-1.5 px-2 rounded border border-slate-100">
                                      <span className="truncate">
                                        {user.profile?.email1}
                                      </span>
                                      <CopyButton text={user.profile?.email1} />
                                    </div>
                                  )}
                                  {user.profile?.email2 && (
                                    <div className="flex items-center justify-between group bg-slate-50/50 p-1.5 px-2 rounded border border-slate-100">
                                      <span className="truncate">
                                        {user.profile?.email2}
                                      </span>
                                      <CopyButton text={user.profile?.email2} />
                                    </div>
                                  )}
                                  {user.profile?.email3 && (
                                    <div className="flex items-center justify-between group bg-slate-50/50 p-1.5 px-2 rounded border border-slate-100">
                                      <span className="truncate">
                                        {user.profile?.email3}
                                      </span>
                                      <CopyButton text={user.profile?.email3} />
                                    </div>
                                  )}
                                </div>

                                {/* 電話番号部門 */}
                                <div className="space-y-1.5">
                                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                    電話番号
                                  </div>
                                  {user.profile?.tel1 && (
                                    <div
                                      className="flex items-center justify-between group bg-slate-50/50 p-1.5 px-2 rounded border border-slate-100"
                                    >
                                      <span className="tabular-nums">
                                        {user.profile?.tel1}
                                      </span>
                                      <CopyButton text={user.profile?.tel1} />
                                    </div>
                                  )}
                                  {user.profile?.tel2 && (
                                    <div
                                      className="flex items-center justify-between group bg-slate-50/50 p-1.5 px-2 rounded border border-slate-100"
                                    >
                                      <span className="tabular-nums">
                                        {user.profile?.tel2}
                                      </span>
                                      <CopyButton text={user.profile?.tel2} />
                                    </div>
                                  )}
                                  {user.profile?.tel3 && (
                                    <div
                                      className="flex items-center justify-between group bg-slate-50/50 p-1.5 px-2 rounded border border-slate-100"
                                    >
                                      <span className="tabular-nums">
                                        {user.profile?.tel3}
                                      </span>
                                      <CopyButton text={user.profile?.tel3} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </Fragment>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Fragment>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
