import Link from 'next/link';
import { Wifi, MessageSquare, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center pt-20">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-full mb-8">
            <Wifi className="w-16 h-16 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AT&T CRM
          </h1>
          
          <p className="text-xl text-blue-100 max-w-2xl mb-4">
            Authorized Retailer Management System
          </p>
          
          <p className="text-blue-200 max-w-xl mb-12">
            Manage customer conversations, check service availability, and provide 
            exceptional support—all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Open Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
            <FeatureCard
              icon="💬"
              title="SMS Conversations"
              description="Real-time messaging with customers via Twilio"
            />
            <FeatureCard
              icon="🔍"
              title="Service Checker"
              description="Check AT&T Fiber & Internet Air availability"
            />
            <FeatureCard
              icon="🤖"
              title="AI Powered"
              description="Smart responses powered by NVIDIA AI"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-blue-200 text-sm">{description}</p>
    </div>
  );
}
