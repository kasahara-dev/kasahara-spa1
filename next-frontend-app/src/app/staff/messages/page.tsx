"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MessagePage() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 pb-20">
      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-bold text-primary">メッセージ</h1>
      </div>
      <div className="flex flex-col gap-6">
        <Card className="">
          <CardHeader className="px-6">
            <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
              受信履歴
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[350px] overflow-y-auto space-y-2 pr-4 pt-2 pb-6 px-6">
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="px-6">
            <CardTitle className="text-lg font-semibold text-primary flex justify-between items-center">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                送信履歴
              </h2>
              <Button className="px-4 py-2">新規作成</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[350px] overflow-y-auto space-y-2 pr-4 pt-2 pb-6 px-6">
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
            <Card className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none">
              テスト
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
