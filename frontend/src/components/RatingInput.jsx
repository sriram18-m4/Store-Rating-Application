import { Star } from 'lucide-react';

export default function RatingInput({ value, onChange, disabled }) {
  return (
    <div className="rating-input" role="radiogroup" aria-label="Store rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          className={Number(value) >= rating ? 'selected' : ''}
          onClick={() => onChange(rating)}
          disabled={disabled}
          aria-label={`${rating} star rating`}
        >
          <Star size={18} fill="currentColor" />
        </button>
      ))}
    </div>
  );
}
