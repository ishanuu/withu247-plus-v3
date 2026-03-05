import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

interface EmotionData {
  dominantEmotion: string;
  emotionProbs: Record<string, number>;
  negativeEmotionScore: number;
}

interface EmotionDetectionPanelProps {
  onClose: () => void;
}

export default function EmotionDetectionPanel({ onClose }: EmotionDetectionPanelProps) {
  const [emotion, setEmotion] = useState<EmotionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emotionMutation = trpc.health.analyzeEmotion.useMutation();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    try {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageBase64 = canvasRef.current.toDataURL('image/jpeg');

        const result = await emotionMutation.mutateAsync({
          imageBase64: imageBase64.split(',')[1], // Remove data:image/jpeg;base64, prefix
        });

        setEmotion(result);
      }
    } catch (error) {
      console.error('Emotion analysis error:', error);
      alert('Failed to analyze emotion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const emotionColors: Record<string, string> = {
    happy: 'bg-green-500',
    sad: 'bg-blue-500',
    angry: 'bg-red-500',
    neutral: 'bg-gray-500',
    fear: 'bg-purple-500',
    disgust: 'bg-yellow-500',
    surprise: 'bg-orange-500',
  };

  return (
    <Card className="w-full flex flex-col mb-8 bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">Emotion Detection</h3>
          <p className="text-xs text-muted-foreground">Real-time facial emotion analysis</p>
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
        {/* Camera Section */}
        <div className="space-y-4">
          {cameraActive ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Camera not active</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {!cameraActive ? (
              <Button onClick={startCamera} className="flex-1 gap-2">
                <Camera className="w-4 h-4" />
                Start Camera
              </Button>
            ) : (
              <>
                <Button
                  onClick={captureAndAnalyze}
                  disabled={isLoading}
                  className="flex-1 gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Capture & Analyze
                    </>
                  )}
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1"
                >
                  Stop Camera
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Emotion Results */}
        {emotion && (
          <div className="space-y-4">
            <div className="bg-accent rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Dominant Emotion</p>
              <p className="text-2xl font-bold text-foreground capitalize">
                {emotion.dominantEmotion}
              </p>
            </div>

            {/* Emotion Bars */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Emotion Probabilities</p>
              {Object.entries(emotion.emotionProbs).map(([emotionName, probability]) => (
                <div key={emotionName} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground capitalize">{emotionName}</span>
                    <span className="text-foreground font-semibold">
                      {(probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        emotionColors[emotionName] || 'bg-primary'
                      } transition-all duration-500`}
                      style={{ width: `${probability * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Risk Score */}
            <div className="bg-accent rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Negative Emotion Score</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
                      style={{ width: `${emotion.negativeEmotionScore * 100}%` }}
                    />
                  </div>
                </div>
                <span className="font-bold text-lg text-foreground">
                  {(emotion.negativeEmotionScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
