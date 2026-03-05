import React, { useState } from 'react';
import { X, Search, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

interface SymptomResult {
  symptom: string;
  possibleConditions: string[];
  severityScore: number;
  riskScore: number;
  riskClassification: string;
  sources: Array<{ title: string; url: string }>;
  recommendedNextSteps: string;
}

interface SymptomAnalysisPanelProps {
  onClose: () => void;
}

export default function SymptomAnalysisPanel({ onClose }: SymptomAnalysisPanelProps) {
  const [symptom, setSymptom] = useState('');
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const symptomMutation = trpc.health.analyzeSymptoms.useMutation();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptom.trim()) return;

    setIsLoading(true);
    try {
      const res = await symptomMutation.mutateAsync({
        symptom: symptom.trim(),
      });
      setResult(res);
    } catch (error) {
      console.error('Symptom analysis error:', error);
      alert('Failed to analyze symptom. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (classification: string) => {
    switch (classification) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getRiskBgColor = (classification: string) => {
    switch (classification) {
      case 'high':
        return 'bg-red-500/10 border-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 border-green-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <Card className="w-full flex flex-col mb-8 bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">Symptom Analysis</h3>
          <p className="text-xs text-muted-foreground">RAG-powered medical research analysis</p>
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
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="Describe your symptom (e.g., headache, fever, chest pain)..."
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
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Risk Classification */}
            <div className={`rounded-lg border p-4 ${getRiskBgColor(result.riskClassification)}`}>
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getRiskColor(result.riskClassification)}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground mb-1">Risk Assessment</p>
                  <p className={`text-lg font-bold ${getRiskColor(result.riskClassification)} capitalize`}>
                    {result.riskClassification} Risk
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Risk Score: {(result.riskScore * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Severity Score */}
            <div className="bg-accent rounded-lg p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Severity Score</p>
              <div className="space-y-2">
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
                    style={{ width: `${result.severityScore}%` }}
                  />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {result.severityScore.toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Possible Conditions */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Possible Conditions</p>
              <div className="space-y-2">
                {result.possibleConditions.map((condition, idx) => (
                  <div
                    key={idx}
                    className="bg-muted rounded-lg p-3 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm text-foreground">{condition}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Next Steps */}
            {result.recommendedNextSteps && (
              <div className="bg-accent rounded-lg p-4">
                <p className="text-sm font-semibold text-foreground mb-2">Recommended Next Steps</p>
                <p className="text-sm text-muted-foreground">{result.recommendedNextSteps}</p>
              </div>
            )}

            {/* Sources */}
            {result.sources.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Research Sources</p>
                <div className="space-y-2">
                  {result.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-muted rounded-lg p-3 hover:bg-accent transition-colors"
                    >
                      <p className="text-sm text-primary hover:underline">{source.title}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
