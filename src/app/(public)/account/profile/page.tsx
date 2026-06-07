"use client";

import { currentUser } from "@/data/users";

export default function AccountProfilePage() {
  return (
    <div className="max-w-xl">
      <h2 className="font-serif text-2xl font-bold mb-6">Profile</h2>
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center font-serif text-xl font-bold">
            {currentUser.name.split(" ").map(s => s[0]).join("")}
          </div>
          <div>
            <p className="font-semibold">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">Member since {new Date(currentUser.joinedAt).getFullYear()}</p>
          </div>
        </div>
        {[["Full name", currentUser.name], ["Email", currentUser.email], ["Phone", currentUser.phone]].map(([l, v]) => (
          <label key={l} className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{l}</span>
            <input defaultValue={v} className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm" />
          </label>
        ))}
        <button className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-semibold cursor-pointer">Save changes</button>
      </div>
    </div>
  );
}
