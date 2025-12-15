
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { AnalysisResult } from '../types';
import { Classification } from '../types';

interface DashboardProps {
  history: AnalysisResult[];
}

const COLORS = {
  [Classification.REAL]: '#16a34a', // green-600
  [Classification.FAKE]: '#dc2626', // red-600
};

export const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const data = React.useMemo(() => {
    const counts = history.reduce((acc, current) => {
      acc[current.classification] = (acc[current.classification] || 0) + 1;
      return acc;
    }, {} as Record<Classification, number>);

    return Object.entries(counts).map(([name, value]) => ({
      name: name as Classification,
      value,
    }));
  }, [history]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Session Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Analysis Breakdown</h3>
          <p className="text-gray-500 mb-4">
            A summary of all articles analyzed in this session.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                <span className="font-medium text-green-800">Real News Detections</span>
                <span className="font-bold text-lg text-green-600">{data.find(d => d.name === Classification.REAL)?.value || 0}</span>
            </div>
             <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg">
                <span className="font-medium text-red-800">Fake News Detections</span>
                <span className="font-bold text-lg text-red-600">{data.find(d => d.name === Classification.FAKE)?.value || 0}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                <span className="font-medium text-gray-800">Total Analyzed</span>
                <span className="font-bold text-lg text-gray-600">{history.length}</span>
            </div>
          </div>
        </div>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
