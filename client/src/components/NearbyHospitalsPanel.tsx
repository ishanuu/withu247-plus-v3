import React, { useState, useEffect } from 'react';
import { X, MapPin, Loader2, Phone, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

interface Hospital {
  name: string;
  address: string;
  rating?: number;
  location?: { lat: number; lng: number };
  placeId?: string;
}

interface NearbyHospitalsPanelProps {
  onClose: () => void;
}

export default function NearbyHospitalsPanel({ onClose }: NearbyHospitalsPanelProps) {
  const [specialty, setSpecialty] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLocation || !specialty.trim()) {
      alert('Please enable location and enter a specialty');
      return;
    }

    setIsLoading(true);
    try {
      // Call the API directly via fetch since trpc query doesn't support dynamic parameters well in this context
      const response = await fetch('/api/trpc/health.nearbyDoctors', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nearby doctors');
      }

      const data = await response.json();
      if (data && data.results) {
        setHospitals(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to find nearby hospitals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full flex flex-col mb-8 bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">Nearby Hospitals & Doctors</h3>
          <p className="text-xs text-muted-foreground">Find healthcare facilities near you</p>
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
        {/* Search Section */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Search by specialty (e.g., Cardiologist, Hospital)..."
              disabled={isLoading || !userLocation}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !specialty.trim() || !userLocation}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          {!userLocation && (
            <p className="text-xs text-yellow-600 bg-yellow-500/10 rounded p-2">
              📍 Enable location access to find nearby hospitals
            </p>
          )}
        </form>

        {/* Results */}
        {hospitals.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Found {hospitals.length} results
            </p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {hospitals.map((hospital, idx) => (
                <div
                  key={idx}
                  className="bg-accent rounded-lg p-4 border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        {hospital.name}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" />
                        {hospital.address}
                      </p>
                      {hospital.rating && (
                        <p className="text-sm text-foreground flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          {hospital.rating.toFixed(1)} rating
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hospitals.length === 0 && !isLoading && specialty && (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">No results found. Try a different search.</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Note:</span> This tool helps you find nearby healthcare facilities. Always verify credentials and check reviews before scheduling appointments.
          </p>
        </div>
      </div>
    </Card>
  );
}
