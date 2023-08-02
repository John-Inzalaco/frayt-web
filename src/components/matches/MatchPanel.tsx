import { useState } from 'react';
import DetailsSection from './sections/DetailsSection';
import CargoSection from './sections/CargoSection';
import DeliveryNotesSection from './sections/DeliveryNotesSection';
import DocumentsSection from './sections/DocumentsSection';
import PricingBreakdownSection from './sections/PricingBreakdownSection';
import 'moment-timezone';
import { Match } from '../../lib/actions/MatchAction';

enum MatchSection {
  Details,
  Cargo,
  DeliveryNotes,
  Documents,
  PricingBreakdown,
}

type MatchPanelProps = {
  match: Match;
};

export default function MatchPanel({ match }: MatchPanelProps) {
  const defaultPanel = MatchSection.Details;
  const [activePanel, setActivePanel] = useState<MatchSection>(defaultPanel);

  const showMore = (panel: MatchSection) => () => setActivePanel(panel);
  const goBack = () => setActivePanel(defaultPanel);
  const isActive = (panel: MatchSection) => activePanel === panel;

  return (
    <div>
      <DetailsSection match={match} isActive={isActive(MatchSection.Details)} />
      <CargoSection
        match={match}
        goBack={goBack}
        showMore={showMore(MatchSection.Cargo)}
        isActive={isActive(MatchSection.Cargo)}
      />
      <PricingBreakdownSection
        match={match}
        goBack={goBack}
        showMore={showMore(MatchSection.PricingBreakdown)}
        isActive={isActive(MatchSection.PricingBreakdown)}
      />
      <DeliveryNotesSection
        match={match}
        goBack={goBack}
        showMore={showMore(MatchSection.DeliveryNotes)}
        isActive={isActive(MatchSection.DeliveryNotes)}
      />
      <DocumentsSection
        match={match}
        goBack={goBack}
        showMore={showMore(MatchSection.Documents)}
        isActive={isActive(MatchSection.Documents)}
      />
    </div>
  );
}
