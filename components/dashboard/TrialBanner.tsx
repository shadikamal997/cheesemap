'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface TrialInfo {
  isInTrial: boolean;
  trialStartAt: string | null;
  trialEndAt: string | null;
  daysRemaining: number;
  showReminder: boolean;
  planName: string;
  planPrice: number;
  status: string;
}

interface TrialBannerProps {
  businessId: string;
  onCancel?: () => void;
}

export default function TrialBanner({ businessId, onCancel }: TrialBannerProps) {
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        const response = await fetch(`/api/businesses/${businessId}/trial`);
        if (!response.ok) throw new Error('Failed to fetch trial status');
        const data = await response.json();
        setTrialInfo(data.trial);
      } catch (err) {
        console.error('Error fetching trial status:', err);
        setError('Could not load trial information');
      } finally {
        setLoading(false);
      }
    };

    fetchTrialStatus();
  }, [businessId]);

  const handleCancelTrial = async () => {
    if (!confirm('Êtes-vous sûr ? Votre accès continuera jusqu\'à la fin de la période d\'essai.')) {
      return;
    }

    setCanceling(true);
    try {
      const response = await fetch(`/api/businesses/${businessId}/trial`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to cancel trial');

      setTrialInfo((prev) =>
        prev ? { ...prev, isInTrial: false, status: 'CANCELLED' } : null
      );

      if (onCancel) onCancel();
    } catch (err) {
      console.error('Error canceling trial:', err);
      setError('Impossible d\'annuler l\'essai');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return null;
  if (error) return null;
  if (!trialInfo) return null;

  // Not in trial
  if (!trialInfo.isInTrial) {
    if (trialInfo.status === 'CANCELLED') {
      return (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Essai annulé</h3>
              <p className="text-sm text-amber-800 mt-1">
                Votre période d'essai a été annulée. Veuillez activer votre abonnement pour continuer.
              </p>
              <Link
                href="/dashboard/billing"
                className="inline-block mt-3 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition"
              >
                Activer l'abonnement
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  // In trial
  const isWarning = trialInfo.daysRemaining <= 7;

  return (
    <div
      className={`mb-6 rounded-lg border p-4 ${
        isWarning
          ? 'border-red-200 bg-red-50'
          : 'border-blue-200 bg-blue-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <Clock className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
          isWarning ? 'text-red-600' : 'text-blue-600'
        }`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${
            isWarning ? 'text-red-900' : 'text-blue-900'
          }`}>
            ⏳ Essai gratuit - {trialInfo.daysRemaining} jour{trialInfo.daysRemaining !== 1 ? 's' : ''} restant{trialInfo.daysRemaining !== 1 ? 's' : ''}
          </h3>
          <p className={`text-sm mt-1 ${
            isWarning ? 'text-red-800' : 'text-blue-800'
          }`}>
            Vous utilisez le plan <strong>{trialInfo.planName}</strong> (€{trialInfo.planPrice}/mois) sans frais.
            {isWarning && ' Préparez-vous à activer votre abonnement.'}
          </p>

          {trialInfo.trialEndAt && (
            <p className={`text-xs mt-2 ${
              isWarning ? 'text-red-700' : 'text-blue-700'
            }`}>
              Expiration: {new Date(trialInfo.trialEndAt).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCancelTrial}
              disabled={canceling}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition ${
                isWarning
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <XCircle className="w-4 h-4" />
              {canceling ? 'Annulation...' : 'Annuler l\'essai'}
            </button>
            <Link
              href="/dashboard/billing"
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition ${
                isWarning
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Activer l'abonnement
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
