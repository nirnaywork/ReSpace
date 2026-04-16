import React from 'react';
import ListingCard from './ListingCard';
import { ListingCardSkeleton } from '../ui/Skeleton';
import { Search, Filter } from 'lucide-react';

const ListingGrid = ({
  listings = [],
  loading = false,
  aiMatchedIds = [],
  aiReasoning = '',
  emptyMessage = "No spaces found.",
  emptyAction,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <Search className="w-8 h-8 text-brand-muted" />
        </div>
        <h3 className="text-h3 text-brand-dark mb-2">No spaces found</h3>
        <p className="text-brand-muted text-sm max-w-md">
          {emptyMessage} Try adjusting your filters or search terms.
        </p>
        {emptyAction && <div className="mt-6">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard
          key={listing._id}
          listing={listing}
          aiMatch={aiMatchedIds.includes(listing._id)}
          aiReasoning={aiMatchedIds.includes(listing._id) ? aiReasoning : ''}
        />
      ))}
    </div>
  );
};

export default ListingGrid;
