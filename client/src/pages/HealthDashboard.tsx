import React, { useState } from 'react';
import { Activity, Heart, Brain, MapPin, BookOpen } from 'lucide-react';
import HorizontalScrollCards from '@/components/HorizontalScrollCards';
import ChatPanel from '@/components/ChatPanel';
import EmotionDetectionPanel from '@/components/EmotionDetectionPanel';
import SymptomAnalysisPanel from '@/components/SymptomAnalysisPanel';
import DoctorRecommendationPanel from '@/components/DoctorRecommendationPanel';
import NearbyHospitalsPanel from '@/components/NearbyHospitalsPanel';

export default function HealthDashboard() {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // Sample data for health assistant cards
  const healthAssistantCards = [
    {
      id: '1',
      title: 'AI Health Assistant',
      description: 'Chat with our RAG-powered medical AI for instant health guidance and research-backed answers.',
      badge: 'Active',
      onClick: () => setActivePanel('chat'),
    },
    {
      id: '2',
      title: 'Symptom Checker',
      description: 'Describe your symptoms and get AI-powered analysis with possible conditions and next steps.',
      badge: 'Available',
      onClick: () => setActivePanel('symptoms'),
    },
    {
      id: '3',
      title: 'Emotion Tracker',
      description: 'Monitor your emotional state with real-time emotion detection using facial recognition.',
      badge: 'New',
      onClick: () => setActivePanel('emotion'),
    },
  ];

  const emotionStatusCards = [
    {
      id: 'e1',
      title: 'Current Mood',
      description: 'Your emotional state is being monitored in real-time.',
      badge: 'Monitoring',
    },
    {
      id: 'e2',
      title: 'Mood Trends',
      description: 'View your emotional patterns over time to identify triggers.',
      badge: 'Analytics',
    },
    {
      id: 'e3',
      title: 'Wellness Score',
      description: 'Your overall wellness score based on emotion and sentiment analysis.',
      badge: 'Score',
    },
  ];

  const symptomAnalysisCards = [
    {
      id: 's1',
      title: 'Recent Symptoms',
      description: 'Track symptoms you\'ve reported and their severity levels.',
      badge: 'History',
    },
    {
      id: 's2',
      title: 'Condition Mapping',
      description: 'AI-powered mapping of symptoms to potential medical conditions.',
      badge: 'Analysis',
    },
    {
      id: 's3',
      title: 'Risk Assessment',
      description: 'Get a risk score based on symptoms, emotions, and sentiment.',
      badge: 'Priority',
    },
  ];

  const nearbyDoctorsCards = [
    {
      id: 'd1',
      title: 'Find Specialists',
      description: 'Locate doctors and specialists near you based on your needs.',
      badge: 'Map',
      onClick: () => setActivePanel('doctors'),
    },
    {
      id: 'd2',
      title: 'Hospital Search',
      description: 'Find nearby hospitals with ratings and distance information.',
      badge: 'Nearby',
      onClick: () => setActivePanel('hospitals'),
    },
    {
      id: 'd3',
      title: 'Doctor Recommendations',
      description: 'Get specialist recommendations based on your symptoms.',
      badge: 'Triage',
      onClick: () => setActivePanel('triage'),
    },
  ];

  const medicalKnowledgeCards = [
    {
      id: 'k1',
      title: 'PubMed Research',
      description: 'Access peer-reviewed medical research and clinical studies.',
      badge: 'Research',
    },
    {
      id: 'k2',
      title: 'Medical Guidelines',
      description: 'Evidence-based treatment guidelines and best practices.',
      badge: 'Guidelines',
    },
    {
      id: 'k3',
      title: 'Health Education',
      description: 'Learn about conditions, treatments, and preventive care.',
      badge: 'Education',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Heart className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white">WithU247+ Health Assistant</h1>
          </div>
          <p className="text-lg text-white/90">
            Your comprehensive AI-powered health companion with emotion detection, symptom analysis, and doctor recommendations.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Active Panel */}
        {activePanel === 'chat' && <ChatPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'emotion' && <EmotionDetectionPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'symptoms' && <SymptomAnalysisPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'triage' && <DoctorRecommendationPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'hospitals' && <NearbyHospitalsPanel onClose={() => setActivePanel(null)} />}

        {/* Horizontal Scroll Sections */}
        {!activePanel && (
          <>
            <HorizontalScrollCards
              title="Health Assistant"
              subtitle="Start your health journey with AI-powered tools"
              cards={healthAssistantCards}
            />

            <HorizontalScrollCards
              title="Emotion Status"
              subtitle="Monitor your emotional well-being in real-time"
              cards={emotionStatusCards}
            />

            <HorizontalScrollCards
              title="Symptom Analysis"
              subtitle="Analyze symptoms and get AI-powered insights"
              cards={symptomAnalysisCards}
            />

            <HorizontalScrollCards
              title="Nearby Doctors"
              subtitle="Find healthcare professionals near you"
              cards={nearbyDoctorsCards}
            />

            <HorizontalScrollCards
              title="Medical Knowledge"
              subtitle="Access research-backed medical information"
              cards={medicalKnowledgeCards}
            />
          </>
        )}
      </div>
    </div>
  );
}
