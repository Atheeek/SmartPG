import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatCard = ({ title, value, description, icon: Icon, gradient }) => (
  <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`}></div>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {Icon && (
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      )}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

export default StatCard;