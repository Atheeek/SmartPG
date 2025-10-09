// frontend/src/components/PropertySelector.jsx
import React from 'react';
import { usePropertyContext } from '../context/PropertyContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PropertySelector = () => {
  const { properties, loading, selectedProperty, setSelectedProperty } = usePropertyContext();

  if (loading) {
    return <div>Loading properties...</div>;
  }

  return (
    <Select value={selectedProperty} onValueChange={setSelectedProperty}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a property" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Properties</SelectItem>
        {properties.map(prop => (
          <SelectItem key={prop._id} value={prop._id}>{prop.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PropertySelector;