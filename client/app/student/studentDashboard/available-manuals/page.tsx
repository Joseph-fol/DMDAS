'use client';

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterTabs } from './components/FilterTabs';
import { ManualCard } from './components/ManualCard';
import { EmptyState } from './components/EmptyState';
import { KeycodeModal } from './components/KeycodeModal';
import { INITIAL_MANUALS } from './data/manual';
import { Manual, FilterTab } from './data/manual';

export default function Page() {
  const [manuals, setManuals] = useState<Manual[]>(INITIAL_MANUALS);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);

  // Tab counts
  const counts = useMemo(() => {
    return {
      All: manuals.length,
      Paid: manuals.filter((m) => m.paymentStatus === 'Paid').length,
      'Ready for Pickup': manuals.filter((m) => m.pickupStatus === 'Ready for Pickup').length,
      Collected: manuals.filter((m) => m.pickupStatus === 'Collected').length,
      Failed: manuals.filter((m) => m.pickupStatus === 'Failed').length,
    };
  }, [manuals]);

  // Filtered manuals based on active tab
  const filteredManuals = useMemo(() => {
    switch (activeTab) {
      case 'Paid':
        return manuals.filter((m) => m.paymentStatus === 'Paid');
      case 'Ready for Pickup':
        return manuals.filter((m) => m.pickupStatus === 'Ready for Pickup');
      case 'Collected':
        return manuals.filter((m) => m.pickupStatus === 'Collected');
      case 'Failed':
        return manuals.filter((m) => m.pickupStatus === 'Failed');
      case 'All':
      default:
        return manuals;
    }
  }, [manuals, activeTab]);

  const handleAddManual = (newManual: Manual) => {
    setManuals((prev) => [newManual, ...prev]);
    setActiveTab('All');
  };

  const handleBrowseManuals = () => {
    setIsPurchaseOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-2 sm:py-5 px-2 sm:px-6 lg:px-0 max-w-7xl mx-auto">
      {/* Top Header */}
      <Header onPurchaseClick={() => setIsPurchaseOpen(true)} />

      {/* Filter Tabs Navigation */}
      <FilterTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />

      {/* Manuals Grid or Empty State */}
      {filteredManuals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredManuals.map((manual) => (
            <ManualCard
              key={manual.id}
              manual={manual}
              onShowKeycode={(m) => setSelectedManual(m)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onBrowse={handleBrowseManuals} />
      )}

      {/* Keycode Details Modal */}
      <KeycodeModal
        manual={selectedManual}
        onClose={() => setSelectedManual(null)}
      />

      {/* Purchase / Add Manual Modal */}
      {/* <PurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        onAddManual={handleAddManual}
      /> */}
    </main>
  );
}
