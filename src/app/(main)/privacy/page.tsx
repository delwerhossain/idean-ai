import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-white">iA</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">iDEAN AI</span>
          </Link>
          <div className="flex space-x-6">
            <Link
              href="/onboarding"
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Your privacy and data security are important to us
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Privacy Policy Coming Soon
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              We're currently working on our comprehensive privacy policy to ensure transparency
              about how we collect, use, and protect your data. This will be available soon.
            </p>
            <div className="text-sm text-gray-500">
              <p>In the meantime, rest assured that:</p>
              <ul className="mt-3 space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Your data is encrypted and securely stored
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  We never share your personal information with third parties
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  You have full control over your data
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  We follow industry-standard security practices
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Have questions about our privacy practices?
            </p>
            <Link
              href="mailto:privacy@idean-ai.com"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Contact our privacy team →
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      <footer className="mt-16 border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <p className="max-w-sm mx-auto">
            Private & secure. See our{' '}
            <Link href="/privacy" className="underline hover:text-gray-700">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </footer>
    </div>
  )
}

export const metadata = {
  title: 'Privacy Policy - iDEAN AI',
  description: 'Privacy policy for iDEAN AI business strategy platform',
}