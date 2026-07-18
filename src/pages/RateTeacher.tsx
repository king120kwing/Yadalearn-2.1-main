import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function RateTeacher() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    
    setIsSubmitting(true);
    // Mock saving the rating
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    
    alert("Thank you for your feedback!");
    navigate('/student-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-zinc-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">star</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Rate Your Session</h1>
          <p className="text-gray-500 dark:text-zinc-400">How was your class? Your feedback helps us improve.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
              >
                <span className={`material-symbols-outlined text-4xl ${
                  (hoverRating || rating) >= star 
                    ? 'text-yellow-400 filled' 
                    : 'text-gray-300 dark:text-zinc-700'
                }`} style={{ fontVariationSettings: (hoverRating || rating) >= star ? "'FILL' 1" : "'FILL' 0" }}>
                  star
                </span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you enjoy? What could be better?"
              rows={4}
              className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/student-dashboard')}
            className="w-full bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 font-bold py-3.5 rounded-xl transition-colors"
          >
            Skip
          </button>
        </form>
      </div>
    </div>
  );
}
