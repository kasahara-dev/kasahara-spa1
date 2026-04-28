interface Bus {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}


// 商品データを取得するための非同期関数
async function getBuses(): Promise<Bus[]> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/buses`;
  console.log(`Fetching data from: ${url}`); // デバッグ用にURLをログ出力

  const res = await fetch(url, {
    // SSRではキャッシュが強力に効くため、開発中はキャッシュを無効にする
    cache: "no-store",
  });

  if (!res.ok) {
    // エラーハンドリング
    throw new Error("Failed to fetch buses");
  }

  return res.json();
}

// 商品一覧ページのコンポーネント (Server Component)
export default async function BusesPage() {
  const buses = await getBuses();

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">バスコース一覧</h1>
      {/* 取得したデータをとりあえずJSON形式で表示してみる */}
      <pre className="bg-gray-100 p-4 rounded-lg">
        {JSON.stringify(buses, null, 2)}
      </pre>
    </main>
  );
}
