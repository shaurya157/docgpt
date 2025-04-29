import { useEffect, useState } from 'react';

import { Info } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/plate-ui/tooltip';
import { subscribeToChatTokenUsage } from '@/firebase/firestore-dao';

// Example Pricing Data (per 1 Million Tokens in USD)
// NOTE: These might need adjustment and should be updated if official pricing changes.
const MODEL_PRICING = {
  // Deepseek
  'deepseek-chat': { input: 0.14, output: 0.28 },
  'deepseek-reasoner': { input: 0.14, output: 0.28 },
  // Google
  'gemini-1.5-flash-latest': { input: 0.075, output: 0.30 }, // <=128k context
  'gemini-1.5-pro-latest': { input: 1.25, output: 5.00 }, // <=128k context
  // OpenAI
  'gpt-4o': { input: 5.00, output: 15.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'o1': { input: 15.00, output: 60.00 },
  // Add other models as needed...
};

// Type for calculated totals including cost
type TokenTotalsByModelAndCost = {
  [modelName: string]: {
    cost: number;
    input: number;
    output: number;
  };
};

interface TokenUsageProps {
  chatId: string | undefined;
}

export const TokenUsage = ({ chatId }: TokenUsageProps) => {
  const [tokenTotals, setTokenTotals] = useState<TokenTotalsByModelAndCost>({});

  // --- Real-time Token Usage Subscription ---
  useEffect(() => {
    // Don't subscribe if chatId is missing or in production (as per original logic)
    if (!chatId || process.env.NODE_ENV === 'production') {
      setTokenTotals({}); // Clear totals
      return;
    }

    const unsubscribe = subscribeToChatTokenUsage(chatId, (tokensUsed) => {
      if (tokensUsed) {
        const totals: TokenTotalsByModelAndCost = {};
        tokensUsed.forEach(nodeEntry => {
          nodeEntry.models.forEach(modelEntry => {
            const modelName = modelEntry.model;
            if (!totals[modelName]) {
              totals[modelName] = { cost: 0, input: 0, output: 0 };
            }
            const inputTokens = modelEntry.inputTokens || 0;
            const outputTokens = modelEntry.outputTokens || 0;

            totals[modelName].input += inputTokens;
            totals[modelName].output += outputTokens;

            const pricing = MODEL_PRICING[modelName];
            if (pricing) {
              const inputCost = (inputTokens / 1_000_000) * pricing.input;
              const outputCost = (outputTokens / 1_000_000) * pricing.output;
              totals[modelName].cost += inputCost + outputCost;
            } else {
              console.warn(`Pricing not found for model: ${modelName}`);
            }
          });
        });
        setTokenTotals(totals);
      } else {
        setTokenTotals({});
      }
    });

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  // Don't render anything if there are no totals
  if (Object.keys(tokenTotals).length === 0) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-600">
            <Info size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          className="text-xs bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-md shadow-lg z-[51]"
          align="start"
          side="bottom"
        >
          <div className="font-semibold mb-2">Token Usage (Total):</div>
          {(() => { // IIFE to calculate totals before rendering table
            let totalInput = 0;
            let totalOutput = 0;
            let totalCost = 0;
            Object.values(tokenTotals).forEach(totals => {
              totalInput += totals.input;
              totalOutput += totals.output;
              totalCost += totals.cost;
            });

            return (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-blue-400 border-opacity-50">
                    <th className="pb-1 pr-4 font-medium">Model</th>
                    <th className="pb-1 pr-4 font-medium text-right">Input</th>
                    <th className="pb-1 pr-4 font-medium text-right">Output</th>
                    <th className="pb-1 font-medium text-right">Cost (Est.)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(tokenTotals).map(([model, totals]: [string, { cost: number; input: number; output: number; }]) => (
                    <tr key={model}>
                      <td className="pt-1 pr-4">{model}</td>
                      <td className="pt-1 pr-4 text-right">{totals.input.toLocaleString()}</td>
                      <td className="pt-1 pr-4 text-right">{totals.output.toLocaleString()}</td>
                      <td className="pt-1 text-right">${(Math.ceil(totals.cost * 10000) / 10000).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-blue-400 border-opacity-50 font-semibold">
                    <td className="pt-1 pr-4">Total</td>
                    <td className="pt-1 pr-4 text-right">{totalInput.toLocaleString()}</td>
                    <td className="pt-1 pr-4 text-right">{totalOutput.toLocaleString()}</td>
                    <td className="pt-1 text-right">${(Math.ceil(totalCost * 10000) / 10000).toFixed(3)}</td>
                  </tr>
                </tfoot>
              </table>
            );
          })()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TokenUsage;
