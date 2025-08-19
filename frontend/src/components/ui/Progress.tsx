import * as React from 'react';

export const Progress: React.FC<{ value?: number }> = ({ value }) => {
  return <progress value={value} max={100} />;
};
