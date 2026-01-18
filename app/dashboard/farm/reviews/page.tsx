"use client";

import { useEffect, useState } from "react";
import { Star, TrendingUp, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
  business?: {
    name: string;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    // Note: This assumes a reviews API exists. If not, this will show empty state
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // Attempt to fetch reviews - API may not exist yet
      const response = await fetch('/api/reviews?businessOwner=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        
        // Calculate average rating
        if (data.reviews && data.reviews.length > 0) {
          const avg = data.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / data.reviews.length;
          setAverageRating(avg);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0,
  }));

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h1>
        <p className="text-gray-600 mt-1">See what customers are saying about your farm</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Average Rating</span>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {averageRating > 0 ? averageRating.toFixed(1) : '—'}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Reviews</span>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-gray-900">{reviews.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Positive Reviews</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {reviews.length > 0 ? Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Rating Distribution</h2>
        <div className="space-y-3">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-4">
              <div className="flex items-center gap-1 w-20">
                <span className="font-medium">{rating}</span>
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
        
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">
              Reviews from customers will appear here once they visit your farm or purchase your products
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{review.user.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-700">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
