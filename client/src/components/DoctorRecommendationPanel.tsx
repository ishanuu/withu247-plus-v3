import React, { useState } from 'react';
import { X, Stethoscope, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

interface TriageResult {
  symptom: string;
  recommendedSpecialty: string;
}

interface DoctorRecommendationPanelProps {
  onClose: () => void;
}

const specialtyIcons: Record<string, string> = {
  'Cardiologist': '❤️',
  'Dermatologist': '🩹',
  'Neurologist': '🧠',
  'Psychiatrist': '🧘',
  'Orthopedist': '🦴',
  'Gastroenterologist': '🍽️',
  'Pulmonologist': '🫁',
  'Urologist': '💧',
  'General Practitioner': '👨‍⚕️',
};

export default function DoctorRecommendationPanel({ onClose }: DoctorRecommendationPanelProps) {
  const [symptom, setSymptom] = useState('');
  const [result, setResult] = useState<TriageResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const triageMutation = trpc.health.triage.useMutation();

  const handleTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptom.trim()) return;

    setIsLoading(true);
    try {
      const res = await triageMutation.mutateAsync({
        symptom: symptom.trim(),
      });
      setResult(res);
    } catch (error) {
      console.error('Triage error:', error);
      alert('Failed to determine doctor specialty. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full flex flex-col mb-8 bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">Doctor Recommendation</h3>
          <p className="text-xs text-muted-foreground">Find the right specialist for your symptoms</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Input Section */}
        <form onSubmit={handleTriage} className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="Describe your symptom..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !symptom.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Finding...
                </>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4" />
                  Find Specialist
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Recommended Specialty */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-6">
              <p className="text-sm text-muted-foreground mb-2">Recommended Specialist</p>
              <div className="flex items-center gap-4">
                <div className="text-5xl">
                  {specialtyIcons[result.recommendedSpecialty] || '👨‍⚕️'}
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {result.recommendedSpecialty}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on your symptom: <span className="font-semibold">{result.symptom}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Specialty Description */}
            <div className="bg-accent rounded-lg p-4">
              <p className="text-sm font-semibold text-foreground mb-2">About This Specialist</p>
              <p className="text-sm text-muted-foreground">
                {getSpecialtyDescription(result.recommendedSpecialty)}
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-accent rounded-lg p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Next Steps</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Search for {result.recommendedSpecialty}s in your area</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Check their qualifications and patient reviews</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Schedule a consultation appointment</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Prepare a list of your symptoms and medical history</span>
                </li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Disclaimer:</span> This recommendation is based on AI analysis and should not replace professional medical advice. Always consult with a qualified healthcare provider for accurate diagnosis and treatment.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function getSpecialtyDescription(specialty: string): string {
  const descriptions: Record<string, string> = {
    'Cardiologist': 'Specializes in heart and cardiovascular system diseases. Treats conditions like hypertension, heart disease, and arrhythmias.',
    'Dermatologist': 'Specializes in skin, hair, and nail disorders. Treats acne, eczema, psoriasis, and skin infections.',
    'Neurologist': 'Specializes in nervous system disorders. Treats migraines, epilepsy, Parkinson\'s disease, and stroke.',
    'Psychiatrist': 'Specializes in mental health and behavioral disorders. Treats depression, anxiety, bipolar disorder, and PTSD.',
    'Orthopedist': 'Specializes in bones, joints, and muscles. Treats fractures, arthritis, and sports injuries.',
    'Gastroenterologist': 'Specializes in digestive system disorders. Treats GERD, ulcers, IBS, and inflammatory bowel disease.',
    'Pulmonologist': 'Specializes in lung and respiratory system diseases. Treats asthma, COPD, and pneumonia.',
    'Urologist': 'Specializes in urinary system and male reproductive health. Treats kidney stones, UTIs, and prostate issues.',
    'General Practitioner': 'Provides comprehensive primary care for all age groups and manages various health conditions.',
  };

  return descriptions[specialty] || 'A qualified healthcare professional who can provide expert care for your condition.';
}
