import React from "react";

interface CloudWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const CloudWrapper: React.FC<CloudWrapperProps> = ({
  children,
  className,
}) => <div className={`cloud-wrapper ${className}`}>{children}</div>;
