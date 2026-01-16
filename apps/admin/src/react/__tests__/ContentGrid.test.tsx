import React from 'react';
import { render, screen } from '@testing-library/react';
import ContentGrid from '../ContentGrid';

const sampleQueue = [
  { page: '/airport-limo', intent: 'Improve CTA', status: 'queued', createdAt: new Date().toISOString(), site: 'airport' },
  { page: 'all', intent: 'Global item', status: 'queued', createdAt: new Date().toISOString(), site: 'all' },
];

const sampleDrafts = [
  { topic: 'Airport CTA refresh', status: 'draft', site: 'airport', updatedAt: new Date().toISOString() },
];

describe('ContentGrid', () => {
  it('renders queue and drafts for airport page', () => {
    render(
      <ContentGrid
        pageKey="airport"
        queue={sampleQueue as any}
        drafts={sampleDrafts as any}
        onQueue={() => {}}
        onDraft={() => {}}
        canQueue={true}
        canDraft={true}
      />
    );

    expect(screen.getByText(/Content — airport/i)).toBeInTheDocument();
    expect(screen.getByText(/Improve CTA|Global item/)).toBeTruthy();
    expect(screen.getByText(/Airport CTA refresh/)).toBeTruthy();
  });
});
