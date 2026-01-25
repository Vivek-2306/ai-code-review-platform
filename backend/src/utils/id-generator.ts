import { v4 as uuidv4 } from 'uuid';

export function generateReviewId(): string {
    return `review_${uuidv4()}`;
}

export function generateSnippetId(): string {
    return `snippet_${uuidv4()}`;
}

export function generateCommentId(): string {
    return `comment_${uuidv4()}`;
}

export function generateHistoryId(): string {
    return `history_${uuidv4()}`;
}

export function generateMetricsId(): string {
    return `metrics_${uuidv4()}`;
}