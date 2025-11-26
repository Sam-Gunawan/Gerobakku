export interface Review {
    ratingId: number;
    userId: number;
    storeId: number;
    score: number;  // 1-5
    comment: string;
    reviewerName: string;
    createdAt: Date;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

export interface ReviewSubmission {
    storeId: number;
    score: number;
    comment: string;
}