const appName = process.env.NEXT_PUBLIC_APP_NAME || "幼稚園連絡アプリ";

export default function NonMenuHeader() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">{ appName }</div>
    </header>
  );
}
