import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = true,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`bg-surface border border-border rounded-lg p-6 transition-all duration-150 ${
        hoverable ? "hover:-translate-y-0.5 hover:shadow-md hover:border-border-strong" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface AgentCardProps extends CardProps {
  agentColor?: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  children,
  agentColor = "var(--accent)",
  className = "",
  ...props
}) => {
  return (
    <Card
      className={`relative overflow-hidden pt-7 ${className}`}
      {...props}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ backgroundColor: agentColor }}
      />
      {children}
    </Card>
  );
};
