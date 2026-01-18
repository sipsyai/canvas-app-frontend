function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Canvas App
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mt-4">
              Object-Centric No-Code Platform
            </p>
          </div>

          {/* Features */}
          <div className="pt-8 grid md:grid-cols-3 gap-6">
            <Feature
              icon="📊"
              title="Dynamic Objects"
              description="Create custom objects like Salesforce"
            />
            <Feature
              icon="🎯"
              title="Field Library"
              description="Reusable field definitions"
            />
            <Feature
              icon="🔗"
              title="Relationships"
              description="Connect objects with 1:N and N:N"
            />
          </div>

          {/* CTA Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl">
              Get Started
            </button>
            <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg font-semibold transition-colors">
              Learn More
            </button>
          </div>

          {/* Tech Stack Info */}
          <div className="pt-8 text-sm text-gray-500 dark:text-gray-400 space-y-2">
            <p className="flex items-center justify-center gap-2">
              ✨ <span className="font-medium">React 19</span> +
              <span className="font-medium">Vite 6</span> +
              <span className="font-medium">TypeScript 5.7</span> +
              <span className="font-medium">Tailwind 4</span>
            </p>
            <p className="flex items-center justify-center gap-2">
              🚀 <span className="font-medium">React Aria</span> +
              <span className="font-medium">TanStack Query</span> +
              <span className="font-medium">Zustand</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureProps {
  icon: string;
  title: string;
  description: string;
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-all hover:scale-105">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

export default HomePage;
