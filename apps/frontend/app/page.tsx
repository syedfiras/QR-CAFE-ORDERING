import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4">
      <main className="max-w-2xl w-full text-center">
        {/* Logo/Branding */}
        <div className="mb-8">
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-primary-400 mb-3">
            Bistro Yahya
          </h1>
          <p className="text-neutral-600 text-lg">Premium Cafe Experience</p>
        </div>

        {/* Welcome message */}
        <div className="bg-white rounded-3xl shadow-soft-lg p-8 sm:p-12 mb-8">
          <div className="text-6xl mb-6">🍽️</div>
          <h2 className="font-display text-3xl font-bold text-neutral-800 mb-4">
            Welcome!
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-6">
            Scan the QR code at your table to view our menu and place your order.
            Your food will be freshly prepared and brought to your table.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-neutral-600">
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">📱</span>
              <span>Contactless Menu</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">⚡</span>
              <span>Quick Ordering</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">✨</span>
              <span>Fresh & Fast</span>
            </div>
          </div>
        </div>

        {/* Test link */}
        <div className="text-neutral-500 text-sm">
          <p className="mb-3">For testing purposes:</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/menu?table=1"
              className="bg-primary-300 text-white px-6 py-3 rounded-2xl hover:bg-primary-400 transition-all shadow-soft hover:shadow-soft-lg"
            >
              View Menu (Table 1)
            </Link>
            <Link
              href="/admin"
              className="bg-neutral-800 text-white px-6 py-3 rounded-2xl hover:bg-neutral-700 transition-all shadow-soft hover:shadow-soft-lg"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-neutral-400 text-xs mt-12">
          Made with ❤️ for Bistro Yahya
        </p>
      </main>
    </div>
  );
}
