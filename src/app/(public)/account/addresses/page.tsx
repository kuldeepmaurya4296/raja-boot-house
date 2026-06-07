"use client";

import { currentUser } from "@/data/users";
import { MapPin, Plus } from "lucide-react";

export default function AccountAddressesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-2xl font-bold">Addresses</h2>
        <button className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {currentUser.addresses.map(a => (
          <div key={a.id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cognac" />
                <span className="font-semibold">{a.label}</span>
              </div>
              {a.default && <span className="text-[10px] uppercase font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>}
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {a.line1}<br />
              {a.city}, {a.state} {a.zip}<br />
              {a.country}
            </p>
            <div className="mt-4 flex gap-2 text-xs">
              <button className="underline font-semibold cursor-pointer">Edit</button>
              <button className="underline text-destructive cursor-pointer">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
