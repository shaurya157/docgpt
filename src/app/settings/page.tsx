import React from 'react';

import { Integrations } from '@/components/settings/integrations';

const SettingsPage = () => {
  const cardClasses = "border rounded-lg shadow-sm overflow-hidden mb-6";
  const cardHeaderClasses = "p-4 border-b bg-gray-50"; // Added subtle background
  const cardTitleClasses = "text-lg font-semibold";
  const cardContentClasses = "p-4";

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className={cardClasses}>
        <div className={cardHeaderClasses}>
          <h2 className={cardTitleClasses}>Integrations</h2>
        </div>
        <div className={cardContentClasses}>
          <Integrations />
        </div>
      </div>

      {/* Add other settings sections here if needed */}
    </div>
  );
};

export default SettingsPage;